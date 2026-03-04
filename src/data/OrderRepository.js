import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';

export const OrderRepository = {
    // 실시간 주문 목록 수신 (관리자 / 고객용)
    subscribeToOrders(callback) {
        const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // createdAt 처리 로직 등 필요시 추가
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
            }));
            callback(orders);
        });
    },

    // 새 주문 생성
    async createOrder(orderData) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const customId = `${year}${month}${day}-${hours}${minutes}${seconds}`;

        await addDoc(collection(db, ORDERS_COLLECTION), {
            customId, // UI에서 보여줄 용도
            partnerId: orderData.partnerId || null,
            academyName: orderData.academyName,
            phone: orderData.phone,
            items: orderData.items,
            designRequestText: orderData.designRequestText,
            designFileUrl: orderData.designFileUrl || '',
            proofImageUrl: '',
            total: orderData.total,
            shippingFee: orderData.shippingFee,
            status: orderData.status,
            modificationRequest: '',
            createdAt: Timestamp.now()
        });
        return customId;
    },

    // 주문 상태 및 정보 업데이트 (단일 필드 업데이트용 범용)
    async updateOrder(docId, updateData) {
        const orderRef = doc(db, ORDERS_COLLECTION, docId);
        await updateDoc(orderRef, updateData);
    },

    // 관리자: 주문 상태 단일 변경 (AdminView에서 호출)
    async updateOrderStatus(docId, newStatus) {
        const orderRef = doc(db, ORDERS_COLLECTION, docId);
        await updateDoc(orderRef, { status: newStatus });
    },

    // 관리자: 주문 단가/금액 변경 (AdminView에서 호출)
    async updateOrderTotal(docId, newTotal) {
        const orderRef = doc(db, ORDERS_COLLECTION, docId);
        await updateDoc(orderRef, { total: newTotal });
    },

    // 관리자: 작업 시안 이미지(배열) 업데이트 및 상태 변경 (AdminView에서 호출)
    async updateDraftImages(docId, newDraftUrls) {
        const orderRef = doc(db, ORDERS_COLLECTION, docId);
        await updateDoc(orderRef, {
            draftImageUrls: newDraftUrls,
            proofImageUrl: newDraftUrls.length > 0 ? newDraftUrls[newDraftUrls.length - 1] : '' // 레거시 호환용
        });
    }
};
