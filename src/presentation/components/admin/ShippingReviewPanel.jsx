import { useState } from 'react';
import {
    Package, Truck, ChevronDown, ChevronUp, AlertCircle,
    CheckCircle2, Send, Eye, X, Minus, Plus
} from 'lucide-react';
import { calculateShipping } from '../../../core/shipping-logic';
import { useShippingCalculator } from '../../hooks/useShippingCalculator';
import { useDialog } from '../DialogProvider';
import QuotePreviewModal from './QuotePreviewModal';

export default function ShippingReviewPanel({ order, onClose, onConfirm }) {
    const { showAlert, showConfirm } = useDialog();
    const [showPreview, setShowPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const autoResult = calculateShipping(order.items);

    const {
        method, setMethod,
        boxes, setBoxes,
        quickFee, setQuickFee,
        adminNote, setAdminNote,
        current,
        isManualOverride,
        getFinalShipping,
    } = useShippingCalculator(autoResult);

    const handleSend = async () => {
        if (method === 'quick' && Number(quickFee) < 1) {
            await showAlert('퀵 비용을 입력해주세요.', '입력 오류');
            return;
        }
        const confirmed = await showConfirm(
            `고객(${order.academyName})에게 최종 견적을 발송하시겠습니까?\n\n배송비: ${current.total.toLocaleString()}원 (VAT 포함)`,
            '견적 발송 확인'
        );
        if (!confirmed) return;

        setIsSending(true);
        try {
            await onConfirm(getFinalShipping());
            onClose();
        } catch {
            await showAlert('발송 중 오류가 발생했습니다.', '오류');
        } finally {
            setIsSending(false);
        }
    };

    const alreadySent = !!order.quoteSentAt;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl flex flex-col">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-orange-500" />
                                배송비 검토 및 견적 발송
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {order.academyName} · {order.customId || order.id?.substring(0, 8)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* ── 섹션 1: 자동 계산 결과 ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-bold text-slate-700">자동 계산 결과</h4>
                                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    자동 계산
                                </span>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-500">
                                            <th className="px-3 py-2 text-left font-bold">사이즈</th>
                                            <th className="px-3 py-2 text-center font-bold">수량</th>
                                            <th className="px-3 py-2 text-center font-bold">카테고리</th>
                                            <th className="px-3 py-2 text-center font-bold">박스당</th>
                                            <th className="px-3 py-2 text-right font-bold">박스분율</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {autoResult.breakdown.map((row, i) => (
                                            <tr key={i} className="text-slate-700">
                                                <td className="px-3 py-2 font-medium">{row.size}</td>
                                                <td className="px-3 py-2 text-center">{row.quantity}개</td>
                                                <td className="px-3 py-2 text-center text-slate-500">{row.category}</td>
                                                <td className="px-3 py-2 text-center text-slate-500">{row.itemsPerBox}개</td>
                                                <td className="px-3 py-2 text-right font-mono text-slate-600">{row.boxFraction}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-600">
                                        <span>총 박스 수 (자동)</span>
                                        <span className="font-bold text-slate-900">{autoResult.boxes}박스</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>배송비 (VAT 별도)</span>
                                        <span>{autoResult.subtotal.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>배송비 (VAT 포함)</span>
                                        <span>{autoResult.total.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── 섹션 2: 수동 조정 ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-bold text-slate-700">어드민 수동 조정</h4>
                                <span className="text-[10px] text-slate-400 font-medium">변경 없으면 자동값 적용</span>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                                {/* 배송 방법 선택 */}
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">배송 방법</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setMethod('parcel')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                                method === 'parcel'
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <Package className="w-4 h-4" />
                                            택배 8,000원/박스
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod('quick')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                                method === 'quick'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <Truck className="w-4 h-4" />
                                            퀵 직배송
                                        </button>
                                    </div>
                                </div>

                                {/* 택배: 박스 수 조정 */}
                                {method === 'parcel' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                                            박스 수
                                            <span className="text-slate-400 font-normal ml-1">(자동: {autoResult.boxes}박스)</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setBoxes(v => Math.max(1, Number(v) - 1))}
                                                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-20 text-center py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none font-bold text-slate-900"
                                                value={boxes}
                                                onChange={e => setBoxes(Math.max(1, Number(e.target.value) || 1))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setBoxes(v => Number(v) + 1)}
                                                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm text-slate-500 font-medium">
                                                → {(Math.max(1, Number(boxes)) * 8000).toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 퀵: 직접 입력 */}
                                {method === 'quick' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                                            퀵 배송비 직접 입력
                                            <span className="text-slate-400 font-normal ml-1">(일반 25,000 ~ 45,000원)</span>
                                        </label>
                                        <div className="relative max-w-xs">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none font-bold text-slate-900 text-right"
                                                value={quickFee}
                                                onChange={e => setQuickFee(Math.max(1, Number(e.target.value) || 1))}
                                                placeholder="35000"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">원</span>
                                        </div>
                                    </div>
                                )}

                                {/* 조정 사유 */}
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">
                                        조정 사유 <span className="text-slate-400 font-normal">(선택)</span>
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none text-sm text-slate-700 resize-none"
                                        rows={2}
                                        placeholder="예) 배너 현수막 박스 동봉, 목적지 2곳 분리 납품 등"
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── 섹션 3: 최종 견적 미리보기 + 발송 ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-bold text-slate-700">최종 견적 확인</h4>
                                {isManualOverride ? (
                                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                        수동 조정됨
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        자동 확정
                                    </span>
                                )}
                            </div>

                            {/* 자동 vs 최종 비교 */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-4">
                                <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
                                    <div className="p-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">항목</div>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">자동 계산</div>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">최종 적용</div>
                                    </div>
                                </div>
                                {[
                                    {
                                        label: '배송 방법',
                                        auto: '택배',
                                        final: method === 'parcel' ? '택배' : '퀵 직배송',
                                    },
                                    {
                                        label: '박스 수',
                                        auto: `${autoResult.boxes}박스`,
                                        final: method === 'parcel' ? `${current.boxes}박스` : '-',
                                    },
                                    {
                                        label: '배송비 (VAT별도)',
                                        auto: `${autoResult.subtotal.toLocaleString()}원`,
                                        final: `${current.subtotal.toLocaleString()}원`,
                                    },
                                    {
                                        label: '배송비 (VAT포함)',
                                        auto: `${autoResult.total.toLocaleString()}원`,
                                        final: `${current.total.toLocaleString()}원`,
                                    },
                                ].map((row, i) => {
                                    const changed = row.auto !== row.final;
                                    return (
                                        <div key={i} className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 text-xs">
                                            <div className="px-3 py-2.5 text-slate-500 font-medium">{row.label}</div>
                                            <div className="px-3 py-2.5 text-center text-slate-500">{row.auto}</div>
                                            <div className={`px-3 py-2.5 text-center font-bold ${changed ? 'text-orange-600 bg-orange-50' : 'text-slate-700'}`}>
                                                {row.final}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 이미 발송된 경우 안내 */}
                            {alreadySent && (
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-xs text-amber-700 font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    이미 발송된 주문입니다. 재발송 시 고객에게 알림이 다시 전송됩니다.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white rounded-b-2xl">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            견적서 미리보기
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                                alreadySent
                                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Send className="w-4 h-4" />
                            {isSending ? '발송 중...' : alreadySent ? '재발송' : '고객에게 발송'}
                        </button>
                    </div>
                </div>
            </div>

            {showPreview && (
                <QuotePreviewModal
                    order={order}
                    finalShipping={getFinalShipping()}
                    adminNote={adminNote}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    );
}
