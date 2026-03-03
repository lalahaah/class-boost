import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const PARTNERS_COLLECTION = 'partners';

export const PartnerRepository = {
    // 실시간 파트너 목록 수신
    subscribeToPartners(callback) {
        const q = query(collection(db, PARTNERS_COLLECTION), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const partners = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
            }));
            callback(partners);
        });
    },

    // 신규 파트너 신청
    async createPartnerRequest(partnerData) {
        const customId = `REQ-${Date.now().toString().slice(-5)}`;
        await addDoc(collection(db, PARTNERS_COLLECTION), {
            customId,
            academyName: partnerData.academyName,
            phone: partnerData.phone,
            status: 'WAITING',
            code: null,
            createdAt: Timestamp.now()
        });
    },

    // 파트너 승인 및 코드 업데이트
    async approvePartner(docId, generatedCode) {
        const partnerRef = doc(db, PARTNERS_COLLECTION, docId);
        await updateDoc(partnerRef, {
            status: 'APPROVED',
            code: generatedCode
        });
    },

    // 파트너 거절
    async rejectPartner(docId) {
        const partnerRef = doc(db, PARTNERS_COLLECTION, docId);
        await updateDoc(partnerRef, {
            status: 'REJECTED'
        });
    }
};
