import { CheckCheck, Download, ExternalLink, Plus } from 'lucide-react';

export default function FinalOrderModal({ order, onPrintQuote, onClose }) {
    async function handleDownload(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = `시안_${order.customId || order.id.substring(0, 8)}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(urlBlob);
            document.body.removeChild(a);
        } catch (error) {
            console.error('다운로드 실패:', error);
            window.open(url, '_blank');
        }
    }

    function formatDeliveredAt(deliveredAt) {
        if (!deliveredAt) return '정보 없음 (담당자 문의)';
        if (typeof deliveredAt.toDate === 'function') {
            return deliveredAt.toDate().toLocaleDateString('ko-KR');
        }
        if (deliveredAt instanceof Date) {
            return deliveredAt.toLocaleDateString('ko-KR');
        }
        return String(deliveredAt);
    }

    function formatCreatedAt(createdAt) {
        if (createdAt instanceof Date) {
            return createdAt.toLocaleString('ko-KR');
        }
        if (typeof createdAt.toDate === 'function') {
            return createdAt.toDate().toLocaleString('ko-KR');
        }
        return String(createdAt);
    }

    const finalDraftUrl = order.draftImageUrls?.[order.draftImageUrls.length - 1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* 헤더 */}
                <div className="bg-teal-600 p-8 text-white relative">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <CheckCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">최종완료</h3>
                            <p className="text-teal-100 text-sm mt-1">주문 #{order.customId || order.id.substring(0, 8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
                        <Plus className="w-8 h-8 rotate-45" />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* 섹션 1: 주문 정보 */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">주문 일시</label>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{formatCreatedAt(order.createdAt)}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">배송완료일</label>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{formatDeliveredAt(order.deliveredAt)}</p>
                        </div>
                    </div>

                    {/* 섹션 2: 주문 내역 */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">주문 내역</label>
                        <div className="space-y-2 bg-slate-50 rounded-xl p-4">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => {
                                    const sizeDisplay = item.size === 'CUSTOM'
                                        ? `${item.customWidth || 0}×${item.customHeight || 0}mm`
                                        : item.size;
                                    return (
                                        <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-200 last:border-b-0">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{sizeDisplay}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{item.productName || '상품'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-900">{item.qty}개</p>
                                                {item.price && <p className="text-xs text-slate-500 mt-0.5">{item.price.toLocaleString()}원</p>}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-500 py-2">주문 내역 없음</p>
                            )}
                        </div>
                    </div>

                    {/* 섹션 3: 최종 시안 */}
                    {finalDraftUrl && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">최종 시안</label>
                            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img
                                    src={finalDraftUrl}
                                    alt="최종 시안"
                                    className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(finalDraftUrl, '_blank')}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(finalDraftUrl, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" /> 새 탭에서 열기
                                </button>
                                <button
                                    onClick={() => handleDownload(finalDraftUrl)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                                >
                                    <Download className="w-4 h-4" /> 다운로드
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="bg-slate-50 border-t border-slate-100 p-6 flex gap-3">
                    <button
                        onClick={onPrintQuote}
                        className="flex-1 px-4 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
                    >
                        견적서 출력
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
