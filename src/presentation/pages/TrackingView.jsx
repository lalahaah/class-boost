import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageSearch, AlertCircle, Phone, RefreshCcw, Download, Lock, KeyRound, Star, LayoutDashboard, Plus, ShieldCheck, Search, Image, Check, Printer, UserCog, Building, Mail, MapPin, Hash, User } from 'lucide-react';
import { OrderRepository } from '../../data/OrderRepository';
import { PartnerRepository } from '../../data/PartnerRepository';
import { STATUS_MAP, STATUS_COLORS, PRICING } from '../../core/constants';
import { useDialog } from '../components/DialogProvider';

export default function TrackingView() {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useDialog();
    const [authCode, setAuthCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [authMode, setAuthMode] = useState('login'); // 'login', 'request', 'find'
    const [inquiryData, setInquiryData] = useState({ academyName: '', phone: '' });
    const [isAuthorized, setIsAuthorized] = useState(() => !!localStorage.getItem('partnerSession'));
    const [partnerId, setPartnerId] = useState(null);
    const [academyName, setAcademyName] = useState('');

    // Firebase Realtime Subscriptions
    const [allOrders, setAllOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [modifyingOrderId, setModifyingOrderId] = useState(null);
    const [modText, setModText] = useState('');
    const [showHistory, setShowHistory] = useState({}); // { orderId: boolean }
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        address: '',
        managerName: '',
        phone: '',
        taxEmail: '',
        businessNumber: '',
        ceoName: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load initial profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (isAuthorized && partnerId && partnerId !== 'DEMO') {
                try {
                    // We can use verifyPartnerCode or similar, but for now we'll rely on the session
                    // or fetch the latest data from DB
                    const partner = await PartnerRepository.verifyPartnerCode(authCode);
                    if (partner) {
                        setProfileData({
                            address: partner.address || '',
                            managerName: partner.managerName || '',
                            phone: partner.phone || '',
                            taxEmail: partner.taxEmail || '',
                            businessNumber: partner.businessNumber || '',
                            ceoName: partner.ceoName || ''
                        });
                    }
                } catch (e) {
                    console.error('프로필 로드 실패:', e);
                }
            }
        };
        loadProfile();
    }, [isAuthorized, partnerId, authCode]);

    // 세션 유지를 위한 로직 추가
    useEffect(() => {
        try {
            const savedPartner = localStorage.getItem('partnerSession');
            if (savedPartner) {
                const { id, academyName: savedName, code } = JSON.parse(savedPartner);
                setIsAuthorized(true);
                setPartnerId(id);
                setAcademyName(savedName);
                setAuthCode(code);
            }
        } catch (e) {
            console.error('세션 복구 실패:', e);
            localStorage.removeItem('partnerSession');
        }

        // Listen to all orders locally to filter by partnerId
        const unsubscribe = OrderRepository.subscribeToOrders((data) => {
            setAllOrders(data);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isAuthorized) {
            // Filter orders belonging to this partner
            const matchedOrders = allOrders.filter(order => order.partnerId === partnerId);
            setActiveOrders(matchedOrders.sort((a, b) => b.createdAt - a.createdAt));
        }
    }, [allOrders, isAuthorized, partnerId]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();

        // MVP 데모용 하드코딩 패스워드
        if (authCode.toUpperCase() === 'VIP2026') {
            const demoPartner = { id: 'DEMO', academyName: '체험용(VIP)', code: 'VIP2026' };
            setIsAuthorized(true);
            setAuthError('');
            setPartnerId(demoPartner.id);
            setAcademyName(demoPartner.academyName);
            localStorage.setItem('partnerSession', JSON.stringify(demoPartner));
            return;
        }

        try {
            const partnerData = await PartnerRepository.verifyPartnerCode(authCode.toUpperCase());
            if (partnerData) {
                const partnerSession = {
                    id: partnerData.id,
                    academyName: partnerData.academyName,
                    code: authCode.toUpperCase()
                };
                setIsAuthorized(true);
                setAuthError('');
                setPartnerId(partnerSession.id);
                if (partnerData.academyName) setAcademyName(partnerData.academyName);
                localStorage.setItem('partnerSession', JSON.stringify(partnerSession));
            } else {
                setAuthError('유효하지 않은 파트너 코드입니다. 아임오케이에 문의해주세요.');
            }
        } catch (error) {
            console.error('인증 오류:', error);
            setAuthError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleRequestPartner = async (e) => {
        e.preventDefault();
        try {
            await PartnerRepository.createPartnerRequest({
                academyName: inquiryData.academyName,
                phone: inquiryData.phone
            });
            await showAlert(`[접수 완료] ${inquiryData.academyName} 원장님, 파트너 신청이 완료되었습니다.\n담당자가 확인 후 기재하신 연락처로 코드를 발급해 드립니다.`);
            setAuthMode('login');
            setInquiryData({ academyName: '', phone: '' });
        } catch (error) {
            console.error(error);
            showAlert('신청 중 오류가 발생했습니다.', '오류');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!partnerId || partnerId === 'DEMO') {
            await showAlert('데모 계정은 정보를 수정할 수 없습니다.', '확인');
            return;
        }

        setIsSaving(true);
        try {
            await PartnerRepository.updatePartnerProfile(partnerId, profileData);
            await showAlert('학원 정보가 성공적으로 업데이트되었습니다.', '저장 완료');
            setShowProfileModal(false);
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            await showAlert('정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.', '오류');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            if (newStatus === 'CANCELLED') {
                const confirmed = await showConfirm('정말 주문을 취소하시겠습니까?');
                if (!confirmed) return;
            }
            if (newStatus === 'APPROVED') {
                const confirmed = await showConfirm('디자인 시안을 최종 확정하시겠습니까?\n확정 후에는 수정이 불가능하며 바로 제작 및 배송 절차가 진행됩니다.');
                if (!confirmed) return;
            }

            await OrderRepository.updateOrderStatus(orderId, newStatus);
            await showAlert(newStatus === 'APPROVED' ? '시안이 최종 확정되었습니다. 제작을 시작합니다!' : '상태가 업데이트 되었습니다.');

        } catch (error) {
            console.error(error);
            showAlert('업데이트 중 오류가 발생했습니다.', '오류');
        }
    };

    const handleSubmitModification = async (orderId) => {
        if (!modText.trim()) {
            await showAlert('수청 요청 내용을 입력해주세요.', '확인');
            return;
        }

        try {
            await OrderRepository.updateOrder(orderId, {
                status: 'MODIFY_REQUEST',
                modificationRequest: modText
            });
            await showAlert('수정 요청이 접수되었습니다. 담당자가 확인 후 시안을 다시 업로드해 드립니다.');
            setModifyingOrderId(null);
            setModText('');
        } catch (error) {
            console.error(error);
            showAlert('상태 업데이트 중 오류가 발생했습니다.', '오류');
        }
    };

    const handlePrintQuote = (order) => {
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const today = new Date().toLocaleDateString('ko-KR');

        const isEstimated = typeof order.total === 'number';
        const grandTotal = isEstimated ? order.total : 0;

        let calculatedShippingFee = order.shippingFee || 0;
        if (!isEstimated && !order.shippingFee) {
            let totalQty = 0;
            (order.items || []).forEach(item => totalQty += item.qty);
            calculatedShippingFee = totalQty > 0 ? Math.ceil(totalQty / 3) * 8000 : 0;
        }

        const itemsHtml = (order.items || []).map((item, index) => {
            const sizeStr = item.size === 'CUSTOM' ? `${item.customWidth}*${item.customHeight} (별도 규격)` : item.size;

            let amount = 0;
            let unitPrice = 0;

            if (item.price !== undefined && item.price !== null) {
                amount = item.price;
                unitPrice = item.qty > 0 ? Math.floor(amount / item.qty) : 0;
            } else if (item.size !== 'CUSTOM') {
                unitPrice = PRICING[item.size] || 0;
                amount = unitPrice * item.qty;
            }

            const priceStr = isEstimated || item.size !== 'CUSTOM' ? unitPrice.toLocaleString() : '별도산정';
            const amountStr = isEstimated || item.size !== 'CUSTOM' ? amount.toLocaleString() : '별도산정';

            return `
        <tr>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">자석 현수막 / 홍보물 (${sizeStr})</td>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${item.qty}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${priceStr}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${amountStr}</td>
        </tr>
      `;
        }).join('');

        const html = `
      <html>
        <head>
          <title>견적서 - ${order.academyName}</title>
          <style>
            body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 36px; letter-spacing: 15px; text-decoration: underline; margin-bottom: 10px; }
            .info-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .info-table td { padding: 5px; vertical-align: top; }
            .provider-box { border: 2px solid #1e293b; padding: 15px; border-radius: 8px; }
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
            .item-table th, .item-table td { border: 1px solid #cbd5e1; padding: 10px; }
            .item-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
            .total-box { background-color: #f8fafc; border: 2px solid #1e293b; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            @media print {
              @page { margin: 15mm; }
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px;">
              🖨️ 인쇄 또는 PDF로 저장하기
            </button>
          </div>
          <div class="header"><h1>견적서</h1></div>
          <table class="info-table">
            <tr>
              <td style="width: 50%;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #1e293b; display: inline-block; padding-bottom: 5px;">
                  ${order.academyName} 귀하
                </div>
                <div style="margin-top: 10px;"><strong>견적일자:</strong> ${today}</div>
                <div style="margin-top: 5px;">아래와 같이 견적합니다.</div>
                <div style="margin-top: 5px; font-size: 12px; color: #64748b;">주문번호: ${order.customId || order.id.substring(0, 8).toUpperCase()}</div>
              </td>
              <td style="width: 50%;">
                <div class="provider-box">
                  <table style="width:100%; font-size: 14px; line-height: 1.6;">
                    <tr><td style="width: 80px; font-weight: bold;">공급자</td><td>주식회사 아임오케이 (imokayy Co., Ltd.)</td></tr>
                    <tr><td style="font-weight: bold;">사업자번호</td><td>841-88-02576</td></tr>
                    <tr><td style="font-weight: bold;">대표이사</td><td>손미선 <span style="position: relative; display: inline-block; margin-left: 10px;">(인)<img src="/seal.png" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 45px; height: 45px; opacity: 0.9;" /></span></td></tr>
                    <tr><td style="font-weight: bold;">주소</td><td>경기도 화성시 동탄기흥로 585, 201동 207호</td></tr>
                    <tr><td style="font-weight: bold;">고객센터</td><td>010-5955-4936</td></tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
          ${!isEstimated ?
                `<div style="color: #ea580c; font-weight: bold; margin-bottom: 20px; text-align: center; border: 1px solid #ea580c; padding: 15px; background: #fff7ed;">
              * 직접 입력하신 규격이 포함되어 있어, 정확한 총 합계 금액은 담당자 확인 후 재안내 드립니다.
            </div>` :
                `<div class="total-box">
              합계금액: ₩ ${grandTotal.toLocaleString()} (VAT 별도)
            </div>`
            }
          <table class="item-table">
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th>품목 및 규격</th>
                <th style="width: 60px;">수량</th>
                <th style="width: 120px;">단가(원)</th>
                <th style="width: 120px;">공급가액(원)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="4" style="text-align: right; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">배송비 (포장비 포함)</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${calculatedShippingFee.toLocaleString()}</td>
              </tr>
              ${isEstimated ? `
              <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="4" style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">최종 합계 (VAT 별도)</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">₩ ${grandTotal.toLocaleString()}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
          <div style="margin-top: 20px; font-size: 13px; color: #64748b;">
            <p>* 본 견적서의 유효기간은 발행일로부터 15일입니다.</p>
            <p>* 디자인 난이도 및 추가 요청사항에 따라 최종 금액이 변동될 수 있습니다.</p>
          </div>
          <div style="text-align: right; margin-top: 50px;">
            <p>감사합니다.</p>
            <h2 style="margin-top: 10px; color: #1e293b;">클래스부스트 (아임오케이)</h2>
          </div>
        </body>
      </html>
    `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    };


    if (!isAuthorized) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <div className="p-10 text-center relative">
                    {authMode === 'login' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Lock Icon Box */}
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ring-8 ring-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <Lock className="h-8 w-8 text-slate-700" strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Title & Subtitle */}
                            <h2 className="text-[1.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">파트너 전용 공간</h2>
                            <p className="text-slate-500 mb-10 text-sm leading-relaxed font-medium">
                                주문 현황 및 작업 프로세스 확인을 위해<br />
                                <span className="text-slate-400">발급받으신 파트너 코드를 입력해주세요.</span>
                            </p>

                            {/* Form */}
                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold tracking-tight text-center text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-lg placeholder:text-slate-300 uppercase"
                                        placeholder="코드를 입력하세요"
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{authError}</p>}

                                <button type="submit" className="cursor-pointer w-full bg-[#0f172a] text-white px-6 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-orange-500/10 active:scale-[0.98] mt-2 text-lg">
                                    인증하고 현황 확인하기
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-8 h-px bg-slate-100 w-full"></div>

                            {/* Footer Links */}
                            <div className="flex flex-col space-y-5">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('request')}
                                    className="flex items-center justify-center space-x-2 text-orange-600 font-extrabold hover:underline transition-all group mx-auto"
                                >
                                    <Star className="w-5 h-5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                                    <span>신규 파트너 신청하기</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('find')}
                                    className="text-slate-400 text-[13px] font-medium hover:text-slate-600 transition-colors"
                                >
                                    기존 파트너 코드를 잊어버리셨나요?
                                </button>
                            </div>
                        </div>
                    )}

                    {authMode === 'request' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-20 h-20 bg-orange-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-orange-100 shadow-sm">
                                <Star className="h-10 w-10 text-orange-500 fill-orange-500" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">신규 파트너 신청</h2>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">학원명과 연락처를 남겨주시면,<br />아임오케이 담당자가 승인 후 코드를 발급해 드립니다.</p>
                            <form onSubmit={handleRequestPartner} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">학원명</label>
                                    <input required type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-slate-50/50 focus:bg-white transition-all font-bold placeholder:text-slate-300" placeholder="예: 정석수학학원" value={inquiryData.academyName} onChange={(e) => setInquiryData({ ...inquiryData, academyName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">원장님(담당자) 연락처</label>
                                    <input required type="tel" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-slate-50/50 focus:bg-white transition-all font-bold placeholder:text-slate-300" placeholder="010-0000-0000" value={inquiryData.phone} onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })} />
                                </div>
                                <button type="submit" className="cursor-pointer w-full bg-orange-600 text-white px-6 py-5 rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all mt-4 text-lg active:scale-[0.98]">파트너 신청하기</button>
                                <button type="button" onClick={() => setAuthMode('login')} className="cursor-pointer w-full bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-base">뒤로 가기</button>
                            </form>
                        </div>
                    )}

                    {authMode === 'find' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                                <Search className="h-10 w-10 text-slate-600" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">파트너 코드 찾기</h2>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">기존에 등록하신 연락처를 입력하시면<br />카카오톡으로 코드를 다시 보내드립니다.</p>
                            <form onSubmit={async (e) => { e.preventDefault(); await showAlert(`[발송 완료] 입력하신 연락처(${inquiryData.phone})로 코드를 다시 발송했습니다.\n(데모: VIP2026)`); setAuthMode('login'); setInquiryData({ academyName: '', phone: '' }); }} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2 ml-1 uppercase tracking-wider">등록된 연락처</label>
                                    <input required type="tel" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50 focus:bg-white transition-all font-bold placeholder:text-slate-300" placeholder="010-0000-0000" value={inquiryData.phone} onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })} />
                                </div>
                                <button type="submit" className="cursor-pointer w-full bg-slate-900 text-white px-6 py-5 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all mt-4 text-lg active:scale-[0.98]">카카오톡으로 코드 받기</button>
                                <button type="button" onClick={() => setAuthMode('login')} className="cursor-pointer w-full bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-base">뒤로 가기</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
            {/* Header Section - Matched with OrderView */}
            <div className="mb-10 flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mr-6 border border-orange-200 shadow-sm">
                        <LayoutDashboard className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{academyName} 님, 환영합니다.</h2>
                        <p className="text-slate-500 font-medium">아임오케이 비즈니스 파트너 전용 대시보드</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="group text-sm border border-slate-200 bg-slate-50 px-5 py-3 rounded-xl flex items-center shadow-sm hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                >
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-slate-500 mr-2 font-medium">파트너 코드:</span>
                    <span className="font-bold text-slate-900 tracking-wider mr-2">
                        {authCode.toUpperCase()}
                    </span>
                    <UserCog className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </button>
                <button
                    onClick={() => navigate('/order')}
                    className="cursor-pointer bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] text-sm flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> 신규 디자인 의뢰하기
                </button>
            </div>

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
                        <button
                            onClick={() => navigate('/order')}
                            className="mt-8 bg-[#0f172a] text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
                        >
                            신규 디자인 의뢰하기
                        </button>
                    </div>
                ) : (
                    activeOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 hover:shadow-md transition-shadow">
                            <div className="border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50">
                                <div>
                                    <div className="text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-widest">
                                        ORDERED AT {order.createdAt?.toLocaleString('ko-KR')}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                        주문번호: {order.customId || order.id.substring(0, 8).toUpperCase()}
                                        <span className={`ml-3 px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {STATUS_MAP[order.status] || order.status}
                                        </span>
                                    </h3>
                                </div>
                                <div className="text-right mt-4 md:mt-0 font-bold w-full md:w-auto flex flex-col items-end gap-2 text-right">
                                    <div className="flex justify-between md:block items-center w-full md:w-auto px-1 md:px-0">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block md:inline md:mr-3">Total Amount</span>
                                        <span className="text-2xl text-slate-900 font-extrabold tracking-tight">
                                            {typeof order.total === 'number' ? `${order.total.toLocaleString()}원` : order.total}
                                            {typeof order.total === 'number' && <span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-wider">VAT 별도</span>}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePrintQuote(order)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-end"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        견적서 다운로드/인쇄
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Status Progress Bar - Polished */}
                                <div className="mb-14 pt-4 px-2 sm:px-4">
                                    <div className="flex items-center justify-between relative">
                                        <div className="absolute top-5 md:top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 -translate-y-1/2"></div>
                                        {(() => {
                                            const steps = [
                                                { id: 'NEW', label: '신규접수' },
                                                { id: 'DESIGN', label: '시안작업' },
                                                { id: 'WAIT_CONFIRM', label: '시안 확인' },
                                                { id: 'APPROVED', label: '제작중' },
                                                { id: 'SHIPPING', label: '배송중' }
                                            ];
                                            let currentIndex = steps.findIndex(s => s.id === order.status);

                                            if (order.status === 'DONE' || order.status === 'TAX_INVOICE') currentIndex = 5;
                                            if (order.status === 'CANCELLED') currentIndex = -1;

                                            return steps.map((step, index) => {
                                                const isActive = index <= currentIndex;
                                                const isCurrent = index === currentIndex;
                                                return (
                                                    <div key={step.id} className="flex flex-col items-center relative flex-1">
                                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-extrabold text-[10px] md:text-xs shadow-sm transition-all duration-500 ${isActive ? (isCurrent ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg scale-110' : 'bg-[#0f172a] text-white') : 'bg-white border border-slate-200 text-slate-300'}`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className={`mt-3 h-8 flex items-start justify-center text-center px-1`}>
                                                            <span className={`text-[10px] md:text-[13px] leading-tight font-bold transition-colors ${isCurrent ? 'text-orange-600' : isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            });
                                        })()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 p-5 md:p-6 rounded-2xl border border-slate-100 mb-8 text-sm mt-4">
                                    <div>
                                        <span className="block text-slate-400 font-extrabold mb-2 text-[11px] uppercase tracking-wider">학원 및 연락처</span>
                                        <span className="font-bold text-slate-900 text-base">{order.academyName}</span>
                                        <span className="text-slate-500 block mt-1">{order.phone}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 font-extrabold mb-2 text-[11px] uppercase tracking-wider">주문 내역 ({(order.items || []).length}건)</span>
                                        <ul className="space-y-1.5 font-bold text-slate-700">
                                            {(order.items || []).map(item => (
                                                <li key={item.id} className="flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2.5"></div>
                                                    {item.size === 'CUSTOM' ? `[별도 규격] ${item.customWidth}*${item.customHeight}` : item.size}
                                                    <span className="ml-2 text-slate-400 font-medium">/ {item.qty}개</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-8">
                                    <h4 className="font-extrabold text-slate-900 mb-6 flex items-center text-sm uppercase tracking-tight">
                                        <div className="w-2 h-5 bg-[#0f172a] rounded-full mr-3"></div> 시안 확인 및 커뮤니케이션
                                    </h4>

                                    {order.draftImageUrls && order.draftImageUrls.length > 0 && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                                        <Image className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-900">제작 시안 확인</h5>
                                                        <p className="text-[10px] text-slate-500 font-medium">관리자가 등록한 {order.draftImageUrls.length}번째 시안입니다</p>
                                                    </div>
                                                </div>

                                                {order.draftImageUrls.length > 1 && (
                                                    <button
                                                        onClick={() => setShowHistory(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                                                        className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-1.5"
                                                    >
                                                        <RefreshCcw className={`w-3 h-3 ${showHistory[order.id] ? 'rotate-180' : ''} transition-transform`} />
                                                        {showHistory[order.id] ? '최신 시안만 보기' : `이전 시안 보기 (${order.draftImageUrls.length - 1})`}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                {!showHistory[order.id] ? (
                                                    <div className="relative animate-in fade-in duration-500">
                                                        <div className="absolute -top-3 -left-3 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full z-10 shadow-lg uppercase tracking-wider">Latest Version</div>
                                                        <img
                                                            src={order.draftImageUrls[order.draftImageUrls.length - 1]}
                                                            alt="Latest Draft"
                                                            className="w-full h-auto rounded-2xl shadow-xl border-4 border-white cursor-zoom-in hover:scale-[1.005] transition-transform"
                                                            onClick={() => window.open(order.draftImageUrls[order.draftImageUrls.length - 1], '_blank')}
                                                        />
                                                        <div className="mt-4 flex justify-center">
                                                            <a
                                                                href={order.draftImageUrls[order.draftImageUrls.length - 1]}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                                            >
                                                                <Download className="w-4 h-4 text-indigo-600" /> 시안 다운로드
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                        {[...order.draftImageUrls].reverse().map((url, index) => (
                                                            <div key={index} className="relative">
                                                                <div className={`absolute -top-3 -left-3 ${index === 0 ? 'bg-indigo-600' : 'bg-slate-400'} text-white text-[10px] font-black px-3 py-1 rounded-full z-10 shadow-md`}>
                                                                    {index === 0 ? 'LATEST' : `v${order.draftImageUrls.length - index}`}
                                                                </div>
                                                                <img
                                                                    src={url}
                                                                    alt={`Draft v${order.draftImageUrls.length - index}`}
                                                                    className="w-full h-auto rounded-xl shadow-md border-2 border-white grayscale-[0.2] hover:grayscale-0 transition-all cursor-zoom-in"
                                                                    onClick={() => window.open(url, '_blank')}
                                                                />
                                                                <p className="mt-2 text-center text-[11px] font-bold text-slate-500">
                                                                    {index === 0 ? '현재 시안' : `차수 #${order.draftImageUrls.length - index} 시안`}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {order.status === 'WAIT_CONFIRM' && (
                                                <div className="mt-10 pt-10 border-t border-slate-200">
                                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                        {modifyingOrderId === order.id ? (
                                                            <div className="w-full max-w-lg animate-in slide-in-from-top-2 duration-300">
                                                                <textarea
                                                                    className="w-full p-4 rounded-xl border-2 border-orange-200 focus:border-orange-500 outline-none text-sm font-medium h-32 mb-3 bg-white shadow-inner"
                                                                    placeholder="어떤 부분을 수정하고 싶으신가요? 자세히 적어주시면 정확한 반영이 가능합니다."
                                                                    value={modText}
                                                                    onChange={(e) => setModText(e.target.value)}
                                                                ></textarea>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleSubmitModification(order.id)}
                                                                        className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg text-sm"
                                                                    >
                                                                        수정 요청 전송
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setModifyingOrderId(null); setModText(''); }}
                                                                        className="px-6 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                                                                    >
                                                                        취소
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <button type="button" onClick={() => handleStatusUpdate(order.id, 'APPROVED')} className="cursor-pointer bg-indigo-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-extrabold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex-1 md:min-w-[200px] text-base md:text-lg flex items-center justify-center gap-2">
                                                                    <Check className="w-5 h-5" /> 시안 최종 확정
                                                                </button>
                                                                <button
                                                                    onClick={() => setModifyingOrderId(order.id)}
                                                                    className="cursor-pointer bg-white border-2 border-orange-500 text-orange-600 px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-md flex-1 md:min-w-[200px] text-base md:text-lg"
                                                                >
                                                                    시안 수정 요청
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {order.status === 'MODIFY_REQUEST' && (
                                        <div className="bg-pink-50/50 border border-pink-100 rounded-3xl p-8 text-center shadow-sm">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-pink-100">
                                                <RefreshCcw className="w-8 h-8 text-pink-500" />
                                            </div>
                                            <h5 className="text-xl font-extrabold text-pink-900 mb-2">시안 수정 요청이 접수되었습니다</h5>
                                            <p className="text-pink-700/80 text-sm mb-6 font-medium">담당자가 요청하신 내용을 확인하여 작업을 진행 중입니다.<br />완료되면 문자로 다시 안내해 드립니다.</p>
                                            <div className="max-w-md mx-auto bg-white/80 p-5 rounded-2xl border border-pink-100 text-left">
                                                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-2">나의 수정 요청 내용</span>
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-bold">{order.modificationRequest}</p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'NEW' && (
                                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center text-slate-500 font-medium">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center mr-4">
                                                    <RefreshCcw className={`w-5 h-5 text-indigo-500 ${order.total === '담당자 확인 중' ? 'animate-spin' : ''}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">
                                                        {order.total === '담당자 확인 중'
                                                            ? '담당자가 견적 금액을 확인 중입니다'
                                                            : (order.items.some(i => i.size === 'CUSTOM') ? '맞춤 견적 금액 산정이 완료되었습니다' : '담당 디자이너가 배정되고 있습니다')}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {order.total === '담당자 확인 중'
                                                            ? '맞춤 규격 확인 후 빠른 시일 내에 안내해 드리겠습니다.'
                                                            : '조금만 기다려주시면 멋진 시안으로 찾아뵙겠습니다.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="cursor-pointer whitespace-nowrap px-6 py-3 rounded-xl font-bold text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all w-full md:w-auto text-center">
                                                주문 취소
                                            </button>
                                        </div>
                                    )}

                                    {['DESIGN', 'APPROVED', 'SHIPPING', 'DONE', 'MODIFY_REQUEST', 'TAX_INVOICE'].includes(order.status) && (
                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start p-5 md:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 text-center sm:text-left">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center shrink-0">
                                                <ShieldCheck className={`w-6 h-6 md:w-8 md:h-8 ${order.status === 'DONE' ? 'text-green-500' : 'text-indigo-500'}`} />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-900 mb-1 text-sm md:text-base">
                                                    {order.status === 'DESIGN' && '디자이너가 시안을 작업 중입니다'}
                                                    {order.status === 'MODIFY_REQUEST' && '수정 요청을 확인하여 작업 중입니다'}
                                                    {order.status === 'APPROVED' && '시안이 확정되어 제작이 진행 중입니다'}
                                                    {order.status === 'SHIPPING' && '상품이 원장님께 배송 중입니다'}
                                                    {order.status === 'DONE' && '배송 및 모든 작업이 완료되었습니다'}
                                                    {order.status === 'TAX_INVOICE' && '세금계산서 발행이 완료되었습니다'}
                                                </p>
                                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                                                    {order.status === 'TAX_INVOICE'
                                                        ? '요청하신 세금계산서가 발행되었습니다. 이메일을 확인해 주세요.'
                                                        : order.status === 'DONE'
                                                            ? '아임오케이를 이용해주셔서 감사합니다. 다음에도 꼭 다시 찾아주세요!'
                                                            : '현재 공정 단계에 맞춰 꼼꼼하게 작업 중입니다. 단계가 변경될 때마다 알림을 보내 드립니다.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'CANCELLED' && (
                                        <div className="text-sm p-6 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 flex items-center shadow-sm">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                                <AlertCircle className="w-6 h-6 text-red-500" />
                                            </div>
                                            이 주문은 취소되었습니다. 궁금하신 점은 고객센터로 문의주세요.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* 학원 정보 수정 모달 */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-orange-600 p-8 text-white relative">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Building className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">학원 상세 정보 설정</h3>
                                    <p className="text-orange-100 text-sm mt-1">정확한 배송 및 세금계산서 발행을 위해 정보를 입력해 주세요.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
                            >
                                <Plus className="w-8 h-8 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                        <Building className="w-3 h-3 mr-1.5" /> 학원명
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 font-bold outline-none cursor-not-allowed"
                                        value={academyName}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                        <User className="w-3 h-3 mr-1.5" /> 담당자명
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                                        placeholder="홍길동 원장님"
                                        value={profileData.managerName}
                                        onChange={(e) => setProfileData({ ...profileData, managerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                        <Phone className="w-3 h-3 mr-1.5" /> 대표 연락처
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                                        placeholder="010-0000-0000"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                        <Mail className="w-3 h-3 mr-1.5" /> 세금계산서 이메일
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                                        placeholder="tax@academy.com"
                                        value={profileData.taxEmail}
                                        onChange={(e) => setProfileData({ ...profileData, taxEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                        <Hash className="w-3 h-3 mr-1.5" /> 사업자등록번호
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                                        placeholder="000-00-00000"
                                        value={profileData.businessNumber}
                                        onChange={(e) => setProfileData({ ...profileData, businessNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                        <UserCog className="w-3 h-3 mr-1.5" /> 대표자명
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                                        placeholder="대표자 성함"
                                        value={profileData.ceoName}
                                        onChange={(e) => setProfileData({ ...profileData, ceoName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                    <MapPin className="w-3 h-3 mr-1.5" /> 배송지 주소
                                </label>
                                <textarea
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all h-20 resize-none"
                                    placeholder="정확한 배송을 위해 상세 주소를 입력해주세요."
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] bg-orange-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSaving ? (
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        '정보 저장하기'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
