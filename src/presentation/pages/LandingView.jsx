import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download, Scissors, Wind, ShieldCheck, Star, MousePointerClick } from 'lucide-react';
import GridPattern from '../components/GridPattern';

export default function LandingView() {
    const navigate = useNavigate();

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
        </div>
    );
}
