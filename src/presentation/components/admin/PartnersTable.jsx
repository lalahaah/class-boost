import { Search, UserCheck, UserX } from 'lucide-react';
import { PartnerRepository } from '../../../data/PartnerRepository';
import { useDialog } from '../DialogProvider';

export default function PartnersTable({ partners, onViewDetail }) {
    const { showAlert, showConfirm } = useDialog();

    const handleApprove = async (partnerId) => {
        try {
            const code = `PTN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            await PartnerRepository.approvePartner(partnerId, code);
            await showAlert(`승인 완료 (발급코드: ${code})`, '안내');
        } catch (e) {
            await showAlert('승인 실패: ' + e.message, '오류');
        }
    };

    const handleReject = async (partnerId) => {
        const confirmed = await showConfirm('정말 반려하시겠습니까?', '반려 확인');
        if (!confirmed) return;
        try {
            await PartnerRepository.rejectPartner(partnerId);
            await showAlert('반려되었습니다.', '안내');
        } catch (e) {
            await showAlert('반려 실패: ' + e.message, '오류');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="p-4 font-bold">신청일시</th>
                            <th className="p-4 font-bold">학원명</th>
                            <th className="p-4 font-bold">연락처</th>
                            <th className="p-4 font-bold text-center">상태</th>
                            <th className="p-4 font-bold">발급코드</th>
                            <th className="p-4 font-bold text-right">정보/관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {partners.sort((a, b) => b.createdAt - a.createdAt).map(partner => (
                            <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 text-slate-500">{partner.createdAt?.toLocaleString('ko-KR')}</td>
                                <td className="p-4 font-bold text-slate-900">{partner.academyName}</td>
                                <td className="p-4 font-medium">{partner.phone}</td>
                                <td className="p-4 text-center">
                                    {partner.status === 'WAITING' && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">대기중</span>}
                                    {partner.status === 'APPROVED' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">승인됨</span>}
                                    {partner.status === 'REJECTED' && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">반려됨</span>}
                                </td>
                                <td className="p-4">
                                    {partner.code ? (
                                        <span className="font-mono bg-slate-100 px-2 py-1 rounded font-bold">{partner.code}</span>
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => onViewDetail(partner)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors" title="상세 정보">
                                            <Search className="w-4 h-4" />
                                        </button>
                                        {partner.status === 'WAITING' && (
                                            <>
                                                <button type="button" onClick={() => handleApprove(partner.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors" title="승인">
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleReject(partner.id)} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="반려">
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {partners.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">파트너 신청 내역이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
