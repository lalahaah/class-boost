import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator, Upload, AlertCircle, ShieldCheck, Lock, KeyRound, Search,
    Star, CheckCircle, Trash2, Plus, Check, Printer
} from 'lucide-react';
import { PRICING, MAIN_BANNER_SIZES, DATE_BANNER_SIZES, PROMO_SIZES } from '../../core/constants';
import { PartnerRepository } from '../../data/PartnerRepository';
import { OrderRepository } from '../../data/OrderRepository';
import { StorageService } from '../../data/StorageService';

export default function OrderView() {
    const navigate = useNavigate();
    const [partnerRequests, setPartnerRequests] = useState([]);

    useEffect(() => {
        const unsubscribe = PartnerRepository.subscribeToPartners((data) => {
            setPartnerRequests(data);
        });
        return () => unsubscribe();
    }, []);

    const [authCode, setAuthCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [authMode, setAuthMode] = useState('login');
    const [inquiryData, setInquiryData] = useState({ academyName: '', phone: '' });

    const [items, setItems] = useState([{ id: Date.now(), size: '3400*400', customWidth: '', customHeight: '', qty: 1 }]);
    const [academyName, setAcademyName] = useState('');
    const [phone, setPhone] = useState('');
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const calculateTotals = (cartItems) => {
        let hasUnpricedCustom = false;
        let productTotal = 0;
        let totalQty = 0;

        cartItems.forEach(item => {
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

        return {
            productTotal: hasUnpricedCustom ? null : productTotal,
            shippingFee,
            finalTotal: hasUnpricedCustom ? null : productTotal + shippingFee,
            hasUnpricedCustom, totalQty, requiredBoxes
        };
    };

    const totals = calculateTotals(items);
    const getFinalSizeString = (item) => item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (직접입력)` : item.size;

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (authCode.toUpperCase() === 'VIP2026' || partnerRequests.some(p => p.code === authCode.toUpperCase())) {
            setIsAuthorized(true);
            setAuthError('');
        } else {
            setAuthError('유효하지 않은 파트너 코드입니다. 아임오케이에 문의해주세요.');
        }
    };

    const handleRequestPartner = async (e) => {
        e.preventDefault();
        try {
            await PartnerRepository.createPartnerRequest({
                academyName: inquiryData.academyName,
                phone: inquiryData.phone
            });
            alert(`[접수 완료] ${inquiryData.academyName} 원장님, 파트너 신청이 완료되었습니다.\n담당자가 확인 후 기재하신 연락처로 코드를 발급해 드립니다.`);
            setAuthMode('login');
            setInquiryData({ academyName: '', phone: '' });
        } catch (error) {
            console.error(error);
            alert('신청 중 오류가 발생했습니다.');
        }
    };

    const addItem = () => setItems([...items, { id: Date.now(), size: '3400*400', customWidth: '', customHeight: '', qty: 1 }]);
    const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));

    const handlePrintQuote = (e) => {
        e.preventDefault();

        if (!academyName) {
            alert("견적서에 표기될 '학원명'을 먼저 입력해주세요.");
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const today = new Date().toLocaleDateString('ko-KR');

        const supplyPrice = totals.productTotal + totals.shippingFee;
        const vat = totals.hasUnpricedCustom ? 0 : Math.floor(supplyPrice * 0.1);
        const grandTotal = totals.hasUnpricedCustom ? 0 : supplyPrice + vat;

        const itemsHtml = items.map((item, index) => {
            const sizeStr = item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (별도제작)` : item.size;
            const isCustom = item.size === 'CUSTOM';
            const priceStr = isCustom ? '별도산정' : (PRICING[item.size]).toLocaleString();
            const amountStr = isCustom ? '별도산정' : (PRICING[item.size] * item.qty).toLocaleString();

            return `
        <tr>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">자석 현수막 / 홍보물 (${sizeStr})</td>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${item.qty}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${priceStr}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${amountStr}</td>
        </tr>
      `;
        }).join('');

        const html = `
      <html>
        <head>
          <title>견적서 - ${academyName}</title>
          <style>
            body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 36px; letter-spacing: 15px; text-decoration: underline; margin-bottom: 10px; }
            .info-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .info-table td { padding: 5px; vertical-align: top; }
            .provider-box { border: 2px solid #1e293b; padding: 15px; border-radius: 8px; }
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            .item-table th, .item-table td { border: 1px solid #cbd5e1; padding: 10px; }
            .item-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
            .total-box { background-color: #f8fafc; border: 2px solid #1e293b; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            @media print {
              @page { margin: 15mm; }
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px;">
              🖨️ 인쇄 또는 PDF로 저장하기
            </button>
          </div>
          <div class="header"><h1>견적서</h1></div>
          <table class="info-table">
            <tr>
              <td style="width: 50%;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #1e293b; display: inline-block; padding-bottom: 5px;">
                  ${academyName} 귀하
                </div>
                <div style="margin-top: 10px;"><strong>견적일자:</strong> ${today}</div>
                <div style="margin-top: 5px;">아래와 같이 견적합니다.</div>
              </td>
              <td style="width: 50%;">
                <div class="provider-box">
                  <table style="width:100%; font-size: 14px; line-height: 1.6;">
                    <tr><td style="width: 80px; font-weight: bold;">공급자</td><td>주식회사 아임오케이</td></tr>
                    <tr><td style="font-weight: bold;">사업자번호</td><td>000-00-00000</td></tr>
                    <tr><td style="font-weight: bold;">대표이사</td><td>O O O  (인)</td></tr>
                    <tr><td style="font-weight: bold;">주소</td><td>서울특별시 강남구 ...</td></tr>
                    <tr><td style="font-weight: bold;">고객센터</td><td>02-000-0000</td></tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
          ${totals.hasUnpricedCustom ?
                `<div style="color: #ea580c; font-weight: bold; margin-bottom: 20px; text-align: center; border: 1px solid #ea580c; padding: 15px; background: #fff7ed;">
              * 직접 입력하신 규격이 포함되어 있어, 정확한 총 합계 금액은 담당자 확인 후 재안내 드립니다.
            </div>` :
                `<div class="total-box">
              합계금액: ₩ ${grandTotal.toLocaleString()} (VAT 포함)
            </div>`
            }
          <table class="item-table">
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th>품목 및 규격</th>
                <th style="width: 60px;">수량</th>
                <th style="width: 120px;">단가(원)</th>
                <th style="width: 120px;">공급가액(원)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="4" style="text-align: right; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">배송비 (포장비 포함)</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${totals.shippingFee.toLocaleString()}</td>
              </tr>
              ${!totals.hasUnpricedCustom ? `
              <tr>
                <td colspan="4" style="text-align: right; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">부가가치세 (VAT 10%)</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${vat.toLocaleString()}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
          <div style="margin-top: 20px; font-size: 13px; color: #64748b;">
            <p>* 본 견적서의 유효기간은 발행일로부터 15일입니다.</p>
            <p>* 디자인 난이도 및 추가 요청사항에 따라 최종 금액이 변동될 수 있습니다.</p>
          </div>
          <div style="text-align: right; margin-top: 50px;">
            <p>감사합니다.</p>
            <h2 style="margin-top: 10px; color: #1e293b;">클래스부스트 (아임오케이)</h2>
          </div>
        </body>
      </html>
    `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { alert("원본/디자인 파일 첨부는 필수입니다."); return; }
        for (const item of items) {
            if (item.size === 'CUSTOM' && (!item.customWidth || !item.customHeight)) {
                alert("직접 입력 사이즈를 정확히 입력해주세요."); return;
            }
        }

        try {
            setIsUploading(true);
            const downloadURL = await StorageService.uploadFile(file, 'design_files');

            await OrderRepository.createOrder({
                academyName,
                phone,
                items,
                designRequestText: text,
                designFileUrl: downloadURL,
                total: totals.hasUnpricedCustom ? '담당자 확인 중' : totals.finalTotal,
                shippingFee: totals.shippingFee,
                status: totals.hasUnpricedCustom ? 'WAIT_QUOTE' : 'NEW'
            });

            setIsUploading(false);
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            setIsUploading(false);
            alert('주문 처리 중 오류가 발생했습니다.');
        }
    };

    if (!isAuthorized) {
        return (
            <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <div className="p-8 text-center relative">
                    {authMode === 'login' && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
                                <Lock className="h-8 w-8 text-slate-700" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">파트너 전용 공간</h2>
                            <p className="text-slate-500 mb-8 text-sm">경쟁력 있는 단가 제공을 위해<br />사전 승인된 파트너에게만 견적을 공개합니다.</p>
                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-400" /></div>
                                    <input type="text" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none font-bold tracking-widest uppercase text-center text-slate-900 bg-slate-50 focus:bg-white transition-colors" placeholder="코드를 입력하세요" value={authCode} onChange={(e) => setAuthCode(e.target.value)} />
                                </div>
                                {authError && <p className="text-red-500 text-sm text-left flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {authError}</p>}
                                <button type="submit" className="cursor-pointer w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">인증하고 견적 확인하기</button>
                            </form>
                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 text-sm">
                                <button onClick={() => setAuthMode('request')} className="cursor-pointer text-orange-600 font-bold hover:text-orange-700 flex justify-center items-center"><Star className="w-4 h-4 mr-1" /> 신규 파트너 신청하기</button>
                                <button onClick={() => setAuthMode('find')} className="cursor-pointer text-slate-500 font-medium hover:text-slate-800">기존 파트너 코드를 잊어버리셨나요?</button>
                            </div>
                        </div>
                    )}

                    {authMode === 'request' && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
                                <Star className="h-8 w-8 text-orange-500" />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2">신규 파트너 신청</h2>
                            <p className="text-slate-500 mb-6 text-sm">학원명과 연락처를 남겨주시면,<br />아임오케이 담당자가 승인 후 코드를 발급해 드립니다.</p>
                            <form onSubmit={handleRequestPartner} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">학원명</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white" placeholder="예: 정석수학학원" value={inquiryData.academyName} onChange={(e) => setInquiryData({ ...inquiryData, academyName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">원장님(담당자) 연락처</label>
                                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white" placeholder="010-0000-0000" value={inquiryData.phone} onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })} />
                                </div>
                                <button type="submit" className="cursor-pointer w-full bg-orange-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-700 shadow-md transition-colors mt-2">파트너 신청하기</button>
                                <button type="button" onClick={() => setAuthMode('login')} className="cursor-pointer w-full bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors">뒤로 가기</button>
                            </form>
                        </div>
                    )}

                    {authMode === 'find' && (
                        <div className="animate-in fade-in slide-in-from-left-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
                                <Search className="h-8 w-8 text-slate-600" />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2">파트너 코드 찾기</h2>
                            <p className="text-slate-500 mb-6 text-sm">기존에 등록하신 연락처를 입력하시면<br />카카오톡으로 코드를 다시 보내드립니다.</p>
                            <form onSubmit={(e) => { e.preventDefault(); alert(`[발송 완료] 입력하신 연락처(${inquiryData.phone})로 코드를 다시 발송했습니다.\n(데모: VIP2026)`); setAuthMode('login'); setInquiryData({ academyName: '', phone: '' }); }} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">등록된 연락처</label>
                                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white" placeholder="010-0000-0000" value={inquiryData.phone} onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })} />
                                </div>
                                <button type="submit" className="cursor-pointer w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 shadow-md transition-colors mt-2">카카오톡으로 코드 받기</button>
                                <button type="button" onClick={() => setAuthMode('login')} className="cursor-pointer w-full bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors">뒤로 가기</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-green-100">
                    <Check className="h-10 w-10 text-green-600 stroke-[3]" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    {totals.hasUnpricedCustom ? '맞춤 견적 요청 접수 완료!' : '견적 및 시안 요청 접수 완료!'}
                </h2>
                <p className="text-slate-600 mb-10 text-lg">
                    {totals.hasUnpricedCustom
                        ? '요청하신 [직접 입력] 규격의 단가를 담당자가 확인 후 카카오톡으로 안내해 드립니다.'
                        : '담당자가 디자인 확인 후 카카오톡으로 시안을 보내드립니다.'}
                </p>
                <button onClick={() => navigate('/')} className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-all">메인으로 돌아가기</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-8 flex items-center border-b border-slate-200 pb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                    <Calculator className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">간편 견적 및 발주 폼</h2>
                    <p className="text-slate-500 mt-1 font-medium">필요한 품목을 장바구니에 담아 빠르고 투명하게 견적을 산출하세요.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6 w-full">
                    {/* 기본 정보 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center"><div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>기본 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">학원명</label>
                                <input required type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition-colors" value={academyName} onChange={(e) => setAcademyName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">담당자 연락처</label>
                                <input required type="tel" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 다중 선택 장바구니 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center"><div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>주문 품목</h3>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-bold border border-slate-200">총 {totals.totalQty}개 담김</span>
                        </div>
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Item {index + 1} / 사이즈 선택</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none bg-white focus:ring-2 focus:ring-orange-500 font-medium text-slate-800" value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)}>
                                            <optgroup label="메인 버스 자석 현수막">{MAIN_BANNER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                            <optgroup label="보조/날짜용 현수막">{DATE_BANNER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                            <optgroup label="홍보물">{PROMO_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                            <optgroup label="기타 사이즈"><option value="CUSTOM" className="text-orange-600 font-bold">✍️ 직접 입력 (별도 견적)</option></optgroup>
                                        </select>
                                        {item.size === 'CUSTOM' && (
                                            <div className="flex gap-3 mt-3">
                                                <div className="flex-1"><input type="number" required placeholder="가로 (mm)" className="w-full px-4 py-2.5 rounded border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" value={item.customWidth} onChange={(e) => updateItem(item.id, 'customWidth', e.target.value)} /></div>
                                                <div className="flex-1"><input type="number" required placeholder="세로 (mm)" className="w-full px-4 py-2.5 rounded border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" value={item.customHeight} onChange={(e) => updateItem(item.id, 'customHeight', e.target.value)} /></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">수량</label>
                                        <input type="number" min="1" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)} />
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(item.id)} className="cursor-pointer w-full md:w-auto p-3.5 bg-white text-slate-400 border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex justify-center">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addItem} className="cursor-pointer mt-4 w-full border-2 border-dashed border-slate-300 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center">
                            <Plus className="w-5 h-5 mr-2" /> 새 품목 추가하기
                        </button>
                    </div>

                    {/* 파일 업로드 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center"><div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>요청사항 및 파일 업로드</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">디자인 요청사항</label>
                                <textarea required className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none h-28 bg-slate-50 focus:bg-white transition-colors" placeholder="예: 문구 변경, 컬러 변경 등 원하는 디자인 방향을 상세히 적어주세요." value={text} onChange={(e) => setText(e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">파일 첨부 (필수)</label>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 relative hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files[0])} />
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${file ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {file ? <CheckCircle className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                                        </div>
                                        <p className={`font-bold text-lg mb-1 ${file ? 'text-green-700' : 'text-slate-900'}`}>{file ? file.name : '디자인 원본 파일 업로드'}</p>
                                        {!file && <p className="text-sm text-slate-500">클릭하거나 파일을 이 영역으로 드래그하세요. (ai, psd, pdf, zip)</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Summary Card */}
                <div className="w-full lg:w-[380px] sticky top-24 shrink-0">
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>

                        <h3 className="text-xl font-extrabold mb-6 pb-4 border-b border-slate-700 flex items-center tracking-tight">
                            <ShieldCheck className="h-6 w-6 mr-2 text-orange-500" /> 결제 예정 요약
                        </h3>

                        <div className="space-y-4 mb-8">
                            {items.map((item, idx) => (
                                <div key={item.id} className="flex justify-between items-start text-sm">
                                    <div className="pr-4">
                                        <span className="block font-medium text-slate-200 truncate max-w-[180px] mb-1">{getFinalSizeString(item)}</span>
                                        <span className="text-xs text-slate-500 font-bold tracking-wider bg-slate-800 px-2 py-0.5 rounded">QTY: {item.qty}</span>
                                    </div>
                                    <span className="font-bold text-white shrink-0">
                                        {item.size === 'CUSTOM' ? <span className="text-orange-400 font-medium">별도 산정</span> : `${(PRICING[item.size] * item.qty).toLocaleString()}원`}
                                    </span>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-slate-700/50 flex justify-between items-start text-sm">
                                <div>
                                    <span className="text-slate-200 font-medium">배송비 ({totals.requiredBoxes}박스)</span>
                                    <p className="text-xs text-slate-500 mt-1">총 {totals.totalQty}개 (3개당 1박스)</p>
                                </div>
                                <span className="font-bold text-white">+{totals.shippingFee.toLocaleString()}원</span>
                            </div>

                            <div className="pt-6 mt-2 border-t border-slate-700 flex justify-between items-end">
                                <span className="text-base font-bold text-slate-300">총합계</span>
                                <div className="text-right">
                                    {totals.hasUnpricedCustom ? (
                                        <span className="text-lg font-extrabold text-orange-400 block tracking-tight">담당자 확인 후 안내</span>
                                    ) : (
                                        <span className="text-3xl font-extrabold text-white block tracking-tight">{totals.finalTotal.toLocaleString()}원</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button disabled={isUploading} onClick={handleSubmit} className={`cursor-pointer w-full font-extrabold text-lg py-5 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 ${totals.hasUnpricedCustom ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'} ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isUploading ? '업로드 중...' : (totals.hasUnpricedCustom ? '맞춤 견적 요청하기' : '시안 및 견적 요청하기')}
                        </button>

                        <button onClick={handlePrintQuote} className="cursor-pointer w-full mt-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center border border-slate-700 shadow-sm">
                            <Printer className="w-4 h-4 mr-2" /> 견적서 PDF 다운로드 / 인쇄
                        </button>

                        <p className="text-[11px] text-slate-500 text-center mt-4">* 부가세(VAT) 10% 별도 금액입니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
