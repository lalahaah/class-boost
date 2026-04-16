import { MAIN_BANNER_SIZES, DATE_BANNER_SIZES, PROMO_SIZES } from './constants';

export const PARCEL_RATE = 8000;

// 박스당 수용 수량 (사이즈별)
const ITEMS_PER_BOX = {
    // 메인 현수막 (대형) — 박스 1~2개
    '3400*400': 2,
    '2900*400': 2,
    '2800*750': 1,
    '2600*650': 2,
    '4400*550': 1,
    '4400*500': 1,
    '2800*400': 2,
    '2800*600': 1,
    // 날짜/보조 현수막 (소형)
    '500*400 (날짜/보조용)': 10,
    '600*460 (날짜/보조용)': 8,
    '600*600 (날짜/보조용)': 6,
    '680*550 (날짜/보조용)': 6,
    '660*550 (날짜/보조용)': 6,
    '480*400 (날짜/보조용)': 10,
    // 홍보물
    '600*1800 (세로형 배너)': 3,
    '600*450 (포스터)': 10,
    '600*900 (포스터)': 8,
};

function getCategory(size) {
    if (MAIN_BANNER_SIZES.includes(size)) return '메인 현수막';
    if (DATE_BANNER_SIZES.includes(size)) return '날짜/보조 현수막';
    if (PROMO_SIZES.includes(size)) return '홍보물';
    return '기타';
}

function getItemsPerBox(size) {
    return ITEMS_PER_BOX[size] ?? 1;
}

/**
 * 주문 아이템 목록으로부터 배송비를 자동 계산합니다.
 * @param {Array<{size: string, qty: number, customWidth?: string, customHeight?: string}>} items
 * @returns {{ boxes: number, subtotal: number, vat: number, total: number, breakdown: Array }}
 */
export function calculateShipping(items) {
    const breakdown = items.map(item => {
        const isCustom = item.size === 'CUSTOM';
        const displaySize = isCustom
            ? `별도 규격 (${item.customWidth}x${item.customHeight})`
            : item.size;
        const qty = item.qty ?? item.quantity ?? 0;
        const itemsPerBox = isCustom ? 1 : getItemsPerBox(item.size);
        const fraction = qty / itemsPerBox;
        const category = isCustom ? '기타' : getCategory(item.size);

        return {
            size: displaySize,
            quantity: qty,
            category,
            itemsPerBox,
            boxFraction: fraction.toFixed(2),
        };
    });

    const totalFraction = breakdown.reduce((sum, b) => sum + parseFloat(b.boxFraction), 0);
    const boxes = Math.max(1, Math.ceil(totalFraction));
    const subtotal = boxes * PARCEL_RATE;
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    return { boxes, subtotal, vat, total, breakdown };
}
