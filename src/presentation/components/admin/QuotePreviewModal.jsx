import { X, Printer } from 'lucide-react';
import { PARCEL_RATE } from '../../../core/shipping-logic';

function getItemDisplaySize(item) {
    if (item.size === 'CUSTOM') return `별도 규격 (${item.customWidth}x${item.customHeight})`;
    return item.size;
}

function buildPrintHtml({ order, rows, subtotal, vat, total, shippingLabel, shippingBoxes, shippingUnitPrice, adminNote }) {
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const rowsHtml = rows.map((row, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${row.category}</td>
            <td>${row.description}</td>
            <td>${row.qty}</td>
            <td>${row.unitPrice ? Number(row.unitPrice).toLocaleString() : '-'}</td>
            <td>${row.amount ? Number(row.amount).toLocaleString() : '-'}</td>
            <td>${row.note || ''}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>견적서 - ${order.academyName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', sans-serif; font-size: 12px; color: #1e293b; padding: 40px; }
  h1 { text-align: center; font-size: 22px; font-weight: 800; margin-bottom: 6px; letter-spacing: 6px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 11px; color: #475569; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .info-box { border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; }
  .info-box dt { font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
  .info-box dd { font-size: 13px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1e293b; color: white; }
  th { padding: 9px 10px; text-align: center; font-size: 11px; font-weight: 700; }
  th:nth-child(3) { text-align: left; }
  td { padding: 8px 10px; text-align: center; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
  td:nth-child(3) { text-align: left; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .totals { margin-left: auto; width: 240px; }
  .totals tr td { padding: 6px 10px; }
  .totals tr td:first-child { text-align: right; color: #64748b; font-size: 11px; }
  .totals tr td:last-child { text-align: right; font-weight: 700; }
  .totals tr:last-child { background: #1e293b; color: white; border-radius: 4px; }
  .totals tr:last-child td { font-size: 14px; font-weight: 800; }
  .note { margin-top: 24px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 12px; }
  @media print {
    body { padding: 20px; }
    @page { margin: 15mm; }
  }
</style>
</head>
<body>
  <h1>견 &nbsp; 적 &nbsp; 서</h1>
  <div class="meta">
    <span>발행일: ${today}</span>
    <span>주문번호: ${order.customId || order.id?.substring(0, 8) || ''}</span>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <dl>
        <dt>수신</dt>
        <dd>${order.academyName}</dd>
      </dl>
    </div>
    <div class="info-box">
      <dl>
        <dt>연락처</dt>
        <dd>${order.phone || '-'}</dd>
      </dl>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:32px">No.</th>
        <th style="width:80px">항목</th>
        <th>내용</th>
        <th style="width:48px">수량</th>
        <th style="width:80px">단가(원)</th>
        <th style="width:80px">금액(원)</th>
        <th style="width:120px">비고</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>기획비</td>
        <td style="text-align:left">기획/디자인/운영 전반 관리</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td></td>
      </tr>
      ${rowsHtml}
      <tr style="background:#fff7ed">
        <td>${rows.length + 2}</td>
        <td>배송</td>
        <td style="text-align:left">${shippingLabel}</td>
        <td>${shippingBoxes}</td>
        <td>${shippingUnitPrice ? Number(shippingUnitPrice).toLocaleString() : '-'}</td>
        <td>${Number(subtotal - (rows.reduce((s, r) => s + (r.amount || 0), 0))).toLocaleString()}</td>
        <td>${adminNote || ''}</td>
      </tr>
    </tbody>
  </table>
  <table class="totals">
    <tbody>
      <tr>
        <td>소계</td>
        <td>${subtotal.toLocaleString()} 원</td>
      </tr>
      <tr>
        <td>부가세 (10%)</td>
        <td>${vat.toLocaleString()} 원</td>
      </tr>
      <tr>
        <td style="color:white">합계 (VAT 포함)</td>
        <td style="color:white">${total.toLocaleString()} 원</td>
      </tr>
    </tbody>
  </table>
  <div class="note">
    ※ 본 견적서의 유효기간은 발행일로부터 7일입니다.<br/>
    ※ 부가세는 별도이며, 최종 금액은 세금계산서 발행 기준입니다.
  </div>
</body>
</html>`;
}

export default function QuotePreviewModal({ order, finalShipping, adminNote, onClose }) {
    const itemRows = order.items.map(item => {
        const qty = item.qty ?? 0;
        const amount = item.price ?? 0;
        const unitPrice = qty > 0 ? Math.round(amount / qty) : 0;
        return {
            category: item.size === 'CUSTOM' ? '맞춤 현수막' : '현수막',
            description: `${getItemDisplaySize(item)} × ${qty}개`,
            qty,
            unitPrice,
            amount,
            note: '',
        };
    });

    const itemsSubtotal = itemRows.reduce((s, r) => s + (r.amount || 0), 0);
    const shippingSubtotal = finalShipping.subtotal;
    const grandSubtotal = itemsSubtotal + shippingSubtotal;
    const vat = Math.round(grandSubtotal * 0.1);
    const grandTotal = grandSubtotal + vat;

    const shippingLabel = finalShipping.method === 'parcel'
        ? '택배'
        : '퀵 직배송';
    const shippingBoxes = finalShipping.method === 'parcel'
        ? `${finalShipping.boxes}박스`
        : '1회';
    const shippingUnitPrice = finalShipping.method === 'parcel' ? PARCEL_RATE : finalShipping.subtotal;

    const handlePrint = () => {
        const html = buildPrintHtml({
            order,
            rows: itemRows,
            subtotal: grandSubtotal,
            vat,
            total: grandTotal,
            shippingLabel,
            shippingBoxes,
            shippingUnitPrice,
            adminNote,
        });
        const win = window.open('', '_blank', 'width=860,height=720');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">견적서 미리보기</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="overflow-y-auto flex-1 p-6">
                    {/* 제목 */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-extrabold tracking-[0.3em] text-slate-900">견 &nbsp; 적 &nbsp; 서</h2>
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>발행일: {new Date().toLocaleDateString('ko-KR')}</span>
                            <span>주문번호: {order.customId || order.id?.substring(0, 8)}</span>
                        </div>
                    </div>

                    {/* 수신처 */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="border border-slate-200 rounded-lg px-4 py-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">수신</div>
                            <div className="font-bold text-slate-900">{order.academyName}</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg px-4 py-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">연락처</div>
                            <div className="font-bold text-slate-900">{order.phone || '-'}</div>
                        </div>
                    </div>

                    {/* 견적 테이블 */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-3 py-2.5 text-center w-8">No.</th>
                                    <th className="px-3 py-2.5 text-center w-20">항목</th>
                                    <th className="px-3 py-2.5 text-left">내용</th>
                                    <th className="px-3 py-2.5 text-center w-12">수량</th>
                                    <th className="px-3 py-2.5 text-right w-20">단가(원)</th>
                                    <th className="px-3 py-2.5 text-right w-20">금액(원)</th>
                                    <th className="px-3 py-2.5 text-center w-28">비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* 기획비 */}
                                <tr>
                                    <td className="px-3 py-2.5 text-center text-slate-500">1</td>
                                    <td className="px-3 py-2.5 text-center text-slate-600 font-medium">기획비</td>
                                    <td className="px-3 py-2.5 text-slate-600">기획/디자인/운영 전반 관리</td>
                                    <td className="px-3 py-2.5 text-center text-slate-400">-</td>
                                    <td className="px-3 py-2.5 text-right text-slate-400">-</td>
                                    <td className="px-3 py-2.5 text-right text-slate-400">-</td>
                                    <td className="px-3 py-2.5 text-center"></td>
                                </tr>
                                {/* 품목 행 */}
                                {itemRows.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                                        <td className="px-3 py-2.5 text-center text-slate-500">{i + 2}</td>
                                        <td className="px-3 py-2.5 text-center font-medium text-slate-700">{row.category}</td>
                                        <td className="px-3 py-2.5 text-slate-700">{row.description}</td>
                                        <td className="px-3 py-2.5 text-center">{row.qty}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">
                                            {row.unitPrice ? row.unitPrice.toLocaleString() : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-bold">
                                            {row.amount ? row.amount.toLocaleString() : '-'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-400">{row.note}</td>
                                    </tr>
                                ))}
                                {/* 배송 행 */}
                                <tr className="bg-orange-50/60">
                                    <td className="px-3 py-2.5 text-center text-slate-500">{itemRows.length + 2}</td>
                                    <td className="px-3 py-2.5 text-center font-bold text-orange-700">배송</td>
                                    <td className="px-3 py-2.5 font-medium text-slate-700">{shippingLabel}</td>
                                    <td className="px-3 py-2.5 text-center">{shippingBoxes}</td>
                                    <td className="px-3 py-2.5 text-right font-mono">
                                        {shippingUnitPrice.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold">
                                        {shippingSubtotal.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2.5 text-center text-xs text-slate-500">
                                        {adminNote || ''}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 소계 / VAT / 합계 */}
                    <div className="flex justify-end">
                        <div className="w-56 space-y-1">
                            <div className="flex justify-between text-xs text-slate-500 px-2">
                                <span>소계</span>
                                <span>{grandSubtotal.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 px-2">
                                <span>부가세 (10%)</span>
                                <span>{vat.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl px-3 py-2.5">
                                <span className="text-sm font-bold">합계 (VAT 포함)</span>
                                <span className="text-base font-extrabold">{grandTotal.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                        ※ 본 견적서의 유효기간은 발행일로부터 7일입니다.<br />
                        ※ 부가세는 별도이며, 최종 금액은 세금계산서 발행 기준입니다.
                    </p>
                </div>

                {/* 하단 버튼 */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-md"
                    >
                        <Printer className="w-4 h-4" />
                        PDF 저장 / 인쇄
                    </button>
                </div>
            </div>
        </div>
    );
}
