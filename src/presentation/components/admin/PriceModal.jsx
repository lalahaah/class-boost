import { useState } from 'react';
import { OrderRepository } from '../../../data/OrderRepository';
import { useDialog } from '../DialogProvider';

export default function PriceModal({ order, onClose }) {
    const { showAlert } = useDialog();
    const [itemPrices, setItemPrices] = useState(() => {
        const initial = {};
        (order?.items || []).forEach(item => {
            initial[item.id] = item.price || '';
        });
        return initial;
    });
    const [shippingFee, setShippingFee] = useState(order?.shippingFee || '');

    const calculateTotal = () => {
        let sum = Object.values(itemPrices).reduce((acc, p) => {
            const n = parseInt(p, 10);
            return acc + (isNaN(n) ? 0 : n);
        }, 0);
        const shipping = parseInt(shippingFee, 10);
        return sum + (isNaN(shipping) ? 0 : shipping);
    };

    const handleSubmit = async () => {
        try {
            const total = calculateTotal();
            const updatedItems = order.items.map(item => ({
                ...item,
                price: itemPrices[item.id] ? Number(itemPrices[item.id]) : 0
            }));
            await OrderRepository.updateOrder(order.id, {
                total,
                items: updatedItems,
                shippingFee: shippingFee ? Number(shippingFee) : 0
            });
            await showAlert('금액 산정이 완료되었습니다.', '안내');
            onClose();
        } catch {
            await showAlert('금액 수정 실패', '오류');
        }
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2">총 결제금액 산정</h3>
                <p className="text-sm text-slate-500 mb-4">학원이 주문한 내역별 금액과 배송비를 입력하세요.<br />(숫자만 입력, VAT 별도)</p>

                <div className="overflow-y-auto flex-1 pr-1 space-y-3 mb-6">
                    {order.items.map(item => (
                        <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                                <span>{item.size === 'CUSTOM' ? `별도 규격 (${item.customWidth}x${item.customHeight})` : item.size}</span>
                                <span className="text-slate-500 font-medium bg-slate-200/50 px-2 py-0.5 rounded text-xs">{item.qty}개</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">항목 금액</span>
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold bg-white transition-all shadow-sm"
                                        placeholder="0"
                                        value={itemPrices[item.id] || ''}
                                        onChange={(e) => setItemPrices({ ...itemPrices, [item.id]: e.target.value })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">원</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-orange-800 whitespace-nowrap ml-1">배송비</span>
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold bg-white transition-all shadow-sm"
                                    placeholder="0"
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 flex justify-between items-center mb-6 shadow-md">
                    <span className="text-sm font-bold text-slate-300">총 산정 금액 <span className="text-[10px] font-normal opacity-70">(VAT 별도)</span></span>
                    <span className="text-xl font-extrabold text-white">
                        {calculateTotal().toLocaleString()} <span className="text-sm font-medium opacity-80">원</span>
                    </span>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
                    <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">저장하기</button>
                </div>
            </div>
        </div>
    );
}
