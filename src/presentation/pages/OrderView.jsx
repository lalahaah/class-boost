import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, Upload, Check, Printer } from 'lucide-react';
import { PRICING } from '../../core/constants';
import { PartnerRepository } from '../../data/PartnerRepository';
import { OrderRepository } from '../../data/OrderRepository';
import { StorageService } from '../../data/StorageService';
import { useDialog } from '../components/DialogProvider';
import { usePartnerAuth } from '../hooks/usePartnerAuth';
import PartnerAuthForm from '../components/PartnerAuthForm';
import OrderItemCart from '../components/order/OrderItemCart';
import OrderSummaryCard from '../components/order/OrderSummaryCard';

function calculateTotals(items) {
    let hasUnpricedCustom = false;
    let productTotal = 0;
    let totalQty = 0;

    items.forEach(item => {
        totalQty += item.qty;
        if (item.size === 'CUSTOM') {
            if (item.customPrice !== undefined && item.customPrice !== null) productTotal += item.customPrice * item.qty;
            else hasUnpricedCustom = true;
        } else {
            productTotal += (PRICING[item.size] || 0) * item.qty;
        }
    });

    const requiredBoxes = Math.ceil(totalQty / 3);
    const shippingFee = totalQty > 0 ? requiredBoxes * 8000 : 0;
    const finalTotal = hasUnpricedCustom ? null : Math.floor(productTotal + shippingFee);

    return {
        productTotal: hasUnpricedCustom ? null : productTotal,
        shippingFee,
        finalTotal,
        hasUnpricedCustom,
        totalQty,
        requiredBoxes
    };
}

