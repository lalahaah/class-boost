import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, PackageSearch, AlertCircle, Phone, RefreshCcw, Download } from 'lucide-react';
import { OrderRepository } from '../../data/OrderRepository';
import { STATUS_MAP, STATUS_COLORS } from '../../core/constants';

export default function TrackingView() {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeOrders, setActiveOrders] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    // Firebase Realtime Subscriptions
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
        // Listen to all orders locally to filter by phone
        // In a real production app, we would query Firestore directly with 'where("phone", "==", phoneNumber)'
        // But since order amounts are small, subscribing to all and filtering is fine for MVP.
        const unsubscribe = OrderRepository.subscribeToOrders((data) => {
            setAllOrders(data);
        });
        return () => unsubscribe();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!phoneNumber) return;

        setIsSearching(true);
        setHasSearched(false);
        setErrorMsg('');

        setTimeout(() => {
            // Find orders matching phone
            const matchedOrders = allOrders.filter(order => order.phone.replace(/[^0-9]/g, '') === phoneNumber.replace(/[^0-9]/g, ''));
            setActiveOrders(matchedOrders.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
            setHasSearched(true);
            setIsSearching(false);
        }, 600);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            if (newStatus === 'CANCELLED') {
                const confirmed = window.confirm('정말 주문을 취소하시겠습니까?');
                if (!confirmed) return;
            }
            if (newStatus === 'APPROVED') {
                const confirmed = window.confirm('디자인 시안을 확정하시겠습니까? 확정 후에는 내용 수정이 어렵습니다.');
                if (!confirmed) return;
            }

            await OrderRepository.updateOrderStatus(orderId, newStatus);
            alert('상태가 업데이트 되었습니다.');

        } catch (error) {
            console.error(error);
            alert('업데이트 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PackageSearch className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">주문/배송 조회</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">주문 시 등록하신 담당자 연락처 뒷 4자리 또는 전체 번호를 입력하시면 진행 상황을 확인하고 시안을 로드할 수 있습니다.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 mb-8 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="tel"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-lg bg-slate-50 focus:bg-white transition-colors"
                            placeholder="연락처를 입력하세요 (예: 010-0000-0000)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !phoneNumber}
                        className={`cursor-pointer w-full mt-4 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex justify-center items-center ${isSearching ? 'opacity-70' : ''}`}
                    >
                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
                        내역 조회하기
                    </button>
                </form>
            </div>

            {hasSearched && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center mb-6 border-b border-slate-200 pb-4">
                        조회 결과 <span className="ml-2 bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full font-bold">{activeOrders.length}건</span>
                    </h3>

                    {activeOrders.length === 0 ? (
                        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium text-lg">입력하신 연락처로 조회된 주문 내역이 없습니다.</p>
                            <p className="text-slate-400 mt-2 text-sm">연락처를 다시 확인해주시거나 고객센터로 문의해주세요.</p>
                        </div>
                    ) : (
                        activeOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50">
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 mb-1">
                                            주문일시: {order.createdAt?.toDate().toLocaleString('ko-KR')}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                            주문번호: {order.id.substring(0, 8).toUpperCase()}
                                            <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_MAP[order.status] || order.status}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="text-right mt-4 md:mt-0 font-bold w-full md:w-auto flex justify-between md:block">
                                        <span className="text-slate-500 text-sm block md:inline md:mr-2">총 결제금액</span>
                                        <span className="text-xl text-slate-900">{typeof order.total === 'number' ? `${order.total.toLocaleString()}원` : order.total}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* 진행 상태 바 UI */}
                                    <div className="mb-8 pt-4">
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
                                            {(() => {
                                                const steps = [
                                                    { id: 'NEW', label: '주문접수' },
                                                    { id: 'DESIGN', label: '시안작업' },
                                                    { id: 'WAIT_CONFIRM', label: '시안확인요청' },
                                                    { id: 'APPROVED', label: '제작진행' },
                                                    { id: 'SHIPPING', label: '배송출발' }
                                                ];
                                                let currentIndex = steps.findIndex(s => s.id === order.status);

                                                // Treat special cases
                                                if (order.status === 'WAIT_QUOTE') currentIndex = 0;
                                                if (order.status === 'DONE') currentIndex = 4;
                                                if (order.status === 'CANCELLED') currentIndex = -1;

                                                return steps.map((step, index) => {
                                                    const isActive = index <= currentIndex;
                                                    const isCurrent = index === currentIndex;
                                                    return (
                                                        <div key={step.id} className="flex flex-col items-center">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${isActive ? (isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-slate-800 text-white') : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                                                {index + 1}
                                                            </div>
                                                            <span className={`text-[10px] md:text-xs mt-2 font-bold ${isCurrent ? 'text-orange-600' : isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    )
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm">
                                        <div>
                                            <span className="block text-slate-500 font-bold mb-1 text-xs">학원명</span>
                                            <span className="font-medium text-slate-900">{order.academyName} (연락처: {order.phone})</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-500 font-bold mb-1 text-xs">주문 품목 ({order.items.length}건)</span>
                                            <ul className="list-disc pl-4 font-medium text-slate-900 space-y-1">
                                                {order.items.map(item => (
                                                    <li key={item.id}>
                                                        {item.size === 'CUSTOM' ? `[별도제작] ${item.customWidth}*${item.customHeight}` : item.size} ({item.qty}개)
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-6">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center text-sm">
                                            <div className="w-1.5 h-4 bg-orange-500 rounded-full mr-2"></div> 시안 확인 및 커뮤니케이션
                                        </h4>

                                        {order.status === 'WAIT_CONFIRM' && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center shadow-inner">
                                                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                                                <h5 className="font-extrabold text-orange-800 mb-2">원장님, 시안이 준비되었습니다!</h5>
                                                <p className="text-orange-700 text-sm mb-4">확정해주시면 바로 고퀄리티 제작에 들어갑니다.<br />수정이 필요하신 경우 카카오톡으로 남겨주세요.</p>

                                                {order.draftImageUrls && order.draftImageUrls.length > 0 && (
                                                    <div className="mb-6">
                                                        <h6 className="font-bold text-slate-700 mb-2 text-sm text-left">등록된 시안 이미지</h6>
                                                        <div className="flex gap-4 overflow-x-auto pb-4">
                                                            {order.draftImageUrls.map((url, idx) => (
                                                                <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0 w-32 h-32 relative group rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                                    <img src={url} alt={`시안 ${idx + 1}`} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Download className="text-slate-900 w-8 h-8" />
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 justify-center">
                                                    <button onClick={() => handleStatusUpdate(order.id, 'APPROVED')} className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">시안 최종 확정하기</button>
                                                    <a href="http://pf.kakao.com/_xxxxxx/chat" target="_blank" rel="noreferrer" className="cursor-pointer bg-yellow-400 text-yellow-950 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow-md flex items-center">
                                                        카톡으로 수정 요청
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {['NEW', 'WAIT_QUOTE'].includes(order.status) && (
                                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
                                                <p className="text-slate-500 bg-slate-50 px-4 py-3 rounded-lg w-full">담당자가 아직 디자인 작업/견적 산출을 시작하지 않았습니다.</p>
                                                <button onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="cursor-pointer whitespace-nowrap px-4 py-3 rounded-lg font-bold text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors w-full md:w-auto text-center">
                                                    주문 취소
                                                </button>
                                            </div>
                                        )}

                                        {['DESIGN', 'APPROVED', 'SHIPPING', 'DONE'].includes(order.status) && (
                                            <div className="flex gap-4 items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                    <RefreshCcw className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-bold text-slate-900 mb-0.5">진행 현황 업데이트 완료</p>
                                                    <p className="text-slate-500">순조롭게 진행 중입니다. 카카오톡 알림톡으로도 안내해 드립니다.</p>
                                                </div>
                                            </div>
                                        )}

                                        {order.status === 'CANCELLED' && (
                                            <div className="text-sm p-4 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 flex items-center">
                                                <AlertCircle className="w-5 h-5 mr-2" /> 이 주문은 취소되었습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
