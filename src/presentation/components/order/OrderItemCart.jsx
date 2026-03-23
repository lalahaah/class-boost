import { Plus, Trash2 } from 'lucide-react';
import { MAIN_BANNER_SIZES, DATE_BANNER_SIZES, PROMO_SIZES } from '../../../core/constants';

export default function OrderItemCart({ items, totals, onAdd, onUpdate, onRemove }) {
    return (
        <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center tracking-tight">
                    <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>주문 품목
                </h3>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">총 {totals.totalQty}개 담김</span>
            </div>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Item {index + 1} / 사이즈 선택</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none bg-white focus:ring-2 focus:ring-orange-500 font-medium text-slate-800" value={item.size} onChange={(e) => onUpdate(item.id, 'size', e.target.value)}>
                                <optgroup label="메인 버스 자석 현수막">{MAIN_BANNER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                <optgroup label="보조/날짜용 현수막">{DATE_BANNER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                <optgroup label="홍보물">{PROMO_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                                <optgroup label="기타 사이즈"><option value="CUSTOM" className="text-orange-600 font-bold">✍️ 직접 입력 (별도 규격)</option></optgroup>
                            </select>
                            {item.size === 'CUSTOM' && (
                                <div className="flex gap-3 mt-3">
                                    <div className="flex-1"><input type="number" required placeholder="가로 (mm)" className="w-full px-4 py-2.5 rounded border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" value={item.customWidth} onChange={(e) => onUpdate(item.id, 'customWidth', e.target.value)} /></div>
                                    <div className="flex-1"><input type="number" required placeholder="세로 (mm)" className="w-full px-4 py-2.5 rounded border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" value={item.customHeight} onChange={(e) => onUpdate(item.id, 'customHeight', e.target.value)} /></div>
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">수량</label>
                            <input type="number" min="1" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold" value={item.qty} onChange={(e) => onUpdate(item.id, 'qty', parseInt(e.target.value) || 1)} />
                        </div>
                        {items.length > 1 && (
                            <button type="button" onClick={() => onRemove(item.id)} className="cursor-pointer w-full md:w-auto p-3.5 bg-white text-slate-400 border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex justify-center">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={onAdd} className="cursor-pointer mt-4 w-full border-2 border-dashed border-slate-300 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" /> 새 품목 추가하기
            </button>
        </div>
    );
}