function generateQuoteHtml(academyName, items, totals) {
    const today = new Date().toLocaleDateString('ko-KR');
    const supplyPrice = totals.productTotal + totals.shippingFee;
    const grandTotal = totals.hasUnpricedCustom ? 0 : Math.floor(supplyPrice);

    const itemsHtml = items.map((item, index) => {
        const sizeStr = item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (별도 규격)` : item.size;
        const isCustom = item.size === 'CUSTOM';
        const priceStr = isCustom ? '별도산정' : (PRICING[item.size]).toLocaleString();
        const amountStr = isCustom ? '별도산정' : (PRICING[item.size] * item.qty).toLocaleString();
        return `<tr>
          <td style="text-align:center;padding:10px;border:1px solid #cbd5e1;">${index + 1}</td>
          <td style="padding:10px;border:1px solid #cbd5e1;">자석 현수막 / 홍보물 (${sizeStr})</td>
          <td style="text-align:center;padding:10px;border:1px solid #cbd5e1;">${item.qty}</td>
          <td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${priceStr}</td>
          <td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${amountStr}</td>
        </tr>`;
    }).join('');

    return `<html><head><title>견적서 - ${academyName}</title>
      <style>
        body{font-family:'Malgun Gothic','맑은 고딕',sans-serif;padding:40px;color:#1e293b;}
        .header{text-align:center;margin-bottom:40px;}
        .header h1{font-size:36px;letter-spacing:15px;text-decoration:underline;margin-bottom:10px;}
        .info-table{width:100%;margin-bottom:30px;border-collapse:collapse;}
        .info-table td{padding:5px;vertical-align:top;}
        .provider-box{border:2px solid #1e293b;padding:15px;border-radius:8px;}
        .item-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;}
        .item-table th,.item-table td{border:1px solid #cbd5e1;padding:10px;}
        .item-table th{background-color:#f1f5f9;font-weight:bold;text-align:center;}
        .total-box{background-color:#f8fafc;border:2px solid #1e293b;padding:20px;text-align:center;font-size:24px;font-weight:bold;margin-bottom:30px;}
        @media print{@page{margin:15mm;}body{padding:0;}button{display:none;}}
      </style></head>
      <body>
        <div style="text-align:right;margin-bottom:20px;">
          <button onclick="window.print()" style="padding:10px 20px;background:#f97316;color:white;border:none;border-radius:5px;font-weight:bold;cursor:pointer;font-size:16px;">🖨️ 인쇄 또는 PDF로 저장하기</button>
        </div>
        <div class="header"><h1>견적서</h1></div>
        <table class="info-table"><tr>
          <td style="width:50%;">
            <div style="font-size:24px;font-weight:bold;margin-bottom:10px;border-bottom:2px solid #1e293b;display:inline-block;padding-bottom:5px;">${academyName} 귀하</div>
            <div style="margin-top:10px;"><strong>견적일자:</strong> ${today}</div>
            <div style="margin-top:5px;">아래와 같이 견적합니다.</div>
          </td>
          <td style="width:50%;">
            <div class="provider-box">
              <table style="width:100%;font-size:14px;line-height:1.6;">
                <tr><td style="width:80px;font-weight:bold;">공급자</td><td>주식회사 아임오케이 (imokayy Co., Ltd.)</td></tr>
                <tr><td style="font-weight:bold;">사업자번호</td><td>841-88-02576</td></tr>
                <tr><td style="font-weight:bold;">대표이사</td><td>손미선 <span style="position:relative;display:inline-block;margin-left:10px;">(인)<img src="/seal.png" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:45px;height:45px;opacity:0.9;" /></span></td></tr>
                <tr><td style="font-weight:bold;">주소</td><td>경기도 화성시 동탄기흥로 585, 201동 207호</td></tr>
                <tr><td style="font-weight:bold;">고객센터</td><td>010-5955-4936</td></tr>
              </table>
            </div>
          </td>
        </tr></table>
        ${totals.hasUnpricedCustom
            ? `<div style="color:#ea580c;font-weight:bold;margin-bottom:20px;text-align:center;border:1px solid #ea580c;padding:15px;background:#fff7ed;">* 직접 입력하신 규격이 포함되어 있어, 정확한 총 합계 금액은 담당자 확인 후 재안내 드립니다.</div>`
            : `<div class="total-box">합계금액: ₩ ${grandTotal.toLocaleString()} (VAT 별도)</div>`}
        <table class="item-table">
          <thead><tr>
            <th style="width:50px;">No.</th><th>품목 및 규격</th>
            <th style="width:60px;">수량</th><th style="width:120px;">단가(원)</th><th style="width:120px;">공급가액(원)</th>
          </tr></thead>
          <tbody>
            ${itemsHtml}
            <tr><td colspan="4" style="text-align:right;padding:10px;border:1px solid #cbd5e1;font-weight:bold;background-color:#f8fafc;">배송비 (포장비 포함)</td><td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${totals.shippingFee.toLocaleString()}</td></tr>
            ${!totals.hasUnpricedCustom ? `<tr style="background-color:#f8fafc;font-weight:bold;"><td colspan="4" style="text-align:right;padding:10px;border:1px solid #cbd5e1;">최종 합계 (VAT 별도)</td><td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">₩ ${grandTotal.toLocaleString()}</td></tr>` : ''}
          </tbody>
        </table>
        <div style="margin-top:20px;font-size:13px;color:#64748b;">
          <p>* 본 견적서의 유효기간은 발행일로부터 15일입니다.</p>
          <p>* 디자인 난이도 및 추가 요청사항에 따라 최종 금액이 변동될 수 있습니다.</p>
        </div>
        <div style="text-align:right;margin-top:50px;"><p>감사합니다.</p><h2 style="margin-top:10px;color:#1e293b;">클래스부스트 (아임오케이)</h2></div>
      </body></html>`;
}

export default function OrderView() {
    const navigate = useNavigate();
    const { showAlert } = useDialog();

    const [items, setItems] = useState([{ id: Date.now(), size: '3400*400', customWidth: '', customHeight: '', qty: 1 }]);
    const [academyName, setAcademyName] = useState('');
    const [phone, setPhone] = useState('');
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const auth = usePartnerAuth({
        onLogin: (partner) => {
            if (partner.academyName) setAcademyName(partner.academyName);
            if (partner.phone) setPhone(partner.phone);
        }
    });

    const totals = calculateTotals(items);

    const addItem = () => setItems(prev => [...prev, { id: Date.now(), size: '3400*400', customWidth: '', customHeight: '', qty: 1 }]);
    const updateItem = (id, field, value) => setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev);

    const handlePrintQuote = (e) => {
        if (e) e.preventDefault();
        if (!academyName) {
            showAlert("견적서에 표기될 '학원명'을 먼저 입력해주세요.", '알림');
            return;
        }
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(generateQuoteHtml(academyName, items, totals));
        printWindow.document.close();
        printWindow.focus();
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

        const validFiles = [];
        const oversizedFiles = [];

        for (const file of newFiles) {
            if (file.size > MAX_FILE_SIZE) {
                oversizedFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
            } else {
                validFiles.push(file);
            }
        }

        if (oversizedFiles.length > 0) {
            showAlert(
                `다음 파일들이 50MB를 초과했습니다:\n${oversizedFiles.join('\n')}\n\n용량을 줄인 후 다시 시도해주세요.`,
                '파일 크기 초과'
            );
        }

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleSubmit = async () => {
        if (files.length === 0) { await showAlert("원본/디자인 파일 첨부는 필수입니다.", '확인'); return; }
        for (const item of items) {
            if (item.size === 'CUSTOM' && (!item.customWidth || !item.customHeight)) {
                await showAlert("직접 입력 사이즈를 정확히 입력해주세요.", '확인'); return;
            }
        }

        try {
            setIsUploading(true);
            const downloadURLs = await Promise.all(files.map(f => StorageService.uploadFile(f, 'design_files')));
            await OrderRepository.createOrder({
                academyName,
                phone,
                partnerId: auth.partnerId,
                items,
                designRequestText: text,
                designFileUrls: downloadURLs,
                total: totals.hasUnpricedCustom ? '담당자 확인 중' : totals.finalTotal,
                shippingFee: totals.shippingFee,
                status: 'NEW'
            });
            setIsSubmitted(true);
        } catch (error) {
            showAlert(error?.message || '주문 처리 중 오류가 발생했습니다.', '오류');
        } finally {
            setIsUploading(false);
        }
    };

    if (!auth.isAuthorized) {
        return (
            <PartnerAuthForm
                subtitle="경쟁력 있는 단가 제공과 발주를 위해<br /><span class='text-slate-400'>사전 승인된 파트너에게만 견적을 공개합니다.</span>"
                submitLabel="인증하고 견적 확인하기"
                {...auth}
            />
        );
    }

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-green-100">
                    <Check className="h-10 w-10 text-green-600 stroke-[3]" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                    {totals.hasUnpricedCustom ? '신규 접수가 완료되었습니다!' : '디자인 시안 요청 완료!'}
                </h2>
                <p className="text-slate-600 mb-10 text-lg font-medium leading-relaxed whitespace-pre-line">
                    {totals.hasUnpricedCustom
                        ? '요청하신 [직접 입력] 규격의 단가를 담당자가 확인 중입니다.\n확인이 완료되면 문자로 안내해 드리며, 관리자 페이지에서 진행 상태를 확인하실 수 있습니다.'
                        : '아임오케이를 이용해주셔서 감사합니다!\n시안이 완성되면 문자로 안내해 드리며, 관리자 페이지에서 확인하실 수 있습니다.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!totals.hasUnpricedCustom && (
                        <button type="button" onClick={handlePrintQuote} className="cursor-pointer bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                            <Printer className="w-5 h-5 mr-2" /> 견적서 PDF 다운로드
                        </button>
                    )}
                    <button type="button" onClick={() => navigate('/tracking')} className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center min-w-[200px]">
                        관리자 페이지로 가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 sm:px-6">
            {/* Header */}
            <div className="mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center mb-6 md:mb-0 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-2xl flex items-center justify-center mr-4 md:mr-6 border border-orange-200 shadow-sm shrink-0">
                        <Calculator className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">간편 견적 및 디자인 요청 폼</h2>
                        <p className="text-slate-500 font-medium text-xs md:text-base">필요한 품목을 장바구니에 담아 견적을 산출하세요.</p>
                    </div>
                </div>
                <div className="text-sm border border-slate-200 bg-slate-50 px-5 py-3 rounded-xl flex items-center shadow-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-slate-500 mr-2 font-medium">파트너 코드:</span>
                    <span className="font-bold text-slate-900 tracking-wider">{auth.authCode.toUpperCase()}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6 w-full">
                    {/* 기본 정보 */}
                    <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-base md:text-lg font-bold mb-6 text-slate-900 flex items-center tracking-tight">
                            <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>기본 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">학원명</label>
                                <input required type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition-colors" value={academyName} onChange={(e) => setAcademyName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">담당자 연락처</label>
                                <input required type="tel" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => { if (auth.partnerId && phone) PartnerRepository.updatePartnerPhone(auth.partnerId, phone).catch(() => {}); }} />
                            </div>
                        </div>
                    </div>

                    <OrderItemCart items={items} totals={totals} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />

                    {/* 요청사항 및 파일 업로드 */}
                    <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-base md:text-lg font-bold mb-6 text-slate-900 flex items-center tracking-tight">
                            <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>요청사항 및 파일 업로드
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">디자인 요청사항</label>
                                <textarea required className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none h-28 bg-slate-50 focus:bg-white transition-colors" placeholder="예: 문구 변경, 컬러 변경 등 원하는 디자인 방향을 상세히 적어주세요." value={text} onChange={(e) => setText(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">파일 첨부 (필수)</label>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 relative hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <input type="file" multiple required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${files.length > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {files.length > 0 ? <CheckCircle className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                                        </div>
                                        <p className={`font-bold text-lg mb-1 ${files.length > 0 ? 'text-green-700' : 'text-slate-900'}`}>{files.length > 0 ? `${files.length}개 파일 첨부됨` : '디자인 원본 파일 업로드'}</p>
                                        {files.length === 0 && <p className="text-sm text-slate-500">클릭하거나 파일을 이 영역으로 드래그하세요. (ai, psd, pdf, zip)</p>}
                                        {files.length > 0 && (
                                            <ul className="mt-3 space-y-1 text-sm text-slate-600 text-left w-full max-w-xs">
                                                {files.map((f, i) => (
                                                    <li key={i} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                                                        <span className="truncate">{f.name}</span>
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="shrink-0 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold">✕</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <OrderSummaryCard
                    items={items}
                    totals={totals}
                    authCode={auth.authCode}
                    isUploading={isUploading}
                    onSubmit={handleSubmit}
                    onPrintQuote={handlePrintQuote}
                />
            </div>
        </div>
    );
}
