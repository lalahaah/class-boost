import { useState, useEffect } from 'react';
import {
    ShieldAlert, Lock, CheckCircle, Search, UserCheck,
    UserX, Edit3, Image as ImageIcon, Send, Trash2
} from 'lucide-react';
import { OrderRepository } from '../../data/OrderRepository';
import { PartnerRepository } from '../../data/PartnerRepository';
import { StorageService } from '../../data/StorageService';
import { STATUS_MAP, STATUS_COLORS, PRICING } from '../../core/constants';

// MVP: Hardcoded Admin Pin
const ADMIN_PIN = '0000';

export default function AdminView() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'partners'

    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            const unsubOrders = OrderRepository.subscribeToOrders(setOrders);
            const unsubPartners = PartnerRepository.subscribeToPartners(setPartners);
            return () => { unsubOrders(); unsubPartners(); };
        }
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) setIsAuthenticated(true);
        else alert('비밀번호가 틀렸습니다.');
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await OrderRepository.updateOrderStatus(orderId, newStatus);
        } catch (error) {
            alert('상태 업데이트 실패');
        }
    };

    const handleUpdateOrderPrice = async (orderId, total, items) => {
        try {
            // In a full app, you might want to show a modal to edit the custom sizes or individual prices.
            // Here we just update the total.
            const price = prompt('새로운 총 결제금액을 입력하세요 (숫자만, 배송비 불포함):', total === '담당자 확인 중' ? '' : total);
            if (price !== null) {
                await OrderRepository.updateOrderTotal(orderId, Number(price));
                // You would realistically also change status from WAIT_QUOTE to NEW or something here if it was waiting
                if (orders.find(o => o.id === orderId).status === 'WAIT_QUOTE') {
                    await OrderRepository.updateOrderStatus(orderId, 'NEW');
                }
            }
        } catch (e) { alert('금액 수정 실패'); }
    };

    const [isUploadingDraft, setIsUploadingDraft] = useState({});

    const handleUploadDraft = async (orderId, file) => {
        if (!file) return;

        try {
            setIsUploadingDraft(prev => ({ ...prev, [orderId]: true }));
            const downloadURL = await StorageService.uploadFile(file, 'draft_proofs');

            const order = orders.find(o => o.id === orderId);
            const currentDrafts = order.draftImageUrls || [];

            await OrderRepository.updateDraftImages(orderId, [...currentDrafts, downloadURL]);
            await handleUpdateOrderStatus(orderId, 'WAIT_CONFIRM');

            alert('시안 등록 및 상태 변경 완료');
        } catch (e) {
            alert('시안 업데이트 실패');
            console.error(e);
        } finally {
            setIsUploadingDraft(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleApprovePartner = async (partnerId) => {
        try {
            const generatedCode = `PTN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            await PartnerRepository.approvePartner(partnerId, generatedCode);
            alert(`승인 완료 (발급코드: ${generatedCode})`);
        } catch (e) { alert('승인 실패'); }
    };

    const handleRejectPartner = async (partnerId) => {
        if (window.confirm('정말 반려하시겠습니까?')) {
            try {
                await PartnerRepository.rejectPartner(partnerId);
            } catch (e) { alert('반려 실패'); }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">관리자 로그인</h2>
                    <p className="text-slate-500 mb-6 text-sm">허가된 관리자만 접근할 수 있습니다.</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none text-center tracking-[0.5em] text-lg font-bold bg-slate-50 focus:bg-white transition-colors mb-4"
                            placeholder="PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                            접속하기
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-slate-400">Demo PIN: 0000</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 flex items-center tracking-tight">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-600" /> 관리자 대시보드
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">들어온 주문 내역과 파트너 가입 요청을 관리하세요.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        주문 관리 ({orders.filter(o => !['DONE', 'CANCELLED'].includes(o.status)).length})
                    </button>
                    <button onClick={() => setActiveTab('partners')} className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        파트너 신청 관리 ({partners.filter(p => p.status === 'WAITING').length})
                    </button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="p-4 font-bold">주문번호/일시</th>
                                    <th className="p-4 font-bold">학원정보</th>
                                    <th className="p-4 font-bold">주문품목/디자인요청</th>
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
                                            <div className="text-slate-500 text-xs mt-1">{order.phone}</div>
                                        </td>
                                        <td className="p-4 align-top max-w-xs md:max-w-sm whitespace-normal">
                                            <div className="flex flex-col gap-1 mb-2">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="text-xs bg-slate-100 px-2 py-1 rounded w-fit">
                                                        <span className="font-bold">{item.size === 'CUSTOM' ? '별도규격' : item.size}</span> x {item.qty}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-600 line-clamp-2" title={order.designRequestText}>
                                                {order.designRequestText}
                                            </div>
                                            {order.designFileUrl && (
                                                <a href={order.designFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-xs text-blue-600 hover:underline">
                                                    <ImageIcon className="w-3 h-3 mr-1" /> 원본 첨부파일 보기
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-center">
                                            {order.status === 'WAIT_QUOTE' ? (
                                                <button onClick={() => handleUpdateOrderPrice(order.id, order.total, order.items)} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors flex items-center justify-center mx-auto">
                                                    <Edit3 className="w-3 h-3 mr-1" /> 금액 산정하기
                                                </button>
                                            ) : (
                                                <div className="font-bold text-slate-900">{typeof order.total === 'number' ? `${(order.total + order.shippingFee).toLocaleString()}원(배송비포함)` : order.total}</div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-center">
                                            <select
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            >
                                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                                    <option key={key} value={key} className="bg-white text-slate-900">{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            {(order.status === 'NEW' || order.status === 'DESIGN') && (
                                                <label className={`cursor-pointer bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center ml-auto ${isUploadingDraft[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <Send className="w-3 h-3 mr-1" /> {isUploadingDraft[order.id] ? '업로드 중...' : '시안 등록 및 알림'}
                                                    <input type="file" className="hidden" accept="image/*" disabled={isUploadingDraft[order.id]} onChange={(e) => {
                                                        if (e.target.files[0]) handleUploadDraft(order.id, e.target.files[0]);
                                                        // Reset file input
                                                        e.target.value = null;
                                                    }} />
                                                </label>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">등록된 주문이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'partners' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="p-4 font-bold">신청일시</th>
                                    <th className="p-4 font-bold">학원명</th>
                                    <th className="p-4 font-bold">연락처</th>
                                    <th className="p-4 font-bold text-center">상태</th>
                                    <th className="p-4 font-bold">발급코드</th>
                                    <th className="p-4 font-bold text-right">관리 (승인/반려)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {partners.sort((a, b) => b.createdAt - a.createdAt).map(partner => (
                                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-500">{partner.createdAt?.toLocaleString('ko-KR')}</td>
                                        <td className="p-4 font-bold text-slate-900">{partner.academyName}</td>
                                        <td className="p-4 font-medium">{partner.phone}</td>
                                        <td className="p-4 text-center">
                                            {partner.status === 'WAITING' && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">대기중</span>}
                                            {partner.status === 'APPROVED' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">승인됨</span>}
                                            {partner.status === 'REJECTED' && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">반려됨</span>}
                                        </td>
                                        <td className="p-4">
                                            {partner.code ? (
                                                <span className="font-mono bg-slate-100 px-2 py-1 rounded font-bold">{partner.code}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {partner.status === 'WAITING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleApprovePartner(partner.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors" title="승인">
                                                        <UserCheck className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleRejectPartner(partner.id)} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="반려">
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {partners.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">파트너 신청 내역이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
