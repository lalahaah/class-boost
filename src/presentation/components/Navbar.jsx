import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, LayoutDashboard, FileEdit } from 'lucide-react';
import { useDialog } from './DialogProvider';

export default function Navbar() {
    const navigate = useNavigate();
    const { showAlert } = useDialog();
    const [clickCount, setClickCount] = useState(0);
    const timerRef = useRef(null);

    const handleLogoClick = () => {
        // 기본적으로 홈페이지로 이동
        navigate('/');

        // 기존 타이머가 있으면 제거
        if (timerRef.current) clearTimeout(timerRef.current);

        const newCount = clickCount + 1;

        if (newCount >= 5) {
            setClickCount(0);
            showAlert('관리자 모드로 진입합니다.').then(() => {
                navigate('/admin');
            });
        } else {
            setClickCount(newCount);
            // 3초 동안 추가 클릭이 없으면 카운트 초기화 (기존 2초에서 연장)
            timerRef.current = setTimeout(() => {
                setClickCount(0);
            }, 3000);
        }
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div
                        className="flex items-center cursor-pointer group select-none"
                        onClick={handleLogoClick}
                        onDoubleClick={(e) => e.preventDefault()} // 더블클릭 텍스트 선택 방지
                    >
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-600 transition-colors shadow-sm">
                            <Rocket className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-slate-900 tracking-tight">ClassBoost</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">B2B</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link to="/order" className="text-slate-600 hover:text-orange-600 font-bold px-3 py-2 rounded-lg transition-colors text-sm flex items-center">
                            <FileEdit className="w-4 h-4 mr-1.5" />
                            <span className="hidden sm:inline">간편 견적 요청</span><span className="sm:hidden">견적 요청</span>
                        </Link>
                        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                        <Link to="/tracking" className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center text-sm">
                            <LayoutDashboard className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">시안조회/관리</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
