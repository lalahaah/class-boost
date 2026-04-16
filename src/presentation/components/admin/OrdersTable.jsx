import { useState } from 'react';
import { Edit3, Download, Image as ImageIcon, Send, RefreshCcw, Truck } from 'lucide-react';
import { OrderRepository } from '../../../data/OrderRepository';
import { StorageService } from '../../../data/StorageService';
import { STATUS_MAP, STATUS_COLORS } from '../../../core/constants';
import { useDialog } from '../DialogProvider';

export default function OrdersTable({ orders, onOpenPriceModal, onOpenShippingPanel }) {
    const { showAlert } = useDialog();
    const [isUploadingDraft, setIsUploadingDraft] = useState({});

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await OrderRepository.updateOrderStatus(orderId, newStatus);
        } catch {
            await showAlert('상태 업데이트 실패', '오류');
        }
    };

    const handleUploadDraft = async (orderId, file) => {
        if (!file) return;
        try {
            setIsUploadingDraft(prev => ({ ...prev, [orderId]: true }));
            const downloadURL = await StorageService.uploadFile(file, 'draft_proofs');

            const order = orders.find(o => o.id === orderId);
            const currentDrafts = order.draftImageUrls || [];

            await OrderRepository.updateDraftImages(orderId, [...currentDrafts, downloadURL]);
            await OrderRepository.updateOrder(orderId, { status: 'WAIT_CONFIRM', modificationRequest: '' });
            await showAlert('시안 등록 및 상태 변경 완료', '안내');
        } catch {
            await showAlert('시안 업데이트 실패', '오류');
        } finally {
            setIsUploadingDraft(prev => ({ ...prev, [orderId]: false }));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="p-4 font-bold">주문번호/일시</th>
                            <th className="p-4 font-bold">학원명</th>
                            <th className="p-4 font-bold">연락처</th>
                            <th className="p-4 font-bold">주문품목</th>
                            <th className="p-4 font-bold">디자인요청</th>
                            <th className="p-4 font-bold text-center">결제금액</th>
                            <th className="p-4 font-bold text-center">진행상태</th>
                            <th className="p-4 font-bold text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.sort((a, b) => b.createdAt - a.createdAt).map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="font-mono font-bold text-slate-900">{order.customId || order.id.substring(0, 8)}</div>
                                    <div className="text-xs text-slate-500 mt-1">{order.createdAt?.toLocaleString('ko-KR')}</div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-bold text-slate-900">{order.academyName}</div>
                                </td>
                                <td className="p-4 align-top font-medium text-slate-600">{order.phone}</td>
                                <td className="p-4 align-top">
                                    <div className="flex flex-col gap-1">
                                        {order.items.map(item => (
                                            <div key={item.id} className="text-[11px] bg-slate-100 px-2 py-1 rounded w-fit text-slate-700">
                                                <span className="font-bold text-slate-900">
                                                    {item.size === 'CUSTOM' ? `별도 규격 (${item.customWidth}x${item.customHeight})` : item.size}
                                                </span> x {item.qty}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 align-top min-w-[280px] max-w-sm whitespace-normal">
                                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100 shadow-inner" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {order.designRequestText || '디자인 요청사항 없음'}
                                    </div>
                                    {order.modificationRequest && (
                                        <div className="mt-4 p-3 bg-pink-50 border border-pink-100 rounded-xl">
                                            <div className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1 flex items-center">
                                                <RefreshCcw className="w-3 h-3 mr-1" /> 고객 수정 요청 사항
                                            </div>
                                            <div className="text-xs text-slate-800 font-bold whitespace-pre-wrap leading-relaxed">
                                                {order.modificationRequest}
                                            </div>
                                        </div>
                                    )}
                                    {order.designFileUrl && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <a href={order.designFileUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-[11px] text-white hover:bg-blue-700 transition-all font-bold shadow-sm">
                                                <Download className="w-3 h-3 mr-1.5" /> 원본 파일 다운로드
                                            </a>
                                            <a href={order.designFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 transition-all font-medium">
                                                <ImageIcon className="w-3 h-3 mr-1.5" /> 새창에서 보기
                                            </a>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-top text-center">
                                    {order.total === '담당자 확인 중' ? (
                                        <button type="button" onClick={() => onOpenPriceModal(order)} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors flex items-center justify-center mx-auto shadow-sm">
                                            <Edit3 className="w-3 h-3 mr-1" /> 금액 산정하기
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center relative group">
                                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                {typeof order.total === 'number' ? `${order.total.toLocaleString()}원` : order.total}
                                                <button type="button" onClick={() => onOpenPriceModal(order)} className="text-slate-400 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100" title="금액 수정">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {typeof order.total === 'number' && <div className="text-[9px] text-slate-400 font-normal mt-0.5">VAT 별도</div>}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-top text-center">
                                    <select
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    >
                                        {Object.entries(STATUS_MAP).map(([key, label]) => (
                                            <option key={key} value={key} className="bg-white text-slate-900">{label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        {order.draftImageUrls && order.draftImageUrls.length > 0 && (
                                            <div className="flex flex-col items-end mb-1">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">최근 등록 시안</div>
                                                <div className="group relative">
                                                    <img
                                                        src={order.draftImageUrls[order.draftImageUrls.length - 1]}
                                                        alt="Latest Draft"
                                                        className="w-16 h-10 object-cover rounded-md border border-slate-200 shadow-sm cursor-pointer hover:border-slate-400 transition-all"
                                                        onClick={() => window.open(order.draftImageUrls[order.draftImageUrls.length - 1], '_blank')}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none">
                                                        <ImageIcon className="w-3 h-3" />
                                                    </div>
                                                </div>
                                                <a href={order.draftImageUrls[order.draftImageUrls.length - 1]} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold mt-1 hover:underline">
                                                    시안 크게보기
                                                </a>
                                            </div>
                                        )}
                                        {(order.status === 'NEW' || order.status === 'DESIGN' || order.status === 'MODIFY_REQUEST') && (
                                            <label className={`cursor-pointer bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center ml-auto ${isUploadingDraft[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <Send className="w-3 h-3 mr-1" /> {isUploadingDraft[order.id] ? '업로드 중...' : (order.status === 'MODIFY_REQUEST' ? '수정 시안 등록' : '시안 등록 및 알림')}
                                                <input type="file" className="hidden" accept="image/*" disabled={isUploadingDraft[order.id]} onChange={(e) => {
                                                    if (e.target.files[0]) handleUploadDraft(order.id, e.target.files[0]);
                                                    e.target.value = null;
                                                }} />
                                            </label>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onOpenShippingPanel(order)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-auto ${
                                                order.quoteSentAt
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                            }`}
                                        >
                                            <Truck className="w-3 h-3" />
                                            {order.quoteSentAt ? '견적 재발송' : '배송비 검토'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="8" className="p-8 text-center text-slate-500">등록된 주문이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
