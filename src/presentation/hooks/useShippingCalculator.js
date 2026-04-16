import { useState, useMemo } from 'react';
import { PARCEL_RATE } from '../../core/shipping-logic';

/**
 * 배송비 수동 조정 상태와 실시간 재계산을 관리하는 훅
 * @param {{ boxes: number, subtotal: number, vat: number, total: number }} autoResult
 */
export function useShippingCalculator(autoResult) {
    const [method, setMethod] = useState('parcel');
    const [boxes, setBoxes] = useState(autoResult.boxes);
    const [quickFee, setQuickFee] = useState(35000);
    const [adminNote, setAdminNote] = useState('');

    const current = useMemo(() => {
        if (method === 'parcel') {
            const safeBoxes = Math.max(1, Number(boxes) || 1);
            const subtotal = safeBoxes * PARCEL_RATE;
            const vat = Math.round(subtotal * 0.1);
            return { boxes: safeBoxes, subtotal, vat, total: subtotal + vat };
        } else {
            const safeFee = Math.max(1, Number(quickFee) || 1);
            const vat = Math.round(safeFee * 0.1);
            return { boxes: 0, subtotal: safeFee, vat, total: safeFee + vat };
        }
    }, [method, boxes, quickFee]);

    const isManualOverride = method !== 'parcel' || Number(boxes) !== autoResult.boxes;

    const getFinalShipping = () => ({
        method,
        boxes: current.boxes,
        subtotal: current.subtotal,
        vat: current.vat,
        total: current.total,
        adminNote,
        isManualOverride,
    });

    return {
        method, setMethod,
        boxes, setBoxes,
        quickFee, setQuickFee,
        adminNote, setAdminNote,
        current,
        isManualOverride,
        getFinalShipping,
    };
}
