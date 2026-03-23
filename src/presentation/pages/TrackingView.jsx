import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LayoutDashboard, Plus, UserCog } from 'lucide-react';
import { OrderRepository } from '../../data/OrderRepository';
import { PartnerRepository } from '../../data/PartnerRepository';
import { usePartnerAuth } from '../hooks/usePartnerAuth';
import PartnerAuthForm from '../components/PartnerAuthForm';
import ProfileModal from '../components/tracking/ProfileModal';
import OrderCard from '../components/tracking/OrderCard';

export default function TrackingView() {
    const navigate = useNavigate();
    const [allOrders, setAllOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileInitialData, setProfileInitialData] = useState({});

    const auth = usePartnerAuth({
        onLogin: ({ id, code }) => {
            if (id && id !== 'DEMO' && code) {
                PartnerRepository.verifyPartnerCode(code).then(partner => {
                    if (partner) {
                        setProfileInitialData({
                            address: partner.address || '',
                            managerName: partner.managerName || '',
                            phone: partner.phone || '',
                            taxEmail: partner.taxEmail || '',
                            businessNumber: partner.businessNumber || '',
                            ceoName: partner.ceoName || ''
                        });
                    }
                }).catch(() => {});
            }
        }
    });

    useEffect(() => {
        const unsubscribe = OrderRepository.subscribeToOrders(setAllOrders);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (auth.isAuthorized) {
            const matched = allOrders
                .filter(order => order.partnerId === auth.partnerId)
                .sort((a, b) => b.createdAt - a.createdAt);
            setActiveOrders(matched);
        }
    }, [allOrders, auth.isAuthorized, auth.partnerId]);

    if (!auth.isAuthorized) {
        return (
            <PartnerAuthForm
                subtitle="주문 현황 및 작업 프로세스 확인을 위해<br /><span class='text-slate-400'>발급받으신 파트너 코드를 입력해주세요.</span>"
                submitLabel="인증하고 현황 확인하기"
                {...auth}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mr-6 border border-orange-200 shadow-sm">
                        <LayoutDashboard className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{auth.academyName} 님, 환영합니다.</h2>
                        <p className="text-slate-500 font-medium">아임오케이 비즈니스 파트너 전용 대시보드</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="group text-sm border border-slate-200 bg-slate-50 px-5 py-3 rounded-xl flex items-center shadow-sm hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                    >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-slate-500 mr-2 font-medium">파트너 코드:</span>
                        <span className="font-bold text-slate-900 tracking-wider mr-2">{auth.authCode.toUpperCase()}</span>
                        <UserCog className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </button>
                    <button
                        onClick={() => navigate('/order')}
                        className="cursor-pointer bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] text-sm flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> 신규 디자인 의뢰하기
                    </button>
                </div>
            </div>

            {/* Orders Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                        주문 및 작업 현황
                    </h3>
                    <span className="bg-orange-100 text-orange-700 text-sm px-4 py-1 rounded-full font-extrabold border border-orange-200">
                        총 {activeOrders.length}건
                    </span>
                </div>

                {activeOrders.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <AlertCircle className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-extrabold text-xl">진행 중인 주문 내역이 없습니다.</p>
                        <p className="text-slate-500 mt-3 text-base leading-relaxed">새로운 디자인 작업을 요청해주시면,<br />이곳에서 쉽고 빠르게 관리할 수 있습니다.</p>
                        <button onClick={() => navigate('/order')} className="mt-8 bg-[#0f172a] text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]">
                            신규 디자인 의뢰하기
                        </button>
                    </div>
                ) : (
                    activeOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
            </div>

            {showProfileModal && (
                <ProfileModal
                    partnerId={auth.partnerId}
                    academyName={auth.academyName}
                    initialData={profileInitialData}
                    onClose={() => setShowProfileModal(false)}
                />
            )}
        </div>
    );
}
