import { Lock, KeyRound, Star, Search } from 'lucide-react';

/**
 * 파트너 인증 폼 (OrderView/TrackingView 공통)
 * @param {Object} props
 * @param {string} props.subtitle - 로그인 화면 부제목
 * @param {string} props.submitLabel - 로그인 버튼 텍스트
 */
export default function PartnerAuthForm({
    subtitle,
    submitLabel = '인증하기',
    authCode,
    setAuthCode,
    authError,
    authMode,
    setAuthMode,
    inquiryData,
    setInquiryData,
    handleAuthSubmit,
    handleRequestPartner,
    handleFindCode,
}) {
    return (
        <div className="max-w-md mx-auto mt-24 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="p-10 text-center relative">
                {authMode === 'login' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ring-8 ring-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Lock className="h-8 w-8 text-slate-700" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="text-[1.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">파트너 전용 공간</h2>
                        <p className="text-slate-500 mb-10 text-sm leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{ __html: subtitle }} />

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
                                {submitLabel}
                            </button>
                        </form>

                        <div className="my-8 h-px bg-slate-100 w-full"></div>
                        <div className="flex flex-col space-y-5">
                            <button type="button" onClick={() => setAuthMode('request')} className="flex items-center justify-center space-x-2 text-orange-600 font-extrabold hover:underline transition-all group mx-auto">
                                <Star className="w-5 h-5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                                <span>신규 파트너 신청하기</span>
                            </button>
                            <button type="button" onClick={() => setAuthMode('find')} className="text-slate-400 text-[13px] font-medium hover:text-slate-600 transition-colors">
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
                        <form onSubmit={handleFindCode} className="space-y-4 text-left">
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
