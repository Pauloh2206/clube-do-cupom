import { GoogleGenAI, Type } from "@google/genai";
import { Coupon, CouponStatus, Platform } from "../types";

const ALL_PLATFORMS: Platform[] = ['uber', '99', 'ifood', 'rappi', 'mercadolivre', 'magazineluiza'];

function isPlatform(value: any): value is Platform {
    return typeof value === 'string' && ALL_PLATFORMS.includes(value.toLowerCase() as Platform);
}

function isCouponStatus(value: any): value is CouponStatus {
    return value === 'active' || value === 'expired';
}

/**
 * Parses a date string from various formats (YYYY-MM-DD, DD/MM/YYYY) into a Date object.
 * @param dateStr The date string to parse.
 * @returns A Date object or null if parsing fails.
 */
function parseDate(dateStr: string): Date | null {
    // Tries YYYY-MM-DD
    let match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        // new Date(year, monthIndex, day)
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    // Tries DD/MM/YYYY or DD-MM-YYYY
    match = dateStr.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (match) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }

    return null;
}

/**
 * Determines the correct status of a coupon by parsing its validity date.
 * This overrides the AI's status if the date is definitively in the past.
 * @param coupon The coupon object from the AI.
 * @returns The corrected CouponStatus ('active' or 'expired').
 */
function getCorrectedStatus(coupon: any): CouponStatus {
    const validity = coupon.validity || '';

    // If validity is indeterminate, assume it's active.
    if (validity.toLowerCase().includes('indeterminado')) {
        return 'active';
    }

    const expiryDate = parseDate(validity);
    if (expiryDate) {
        // Set time to the end of the day to include the expiry date itself as valid.
        expiryDate.setHours(23, 59, 59, 999);
        const today = new Date();
        // If the expiry date is before today, it's expired. Otherwise, it's active.
        return expiryDate < today ? 'expired' : 'active';
    }

    // If date can't be parsed, fall back to the AI's status.
    const originalStatus = coupon.status?.toLowerCase();
    if (isCouponStatus(originalStatus)) {
        return originalStatus;
    }

    // Default to 'active' if no reliable status can be determined.
    return 'active';
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: 'Unique ID for the coupon.' },
            platform: { type: Type.STRING, description: `Platform name, one of: ${ALL_PLATFORMS.join(', ')}.` },
            title: { type: Type.STRING, description: 'Short title for the coupon.' },
            code: { type: Type.STRING, description: 'The coupon code.' },
            description: { type: Type.STRING, description: 'Brief description of the coupon.' },
            validity: { type: Type.STRING, description: 'Validity or expiry information, preferably in YYYY-MM-DD format.' },
            status: { type: Type.STRING, description: 'Coupon status: "active" for valid coupons, "expired" for expired ones.' },
        },
        required: ["id", "platform", "title", "code", "description", "validity", "status"],
    },
};

export const fetchCoupons = async (platformFilter: Platform | 'all'): Promise<Coupon[]> => {
    try {
        const platformList = ALL_PLATFORMS.join(', ');
        const prompt = `Encontre os cupons de desconto mais recentes, incluindo os válidos (ativos) e os que expiraram recentemente para ${platformFilter === 'all' ? `as seguintes plataformas: ${platformList}` : platformFilter}. 
Para cada cupom, forneça o título, o código, a descrição, a validade e o status ("active" ou "expired").
IMPORTANTE: A data de validade deve ser no formato YYYY-MM-DD sempre que possível. O status 'active' SÓ DEVE ser usado para cupons cuja data de validade ainda não passou. Cupons de anos anteriores (como 2024) DEVEM ter o status 'expired'.
O nome da plataforma deve ser um dos seguintes em minúsculas: ${platformList}.
Gere um ID único para cada cupom.
Retorne apenas o JSON.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedCoupons = JSON.parse(jsonText) as any[];

        const validCoupons: Coupon[] = parsedCoupons
            .map(c => ({
                ...c,
                platform: c.platform?.toLowerCase(),
                status: getCorrectedStatus(c), // Use the client-side verified status
            }))
            .filter(c => 
                c.id &&
                c.platform && isPlatform(c.platform) &&
                c.title &&
                c.code &&
                c.description &&
                c.validity &&
                c.status && isCouponStatus(c.status)
            ) as Coupon[];

        if (platformFilter !== 'all') {
            return validCoupons.filter(c => c.platform === platformFilter);
        }
        
        return validCoupons;
    } catch (error) {
        console.error('Error fetching coupons from Gemini API:', error);
        throw new Error('Falha ao buscar cupons. Tente novamente mais tarde.');
    }
};
