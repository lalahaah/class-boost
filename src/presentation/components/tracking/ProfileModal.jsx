import { RefreshCcw, Building, User, Phone, Mail, Hash, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { PartnerRepository } from '../../../data/PartnerRepository';
import { useDialog } from '../DialogProvider';

export default function ProfileModal({ partnerId, academyName, initialData, onClose }) {
    const { showAlert } = useDialog();
    const [profileData, setProfileData] = useState({
        address: initialData.address || '',
        managerName: initialData.managerName || '',
        phone: initialData.phone || '',
        taxEmail: initialData.taxEmail || '',
        businessNumber: initialData.businessNumber || '',
        ceoName: initialData.ceoName || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!partnerId || partnerId === 'DEMO') {
            await showAlert('데모 계정은 정보를 수정할 수 없습니다.', '확인');
            return;
        }
        setIsSaving(true);
        try {
            await PartnerRepository.updatePartnerProfile(partnerId, profileData);
            await showAlert('학원 정보가 성공적으로 업데이트되었습니다.', '저장 완료');
            onClose();
        } catch {
            await showAlert('정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.', '오류');
        } finally {
            setIsSaving(false);
        }
    };

    const update = (field) => (e) => setProfileData(prev => ({ ...prev, [field]: e.target.value }));

    return (
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
                    <button onClick={onClose} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
                        <Plus className="w-8 h-8 rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                <Building className="w-3 h-3 mr-1.5" /> 학원명
                            </label>
                            <input type="text" readOnly className="w-full px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 font-bold outline-none cursor-not-allowed" value={academyName} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                <User className="w-3 h-3 mr-1.5" /> 담당자명
                            </label>
                            <input type="text" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all" placeholder="홍길동 원장님" value={profileData.managerName} onChange={update('managerName')} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                <Phone className="w-3 h-3 mr-1.5" /> 대표 연락처
                            </label>
                            <input type="tel" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all" placeholder="010-0000-0000" value={profileData.phone} onChange={update('phone')} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                <Mail className="w-3 h-3 mr-1.5" /> 세금계산서 이메일
                            </label>
                            <input type="email" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all" placeholder="tax@academy.com" value={profileData.taxEmail} onChange={update('taxEmail')} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                <Hash className="w-3 h-3 mr-1.5" /> 사업자등록번호
                            </label>
                            <input type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all" placeholder="000-00-00000" value={profileData.businessNumber} onChange={update('businessNumber')} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                                <User className="w-3 h-3 mr-1.5" /> 대표자명
                            </label>
                            <input type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all" placeholder="대표자 성함" value={profileData.ceoName} onChange={update('ceoName')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                            <MapPin className="w-3 h-3 mr-1.5" /> 배송지 주소
                        </label>
                        <textarea className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold placeholder:text-slate-300 transition-all h-20 resize-none" placeholder="정확한 배송을 위해 상세 주소를 입력해주세요." value={profileData.address} onChange={update('address')} />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">
                            취소
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] bg-orange-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all disabled:opacity-50 flex items-center justify-center">
                            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : '정보 저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
