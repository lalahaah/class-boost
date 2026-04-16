import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const SHIPPING_ADJUSTMENTS_COLLECTION = 'shipping_adjustments';

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
        const updateData = { status: newStatus };
        if (newStatus === 'DONE') {
            updateData.deliveredAt = Timestamp.now();
        }
        await updateDoc(orderRef, updateData);
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
    },

    // 관리자: 배송비 조정 이력 저장 + 주문 배송비 업데이트
    async saveShippingAdjustment(orderId, adminId, autoResult, finalShipping) {
        // 조정 이력 저장
        await addDoc(collection(db, SHIPPING_ADJUSTMENTS_COLLECTION), {
            order_id: orderId,
            admin_id: adminId,
            created_at: Timestamp.now(),
            auto_boxes: autoResult.boxes,
            auto_subtotal: autoResult.subtotal,
            final_method: finalShipping.method,
            final_boxes: finalShipping.boxes,
            final_subtotal: finalShipping.subtotal,
            final_total: finalShipping.total,
            is_manual_override: finalShipping.isManualOverride,
            admin_note: finalShipping.adminNote || '',
        });

        // 주문 배송비 + 발송 시각 갱신
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, {
            shippingFee: finalShipping.total,
            quoteSentAt: Timestamp.now(),
        });
    },

    // 배송비/견적 발송 알림 (이메일/카카오 - stub)
    async sendQuoteNotification(order, finalShipping) {
        // TODO: Resend API 이메일 발송
        // TODO: 카카오 비즈메시지 발송
        console.log('[STUB] 견적 발송:', {
            to: order.phone,
            academyName: order.academyName,
            shippingTotal: finalShipping.total,
        });
    },
};
