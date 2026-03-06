import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3
                            className="text-white font-extrabold text-xl mb-4 flex items-center cursor-pointer hover:text-orange-400 transition-colors w-fit"
                            onClick={handleLogoClick}
                        >
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-2"><Rocket className="h-4 w-4 text-white" /></div>
                            ClassBoost
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            학원 성장의 새로운 패러다임,<br />테크 기반 B2B 마케팅 발주 플랫폼
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">고객센터</h4>
                        <p className="text-sm leading-relaxed text-slate-500">
                            전화: 010-5955-4936<br />이메일: iamok9@naver.com<br />운영시간: 평일 10:00 - 19:00
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">회사 정보</h4>
                        <p className="text-sm leading-relaxed text-slate-500">
                            주식회사 아임오케이 (imokayy Co., Ltd.)<br />대표이사: 손미선<br />사업자등록번호: 841-88-02576<br />경기도 화성시 동탄기흥로 585, 201동 207호
                        </p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center flex flex-col md:flex-row justify-between items-center text-slate-600">
                    <p>© {new Date().getFullYear()} imokayy Co., Ltd. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <button
                            onClick={() => {
                                navigate('/terms');
                                window.scrollTo(0, 0);
                            }}
                            className="hover:text-slate-300 transition-colors cursor-pointer"
                        >
                            이용약관
                        </button>
                        <button
                            onClick={() => {
                                navigate('/privacy');
                                window.scrollTo(0, 0);
                            }}
                            className="hover:text-slate-300 transition-colors cursor-pointer"
                        >
                            개인정보처리방침
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
