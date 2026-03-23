import { Lock } from 'lucide-react';

export default function PartnerDetailModal({ partner, onClose }) {
    if (!partner) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">학원 상세 정보</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Lock className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="학원명" value={partner.academyName} />
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">파트너 코드</label>
                            <p className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
                                {partner.code || '미발급'}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="대표자명" value={partner.ceoName} />
                            <InfoField label="사업자번호" value={partner.bizNumber} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="담당자" value={partner.managerName} />
                            <InfoField label="연락처" value={partner.phone} />
                        </div>
                        <InfoField label="세금계산서 이메일" value={partner.taxEmail} />
                        <InfoField label="주소 (사업장)" value={partner.address} />
                        <InfoField label="배송지 주소" value={partner.shippingAddress} />
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
            <p className="font-semibold text-slate-800 leading-relaxed">{value || '-'}</p>
        </div>
    );
}
