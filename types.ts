export type Platform = 'uber' | '99' | 'ifood' | 'rappi' | 'mercadolivre' | 'magazineluiza';
export type CouponStatus = 'active' | 'expired';

export interface Coupon {
    id: string;
    platform: Platform;
    title: string;
    code: string;
    description: string;
    validity: string;
    status: CouponStatus;
}
