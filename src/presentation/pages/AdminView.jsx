import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { OrderRepository } from '../../data/OrderRepository';
import { PartnerRepository } from '../../data/PartnerRepository';
import { useDialog } from '../components/DialogProvider';
import OrdersTable from '../components/admin/OrdersTable';
import PartnersTable from '../components/admin/PartnersTable';
import PartnerDetailModal from '../components/admin/PartnerDetailModal';
import PriceModal from '../components/admin/PriceModal';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '0000';

function AdminLoginScreen({ pin, setPin, onLogin }) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">관리자 로그인</h2>
                <p className="text-slate-500 mb-6 text-sm">허가된 관리자만 접근할 수 있습니다.</p>
                <form onSubmit={onLogin}>
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

export default function AdminView() {
    const { showAlert } = useDialog();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [activeTab, setActiveTab] = useState('orders');

    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [priceModalOrder, setPriceModalOrder] = useState(null);

    useEffect(() => {
        const adminAuth = localStorage.getItem('isAdminAuthenticated');
        if (adminAuth === 'true') setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        const unsubOrders = OrderRepository.subscribeToOrders(setOrders);
        const unsubPartners = PartnerRepository.subscribeToPartners(setPartners);
        return () => { unsubOrders(); unsubPartners(); };
    }, [isAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            localStorage.setItem('isAdminAuthenticated', 'true');
        } else {
            await showAlert('비밀번호가 틀렸습니다.', '오류');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        window.location.reload();
    };

    if (!isAuthenticated) {
        return <AdminLoginScreen pin={pin} setPin={setPin} onLogin={handleLogin} />;
    }

    const pendingOrdersCount = orders.filter(o => !['DONE', 'FINAL', 'CANCELLED'].includes(o.status)).length;
    const waitingPartnersCount = partners.filter(p => p.status === 'WAITING').length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 flex items-center tracking-tight">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-600" /> 관리자 대시보드
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">들어온 주문 내역과 파트너 가입 요청을 관리하세요.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    <div className="flex bg-slate-100 rounded-lg">
                        <button type="button" onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            주문 관리 ({pendingOrdersCount})
                        </button>
                        <button type="button" onClick={() => setActiveTab('partners')} className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            파트너 신청 관리 ({waitingPartnersCount})
                        </button>
                    </div>
                    <button type="button" onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto md:ml-0">
                        로그아웃
                    </button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <OrdersTable orders={orders} onOpenPriceModal={setPriceModalOrder} />
            )}

            {activeTab === 'partners' && (
                <PartnersTable partners={partners} onViewDetail={setSelectedPartner} />
            )}

            <PartnerDetailModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} />

            {priceModalOrder && (
                <PriceModal order={priceModalOrder} onClose={() => setPriceModalOrder(null)} />
            )}
        </div>
    );
}
