export const PRICING = {
    '3400*400': 66000, '2900*400': 64000, '2800*750': 110000, '2600*650': 90000,
    '4400*550': 160000, '4400*500': 150000, '2800*400': 65000, '2800*600': 98000,
    '500*400 (날짜/보조용)': 13000, '600*460 (날짜/보조용)': 20000, '600*600 (날짜/보조용)': 22000,
    '680*550 (날짜/보조용)': 25000, '660*550 (날짜/보조용)': 25000, '480*400 (날짜/보조용)': 12000,
    '600*1800 (세로형 배너)': 30000, '600*450 (포스터)': 10000, '600*900 (포스터)': 15000,
};

export const MAIN_BANNER_SIZES = ['3400*400', '2900*400', '2800*750', '2600*650', '4400*550', '4400*500', '2800*400', '2800*600'];
export const DATE_BANNER_SIZES = ['500*400 (날짜/보조용)', '600*460 (날짜/보조용)', '600*600 (날짜/보조용)', '680*550 (날짜/보조용)', '660*550 (날짜/보조용)', '480*400 (날짜/보조용)'];
export const PROMO_SIZES = ['600*1800 (세로형 배너)', '600*450 (포스터)', '600*900 (포스터)'];

export const STATUS_MAP = {
    'WAIT_QUOTE': '견적대기', 'CHECK_QUOTE': '견적확인요청', 'NEW': '신규접수',
    'WAIT_DESIGN': '시안대기', 'DESIGN': '시안작업', 'WAIT_CONFIRM': '시안확인요청', 'CONFIRM_DESIGN': '시안컨펌요청', 'MODIFY_REQUEST': '수정요청(재작업)',
    'APPROVED': '제작진행', 'PRODUCING': '제작중', 'SHIPPING': '배송중/출발', 'DONE': '완료', 'CANCELLED': '주문취소'
};

export const STATUS_COLORS = {
    'WAIT_QUOTE': 'bg-orange-100 text-orange-800',
    'NEW': 'bg-blue-100 text-blue-800',
    'DESIGN': 'bg-indigo-100 text-indigo-800',
    'WAIT_CONFIRM': 'bg-purple-100 text-purple-800',
    'APPROVED': 'bg-emerald-100 text-emerald-800',
    'SHIPPING': 'bg-slate-100 text-slate-800',
    'DONE': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
};
