import { useState, useEffect } from 'react';
import { PartnerRepository } from '../../data/PartnerRepository';
import { useDialog } from '../components/DialogProvider';

export function usePartnerAuth({ onLogin } = {}) {
    const { showAlert } = useDialog();
    const [authCode, setAuthCode] = useState('');
    const [authError, setAuthError] = useState('');
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'request' | 'find'
    const [inquiryData, setInquiryData] = useState({ academyName: '', phone: '' });
    const [isAuthorized, setIsAuthorized] = useState(() => !!localStorage.getItem('partnerSession'));
    const [partnerId, setPartnerId] = useState(null);
    const [academyName, setAcademyName] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('partnerSession');
            if (saved) {
                const { id, academyName: savedName, code } = JSON.parse(saved);
                setIsAuthorized(true);
                setPartnerId(id);
                setAcademyName(savedName);
                setAuthCode(code);
                onLogin?.({ id, academyName: savedName, code });
            }
        } catch {
            localStorage.removeItem('partnerSession');
        }
    }, []);

    const saveSession = (partnerData) => {
        setIsAuthorized(true);
        setAuthError('');
        setPartnerId(partnerData.id);
        setAcademyName(partnerData.academyName);
        localStorage.setItem('partnerSession', JSON.stringify(partnerData));
        window.dispatchEvent(new Event('partnerSessionChanged'));
        onLogin?.(partnerData);
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();

        try {
            const partnerData = await PartnerRepository.verifyPartnerCode(authCode.toUpperCase());
            if (partnerData) {
                saveSession({
                    id: partnerData.id,
                    academyName: partnerData.academyName,
                    code: authCode.toUpperCase(),
                    phone: partnerData.phone
                });
            } else {
                setAuthError('유효하지 않은 파트너 코드입니다. 아임오케이에 문의해주세요.');
            }
        } catch {
            setAuthError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleRequestPartner = async (e) => {
        e.preventDefault();
        try {
            await PartnerRepository.createPartnerRequest(inquiryData);
            await showAlert(
                `[접수 완료] ${inquiryData.academyName} 원장님, 파트너 신청이 완료되었습니다.\n담당자가 확인 후 기재하신 연락처로 코드를 발급해 드립니다.`
            );
            setAuthMode('login');
            setInquiryData({ academyName: '', phone: '' });
        } catch {
            showAlert('신청 중 오류가 발생했습니다.', '오류');
        }
    };

    const handleFindCode = async (e) => {
        e.preventDefault();
        await showAlert(`[발송 완료] 입력하신 연락처(${inquiryData.phone})로 코드를 다시 발송했습니다.`);
        setAuthMode('login');
        setInquiryData({ academyName: '', phone: '' });
    };

    const logout = () => {
        localStorage.removeItem('partnerSession');
        window.dispatchEvent(new Event('partnerSessionChanged'));
        setIsAuthorized(false);
        setPartnerId(null);
        setAcademyName('');
        setAuthCode('');
    };

    return {
        authCode, setAuthCode,
        authError,
        authMode, setAuthMode,
        inquiryData, setInquiryData,
        isAuthorized,
        partnerId,
        academyName, setAcademyName,
        isDemo: false,
        handleAuthSubmit,
        handleRequestPartner,
        handleFindCode,
        logout,
    };
}
