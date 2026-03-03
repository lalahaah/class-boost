import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Search, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-600 transition-colors shadow-sm">
                            <Rocket className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-slate-900 tracking-tight">ClassBoost</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">B2B</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link to="/tracking" className="text-slate-600 hover:text-orange-600 font-bold px-3 py-2 rounded-lg transition-colors flex items-center text-sm">
                            <Search className="w-4 h-4 mr-1.5" /> <span className="hidden sm:inline">시안 조회/컨펌</span>
                        </Link>
                        <Link to="/order" className="text-slate-600 hover:text-orange-600 font-bold px-3 py-2 rounded-lg transition-colors text-sm">
                            <span className="hidden sm:inline">간편 견적/요청</span><span className="sm:hidden">견적/요청</span>
                        </Link>
                        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                        <Link to="/admin" className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center text-sm">
                            <LayoutDashboard className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Admin (Test)</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
