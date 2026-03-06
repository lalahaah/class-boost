import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download, Scissors, Wind, ShieldCheck, Star, MousePointerClick, Zap, MessageCircle, X } from 'lucide-react';
import GridPattern from '../components/GridPattern';

export default function LandingView() {
    const navigate = useNavigate();
    const [showContactModal, setShowContactModal] = useState(false);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="relative overflow-hidden bg-slate-50 py-24 sm:py-32 border-b border-slate-200">
                <GridPattern width={40} height={40} x={-1} y={-1} className="[mask-image:linear-gradient(to_bottom,white,transparent)] opacity-100" squares={[[4, 4], [5, 1], [8, 2], [6, 6], [12, 3], [15, 6], [2, 7]]} />
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-white text-slate-800 text-sm font-bold mb-8 border border-slate-200 shadow-sm">
                        🚀 학원 홍보의 모든 고민, <span className="text-orange-600">클래스부스트</span>로 해결하세요
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                        1초 만에 붙는 기적,<br className="hidden md:block" /> 학원버스 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">자석 현수막</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        매번 끈으로 묶고 풀던 천 현수막은 이제 그만! <br />
                        압도적인 편리함과 깔끔한 미관으로 학원의 브랜드 가치를 높이세요.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => navigate('/order')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-600/30 transition-all cursor-pointer flex items-center justify-center transform hover:-translate-y-1">
                            실시간 견적 확인하기 <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                        <button className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-4 cursor-pointer rounded-xl font-bold text-lg shadow-sm hover:shadow transition-all flex items-center justify-center">
                            <Download className="mr-2 h-5 w-5 text-slate-400" /> 소개서 다운로드
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-24 bg-white relative z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">기존 천 현수막의 스트레스,<br />완벽하게 해결했습니다.</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-red-100">
                                <Scissors className="h-7 w-7 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">매번 묶고 푸는 번거로움</h3>
                            <p className="text-slate-600 leading-relaxed">세차할 때, 비가 올 때마다 더러워진 끈을 풀고 묶느라 고생하셨나요? <strong>자석은 단 1초면 충분합니다.</strong></p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-cyan-100">
                                <Wind className="h-7 w-7 text-cyan-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">비바람에 찢어지고 펄럭임</h3>
                            <p className="text-slate-600 leading-relaxed">고속 주행 시 펄럭이는 소음. <strong>초강력 고무자석이 차량에 완벽하게 밀착되어 떨어지지 않습니다.</strong></p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-200">
                                <ShieldCheck className="h-7 w-7 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">색바램과 지저분한 미관</h3>
                            <p className="text-slate-600 leading-relaxed">몇 달만 지나면 색이 바래는 천. <strong>특수 UV 코팅으로 오염에 강하고 색상이 선명하게 유지됩니다.</strong></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Process Section (발주 3단계 안내) */}
            <div className="py-24 bg-slate-50 relative z-20 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            발주부터 배송까지, 압도적으로 쉽습니다.
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="bg-slate-800 text-white rounded-full flex items-center justify-center font-extrabold text-2xl mx-auto mb-6 shadow-lg shadow-slate-800/30 ring-8 ring-white w-16 h-16">1</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">파일 업로드</h3>
                            <p className="text-slate-600">학원 로고나 기존 현수막 디자인 파일을 올려주세요. 전문 디자이너가 자석 현수막 규격에 맞게 최적화합니다.</p>
                        </div>
                        <div>
                            <div className="bg-slate-800 text-white rounded-full flex items-center justify-center font-extrabold text-2xl mx-auto mb-6 shadow-lg shadow-slate-800/30 ring-8 ring-white w-16 h-16">2</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">스마트 시안 컨펌</h3>
                            <p className="text-slate-600">카카오톡으로 전송된 링크를 통해 모바일에서 편리하게 시안을 확인하고, 터치 한 번으로 확정합니다.</p>
                        </div>
                        <div>
                            <div className="bg-orange-500 text-white rounded-full flex items-center justify-center font-extrabold text-2xl mx-auto mb-6 shadow-lg shadow-orange-500/30 ring-8 ring-white w-16 h-16">3</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">결제 및 특급 배송</h3>
                            <p className="text-slate-600">최종 승인이 완료되면 결제를 진행합니다. 최고급 원단으로 당일/익일 제작되어 안전하게 배송됩니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Agency (I'm OK Intro) Section - 종합 광고 대행사 어필 */}
            <div className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row group hover:shadow-2xl transition-shadow duration-500">

                        {/* 좌측 텍스트 영역 (Dark) */}
                        <div className="md:w-5/12 bg-slate-900 p-10 sm:p-12 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors duration-500"></div>
                            <span className="text-orange-400 font-extrabold tracking-widest text-xs mb-3 uppercase flex items-center">
                                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></div> Marketing Agency
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight leading-tight">현수막은 시작일 뿐입니다.</h2>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                주식회사 <strong className="text-white">아임오케이</strong>는 오프라인 발주처를 넘어, 원장님의 원생 모집을 책임지는 <strong className="text-white">학원 전문 종합 광고 대행사</strong>입니다. <br /><br />
                                현수막 디자인부터 우리 동네 학부모 타겟 온라인 광고까지 원스톱으로 맡겨보세요.
                            </p>
                        </div>

                        {/* 우측 서비스 영역 (Light) */}
                        <div className="md:w-7/12 p-10 sm:p-12 flex flex-col justify-center bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mr-4 shrink-0 border border-orange-100">
                                        <Zap className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 mb-1.5 text-lg">퍼포먼스 마케팅</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">당근마켓, 인스타그램, 네이버 등 지역 맘카페/학부모 정밀 타겟팅 광고 세팅 및 운영</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 shrink-0 border border-indigo-100">
                                        <MessageCircle className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 mb-1.5 text-lg">공식 채널/콘텐츠 운영</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">등록 전환율을 높이는 학원 공식 블로그 세팅 및 전문 카피라이터의 정기 콘텐츠 발행</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowContactModal(true)}
                                className="cursor-pointer w-full sm:w-max bg-white border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-slate-800 hover:text-orange-700 px-8 py-4 rounded-xl font-extrabold transition-all shadow-sm flex items-center justify-center"
                            >
                                학원 광고/마케팅 대행 문의하기 <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
                <GridPattern width={40} height={40} x={-1} y={-1} className="fill-slate-700/30 stroke-slate-700/30 [mask-image:linear-gradient(to_top,white,transparent)]" squares={[[2, 2], [6, 4], [10, 1], [14, 6], [18, 3], [3, 8], [11, 7]]} />
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Star className="w-12 h-12 text-orange-500 mx-auto mb-6 fill-orange-500" />
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">지금 바로 파트너 코드를 입력하세요.</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium">아임오케이 파트너 학원이 되어 프라이빗한 단가 혜택을 누리세요.</p>
                    <button onClick={() => navigate('/order')} className="cursor-pointer bg-orange-600 hover:bg-orange-500 text-white px-10 py-5 rounded-xl font-extrabold text-xl shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center mx-auto transform hover:-translate-y-1">
                        <MousePointerClick className="mr-3 h-6 w-6" /> 무료 견적 및 시안 요청하기
                    </button>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">학원 광고/마케팅 대행 문의</h3>
                            <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">고객센터</h4>
                                <div className="space-y-3 text-slate-700 font-medium">
                                    <p className="flex justify-between items-center"><span className="text-slate-500">전화</span> <span>010-5955-4936</span></p>
                                    <p className="flex justify-between items-center"><span className="text-slate-500">이메일</span> <span>iamok9@naver.com</span></p>
                                    <p className="flex justify-between items-center"><span className="text-slate-500">운영시간</span> <span>평일 10:00~19:00</span></p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">회사 정보</h4>
                                <div className="space-y-1 text-slate-600 text-sm">
                                    <p className="text-base text-slate-800 mb-2"><strong className="font-bold">주식회사 아임오케이</strong> <span className="text-slate-500">(imokayy Co., Ltd.)</span></p>
                                    <p>대표이사 : 손미선</p>
                                    <p>사업자등록번호 : 841-88-02576</p>
                                    <p>경기도 화성시 동탄기흥로 585, 201동 207호</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors shadow-sm cursor-pointer text-lg"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
