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
        // 직관적 ID 채번을 위해 현재 총 개수를 구하는 대신 단순 랜덤/날짜 베이스 ID를 사용할 수 도 있지만,
        // 요구사항에 'ORD-001' 등 직관적 채번이라고 되어 있음. 여기서는 Firestore auto-id가 아닌 커스텀 ID를 쓰려면
        // 별도의 Counters 콜렉션 관리가 필요함. 간단히 Timestamp 기반 커스텀 ID 생성 로직으로 처리.
        const customId = `ORD-${Date.now().toString().slice(-6)}`;

        await addDoc(collection(db, ORDERS_COLLECTION), {
            customId, // UI에서 보여줄 용도
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

    // 주문 상태 및 정보 업데이트 (옵션)
    async updateOrder(docId, updateData) {
        const orderRef = doc(db, ORDERS_COLLECTION, docId);
        await updateDoc(orderRef, updateData);
    }
};
