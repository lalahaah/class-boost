import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingView from './pages/LandingView';
import OrderView from './pages/OrderView';
import TrackingView from './pages/TrackingView';
import AdminView from './pages/AdminView';

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-orange-200">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<LandingView />} />
                        <Route path="/order" element={<OrderView />} />
                        <Route path="/tracking" element={<TrackingView />} />
                        <Route path="/admin" element={<AdminView />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}
