import { ShieldCheck, Printer } from 'lucide-react';
import { PRICING } from '../../../core/constants';

function getSizeLabel(item) {
    return item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (직접입력)` : item.size;
}

export default function OrderSummaryCard({ items, totals, authCode, isUploading, onSubmit, onPrintQuote }) {
    return (
        <div className="w-full lg:w-[380px] sticky top-24 shrink-0">
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>

                <h3 className="text-lg md:text-xl font-extrabold mb-6 pb-4 border-b border-slate-700 flex items-center tracking-tight">
                    <ShieldCheck className="h-6 w-6 mr-2 text-orange-500" /> 결제 예정 요약
                </h3>

                <div className="space-y-4 mb-8">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                            <div className="pr-4">
                                <span className="block font-medium text-slate-200 truncate max-w-[180px] mb-1">{getSizeLabel(item)}</span>
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
                                <div className="text-right group">
                                    <span className="text-4xl font-black text-white block tracking-tighter drop-shadow-sm group-hover:text-orange-400 transition-colors">
                                        {totals.finalTotal.toLocaleString()}
                                        <span className="text-lg font-bold ml-1">원</span>
                                    </span>
                                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm border border-white/5">
                                        VAT 별도
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={isUploading}
                    onClick={onSubmit}
                    className={`cursor-pointer w-full font-extrabold text-lg py-5 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${totals.hasUnpricedCustom ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700' : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white'} ${isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-orange-500/20'}`}
                >
                    {isUploading ? (
                        <span className="flex items-center justify-center italic">
                            <span className="animate-pulse mr-2">요청 전송 중...</span>
                        </span>
                    ) : (totals.hasUnpricedCustom ? '맞춤 견적 및 시안 요청하기' : '디자인 시안 요청하기')}
                </button>

                <button type="button" onClick={onPrintQuote} className="cursor-pointer w-full mt-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center border border-slate-700 shadow-sm backdrop-blur-sm">
                    <Printer className="w-4 h-4 mr-2" /> 견적서 PDF 다운로드 / 인쇄
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-6 font-medium tracking-tight bg-slate-800/30 py-2 rounded-lg border border-slate-700/50">
                    * 부가세(VAT) 10%는 <span className="text-orange-400 font-bold underline underline-offset-2 decoration-orange-500/30">별도</span> 금액입니다.
                </p>
            </div>
        </div>
    );
}
