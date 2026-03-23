import { useState } from 'react';
import { AlertCircle, RefreshCcw, Download, ShieldCheck, Image, Check, Printer } from 'lucide-react';
import { OrderRepository } from '../../../data/OrderRepository';
import { STATUS_MAP, STATUS_COLORS, PRICING } from '../../../core/constants';
import { useDialog } from '../DialogProvider';

const PROGRESS_STEPS = [
    { id: 'NEW', label: '신규접수' },
    { id: 'DESIGN', label: '시안작업' },
    { id: 'WAIT_CONFIRM', label: '시안 확인' },
    { id: 'APPROVED', label: '제작중' },
    { id: 'SHIPPING', label: '배송중' },
];

function generateQuoteHtml(order) {
    const today = new Date().toLocaleDateString('ko-KR');
    const isEstimated = typeof order.total === 'number';
    const grandTotal = isEstimated ? order.total : 0;

    let shippingFee = order.shippingFee || 0;
    if (!isEstimated && !order.shippingFee) {
        const totalQty = (order.items || []).reduce((sum, i) => sum + i.qty, 0);
        shippingFee = totalQty > 0 ? Math.ceil(totalQty / 3) * 8000 : 0;
    }

    const itemsHtml = (order.items || []).map((item, index) => {
        const sizeStr = item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (별도 규격)` : item.size;
        let amount = 0, unitPrice = 0;
        if (item.price !== undefined && item.price !== null) {
            amount = item.price;
            unitPrice = item.qty > 0 ? Math.floor(amount / item.qty) : 0;
        } else if (item.size !== 'CUSTOM') {
            unitPrice = PRICING[item.size] || 0;
            amount = unitPrice * item.qty;
        }
        const priceStr = isEstimated || item.size !== 'CUSTOM' ? unitPrice.toLocaleString() : '별도산정';
        const amountStr = isEstimated || item.size !== 'CUSTOM' ? amount.toLocaleString() : '별도산정';
        return `<tr>
          <td style="text-align:center;padding:10px;border:1px solid #cbd5e1;">${index + 1}</td>
          <td style="padding:10px;border:1px solid #cbd5e1;">자석 현수막 / 홍보물 (${sizeStr})</td>
          <td style="text-align:center;padding:10px;border:1px solid #cbd5e1;">${item.qty}</td>
          <td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${priceStr}</td>
          <td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${amountStr}</td>
        </tr>`;
    }).join('');

    return `<html><head><title>견적서 - ${order.academyName}</title>
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
            <div style="font-size:24px;font-weight:bold;margin-bottom:10px;border-bottom:2px solid #1e293b;display:inline-block;padding-bottom:5px;">${order.academyName} 귀하</div>
            <div style="margin-top:10px;"><strong>견적일자:</strong> ${today}</div>
            <div style="margin-top:5px;">아래와 같이 견적합니다.</div>
            <div style="margin-top:5px;font-size:12px;color:#64748b;">주문번호: ${order.customId || order.id.substring(0, 8).toUpperCase()}</div>
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
        ${!isEstimated
            ? `<div style="color:#ea580c;font-weight:bold;margin-bottom:20px;text-align:center;border:1px solid #ea580c;padding:15px;background:#fff7ed;">* 직접 입력하신 규격이 포함되어 있어, 정확한 총 합계 금액은 담당자 확인 후 재안내 드립니다.</div>`
            : `<div class="total-box">합계금액: ₩ ${grandTotal.toLocaleString()} (VAT 별도)</div>`}
        <table class="item-table">
          <thead><tr>
            <th style="width:50px;">No.</th><th>품목 및 규격</th>
            <th style="width:60px;">수량</th><th style="width:120px;">단가(원)</th><th style="width:120px;">공급가액(원)</th>
          </tr></thead>
          <tbody>
            ${itemsHtml}
            <tr><td colspan="4" style="text-align:right;padding:10px;border:1px solid #cbd5e1;font-weight:bold;background-color:#f8fafc;">배송비 (포장비 포함)</td><td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">${shippingFee.toLocaleString()}</td></tr>
            ${isEstimated ? `<tr style="background-color:#f8fafc;font-weight:bold;"><td colspan="4" style="text-align:right;padding:10px;border:1px solid #cbd5e1;">최종 합계 (VAT 별도)</td><td style="text-align:right;padding:10px;border:1px solid #cbd5e1;">₩ ${grandTotal.toLocaleString()}</td></tr>` : ''}
          </tbody>
        </table>
        <div style="margin-top:20px;font-size:13px;color:#64748b;">
          <p>* 본 견적서의 유효기간은 발행일로부터 15일입니다.</p>
          <p>* 디자인 난이도 및 추가 요청사항에 따라 최종 금액이 변동될 수 있습니다.</p>
        </div>
        <div style="text-align:right;margin-top:50px;"><p>감사합니다.</p><h2 style="margin-top:10px;color:#1e293b;">클래스부스트 (아임오케이)</h2></div>
      </body></html>`;
}

export default function OrderCard({ order }) {
    const { showAlert, showConfirm } = useDialog();
    const [modifyingOrderId, setModifyingOrderId] = useState(null);
    const [modText, setModText] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const handleStatusUpdate = async (newStatus) => {
        try {
            if (newStatus === 'CANCELLED') {
                const confirmed = await showConfirm('정말 주문을 취소하시겠습니까?');
                if (!confirmed) return;
            }
            if (newStatus === 'APPROVED') {
                const confirmed = await showConfirm('디자인 시안을 최종 확정하시겠습니까?\n확정 후에는 수정이 불가능하며 바로 제작 및 배송 절차가 진행됩니다.');
                if (!confirmed) return;
            }
            await OrderRepository.updateOrderStatus(order.id, newStatus);
            await showAlert(newStatus === 'APPROVED' ? '시안이 최종 확정되었습니다. 제작을 시작합니다!' : '상태가 업데이트 되었습니다.');
        } catch {
            showAlert('업데이트 중 오류가 발생했습니다.', '오류');
        }
    };

    const handleSubmitModification = async () => {
        if (!modText.trim()) {
            await showAlert('수정 요청 내용을 입력해주세요.', '확인');
            return;
        }
        try {
            await OrderRepository.updateOrder(order.id, { status: 'MODIFY_REQUEST', modificationRequest: modText });
            await showAlert('수정 요청이 접수되었습니다. 담당자가 확인 후 시안을 다시 업로드해 드립니다.');
            setModifyingOrderId(null);
            setModText('');
        } catch {
            showAlert('상태 업데이트 중 오류가 발생했습니다.', '오류');
        }
    };

    const handlePrintQuote = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(generateQuoteHtml(order));
        printWindow.document.close();
        printWindow.focus();
    };

    let currentIndex = PROGRESS_STEPS.findIndex(s => s.id === order.status);
    if (order.status === 'DONE' || order.status === 'TAX_INVOICE') currentIndex = 5;
    if (order.status === 'CANCELLED') currentIndex = -1;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50">
                <div>
                    <div className="text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-widest">
                        ORDERED AT {order.createdAt?.toLocaleString('ko-KR')}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        주문번호: {order.customId || order.id.substring(0, 8).toUpperCase()}
                        <span className={`ml-3 px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_MAP[order.status] || order.status}
                        </span>
                    </h3>
                </div>
                <div className="text-right mt-4 md:mt-0 font-bold w-full md:w-auto flex flex-col items-end gap-2">
                    <div className="flex justify-between md:block items-center w-full md:w-auto px-1 md:px-0">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block md:inline md:mr-3">Total Amount</span>
                        <span className="text-2xl text-slate-900 font-extrabold tracking-tight">
                            {typeof order.total === 'number' ? `${order.total.toLocaleString()}원` : order.total}
                            {typeof order.total === 'number' && <span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-wider">VAT 별도</span>}
                        </span>
                    </div>
                    <button onClick={handlePrintQuote} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-end">
                        <Printer className="w-3.5 h-3.5" /> 견적서 다운로드/인쇄
                    </button>
                </div>
            </div>

            <div className="p-8">
                {/* Progress Bar */}
                <div className="mb-14 pt-4 px-2 sm:px-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 md:top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 -translate-y-1/2"></div>
                        {PROGRESS_STEPS.map((step, index) => {
                            const isActive = index <= currentIndex;
                            const isCurrent = index === currentIndex;
                            return (
                                <div key={step.id} className="flex flex-col items-center relative flex-1">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-extrabold text-[10px] md:text-xs shadow-sm transition-all duration-500 ${isActive ? (isCurrent ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg scale-110' : 'bg-[#0f172a] text-white') : 'bg-white border border-slate-200 text-slate-300'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="mt-3 h-8 flex items-start justify-center text-center px-1">
                                        <span className={`text-[10px] md:text-[13px] leading-tight font-bold transition-colors ${isCurrent ? 'text-orange-600' : isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 p-5 md:p-6 rounded-2xl border border-slate-100 mb-8 text-sm mt-4">
                    <div>
                        <span className="block text-slate-400 font-extrabold mb-2 text-[11px] uppercase tracking-wider">학원 및 연락처</span>
                        <span className="font-bold text-slate-900 text-base">{order.academyName}</span>
                        <span className="text-slate-500 block mt-1">{order.phone}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 font-extrabold mb-2 text-[11px] uppercase tracking-wider">주문 내역 ({(order.items || []).length}건)</span>
                        <ul className="space-y-1.5 font-bold text-slate-700">
                            {(order.items || []).map(item => (
                                <li key={item.id} className="flex items-center">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2.5"></div>
                                    {item.size === 'CUSTOM' ? `[별도 규격] ${item.customWidth}*${item.customHeight}` : item.size}
                                    <span className="ml-2 text-slate-400 font-medium">/ {item.qty}개</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Communication Section */}
                <div className="border-t border-slate-100 pt-8">
                    <h4 className="font-extrabold text-slate-900 mb-6 flex items-center text-sm uppercase tracking-tight">
                        <div className="w-2 h-5 bg-[#0f172a] rounded-full mr-3"></div> 시안 확인 및 커뮤니케이션
                    </h4>

                    {order.draftImageUrls && order.draftImageUrls.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <Image className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">제작 시안 확인</h5>
                                        <p className="text-[10px] text-slate-500 font-medium">관리자가 등록한 {order.draftImageUrls.length}번째 시안입니다</p>
                                    </div>
                                </div>
                                {order.draftImageUrls.length > 1 && (
                                    <button onClick={() => setShowHistory(p => !p)} className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-1.5">
                                        <RefreshCcw className={`w-3 h-3 ${showHistory ? 'rotate-180' : ''} transition-transform`} />
                                        {showHistory ? '최신 시안만 보기' : `이전 시안 보기 (${order.draftImageUrls.length - 1})`}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {!showHistory ? (
                                    <div className="relative animate-in fade-in duration-500">
                                        <div className="absolute -top-3 -left-3 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full z-10 shadow-lg uppercase tracking-wider">Latest Version</div>
                                        <img src={order.draftImageUrls[order.draftImageUrls.length - 1]} alt="Latest Draft" className="w-full h-auto rounded-2xl shadow-xl border-4 border-white cursor-zoom-in hover:scale-[1.005] transition-transform" onClick={() => window.open(order.draftImageUrls[order.draftImageUrls.length - 1], '_blank')} />
                                        <div className="mt-4 flex justify-center">
                                            <a href={order.draftImageUrls[order.draftImageUrls.length - 1]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                                <Download className="w-4 h-4 text-indigo-600" /> 시안 다운로드
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {[...order.draftImageUrls].reverse().map((url, index) => (
                                            <div key={index} className="relative">
                                                <div className={`absolute -top-3 -left-3 ${index === 0 ? 'bg-indigo-600' : 'bg-slate-400'} text-white text-[10px] font-black px-3 py-1 rounded-full z-10 shadow-md`}>
                                                    {index === 0 ? 'LATEST' : `v${order.draftImageUrls.length - index}`}
                                                </div>
                                                <img src={url} alt={`Draft v${order.draftImageUrls.length - index}`} className="w-full h-auto rounded-xl shadow-md border-2 border-white grayscale-[0.2] hover:grayscale-0 transition-all cursor-zoom-in" onClick={() => window.open(url, '_blank')} />
                                                <p className="mt-2 text-center text-[11px] font-bold text-slate-500">
                                                    {index === 0 ? '현재 시안' : `차수 #${order.draftImageUrls.length - index} 시안`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {order.status === 'WAIT_CONFIRM' && (
                                    <div className="mt-10 pt-10 border-t border-slate-200">
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            {modifyingOrderId === order.id ? (
                                                <div className="w-full max-w-lg animate-in slide-in-from-top-2 duration-300">
                                                    <textarea className="w-full p-4 rounded-xl border-2 border-orange-200 focus:border-orange-500 outline-none text-sm font-medium h-32 mb-3 bg-white shadow-inner" placeholder="어떤 부분을 수정하고 싶으신가요? 자세히 적어주시면 정확한 반영이 가능합니다." value={modText} onChange={(e) => setModText(e.target.value)} />
                                                    <div className="flex gap-2">
                                                        <button onClick={handleSubmitModification} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg text-sm">수정 요청 전송</button>
                                                        <button onClick={() => { setModifyingOrderId(null); setModText(''); }} className="px-6 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">취소</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => handleStatusUpdate('APPROVED')} className="cursor-pointer bg-indigo-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-extrabold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex-1 md:min-w-[200px] text-base md:text-lg flex items-center justify-center gap-2">
                                                        <Check className="w-5 h-5" /> 시안 최종 확정
                                                    </button>
                                                    <button onClick={() => setModifyingOrderId(order.id)} className="cursor-pointer bg-white border-2 border-orange-500 text-orange-600 px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-md flex-1 md:min-w-[200px] text-base md:text-lg">
                                                        시안 수정 요청
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {order.status === 'MODIFY_REQUEST' && (
                        <div className="bg-pink-50/50 border border-pink-100 rounded-3xl p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-pink-100">
                                <RefreshCcw className="w-8 h-8 text-pink-500" />
                            </div>
                            <h5 className="text-xl font-extrabold text-pink-900 mb-2">시안 수정 요청이 접수되었습니다</h5>
                            <p className="text-pink-700/80 text-sm mb-6 font-medium">담당자가 요청하신 내용을 확인하여 작업을 진행 중입니다.<br />완료되면 문자로 다시 안내해 드립니다.</p>
                            <div className="max-w-md mx-auto bg-white/80 p-5 rounded-2xl border border-pink-100 text-left">
                                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-2">나의 수정 요청 내용</span>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-bold">{order.modificationRequest}</p>
                            </div>
                        </div>
                    )}

                    {order.status === 'NEW' && (
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center text-slate-500 font-medium">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center mr-4">
                                    <RefreshCcw className={`w-5 h-5 text-indigo-500 ${order.total === '담당자 확인 중' ? 'animate-spin' : ''}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {order.total === '담당자 확인 중' ? '담당자가 견적 금액을 확인 중입니다' : (order.items.some(i => i.size === 'CUSTOM') ? '맞춤 견적 금액 산정이 완료되었습니다' : '담당 디자이너가 배정되고 있습니다')}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {order.total === '담당자 확인 중' ? '맞춤 규격 확인 후 빠른 시일 내에 안내해 드리겠습니다.' : '조금만 기다려주시면 멋진 시안으로 찾아뵙겠습니다.'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={() => handleStatusUpdate('CANCELLED')} className="cursor-pointer whitespace-nowrap px-6 py-3 rounded-xl font-bold text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all w-full md:w-auto text-center">
                                주문 취소
                            </button>
                        </div>
                    )}

                    {['DESIGN', 'APPROVED', 'SHIPPING', 'DONE', 'MODIFY_REQUEST', 'TAX_INVOICE'].includes(order.status) && (
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 text-center sm:text-left">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className={`w-6 h-6 md:w-8 md:h-8 ${order.status === 'DONE' ? 'text-green-500' : 'text-indigo-500'}`} />
                            </div>
                            <div>
                                <p className="font-extrabold text-slate-900 mb-1 text-sm md:text-base">
                                    {order.status === 'DESIGN' && '디자이너가 시안을 작업 중입니다'}
                                    {order.status === 'MODIFY_REQUEST' && '수정 요청을 확인하여 작업 중입니다'}
                                    {order.status === 'APPROVED' && '시안이 확정되어 제작이 진행 중입니다'}
                                    {order.status === 'SHIPPING' && '상품이 원장님께 배송 중입니다'}
                                    {order.status === 'DONE' && '배송 및 모든 작업이 완료되었습니다'}
                                    {order.status === 'TAX_INVOICE' && '세금계산서 발행이 완료되었습니다'}
                                </p>
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                                    {order.status === 'TAX_INVOICE' ? '요청하신 세금계산서가 발행되었습니다. 이메일을 확인해 주세요.' : order.status === 'DONE' ? '아임오케이를 이용해주셔서 감사합니다. 다음에도 꼭 다시 찾아주세요!' : '현재 공정 단계에 맞춰 꼼꼼하게 작업 중입니다. 단계가 변경될 때마다 알림을 보내 드립니다.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {order.status === 'CANCELLED' && (
                        <div className="text-sm p-6 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 flex items-center shadow-sm">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            이 주문은 취소되었습니다. 궁금하신 점은 고객센터로 문의주세요.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
