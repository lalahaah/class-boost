import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, Timestamp, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const PARTNERS_COLLECTION = 'partners';

export const PartnerRepository = {
    // 파트너 코드 검증 (보안 개선: 프론트에서 전체 목록을 불러오지 않고 DB에서 직접 검색)
    async verifyPartnerCode(code) {
        const q = query(
            collection(db, PARTNERS_COLLECTION),
            where('code', '==', code),
            where('status', '==', 'APPROVED')
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
    },

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
    },

    // 파트너 연락처 정보 수정
    async updatePartnerPhone(docId, newPhone) {
        const partnerRef = doc(db, PARTNERS_COLLECTION, docId);
        await updateDoc(partnerRef, {
            phone: newPhone
        });
    },

    // 파트너 상세 프로필 업데이트
    async updatePartnerProfile(docId, profileData) {
        const partnerRef = doc(db, PARTNERS_COLLECTION, docId);
        await updateDoc(partnerRef, {
            ...profileData,
            updatedAt: Timestamp.now()
        });
    }
};
