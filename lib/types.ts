import {Database} from "@/types";


// 예시 타입 정의
export type Store = Database['public']['Tables']['store']['Row'];

export interface Review {
    id: string;
    created_at: string;
    store_id: string;
    user_id: string;
    content: string;
    rating: number;
    images: string[];
    user?: {
        id: string;
        email: string;
        user_metadata: {
            name?: string;
            avatar_url?: string;
        };
    };
}

export type StoreWithReviews = Store & {
    reviews: Review[];
};
export interface UserData {
    email: string;
    name: string;
    avatar_url?: string | null;
}
export interface States<T=unknown> {
    success: boolean;
    data: T | null;
    error: string | null;
}
// types/daum-postcode.d.ts
export interface DaumPostcodeData {
    address: string;
    addressType: string;
    buildingName: string;
    apartment?: string;
    zonecode: string;
    jibunAddress?: string;
    roadAddress?: string;
    autoJibunAddress?: string;
    autoRoadAddress?: string;
    userSelectedType?: string;
    bname?: string;
    bcode?: string;
}

export interface DaumPostcode {
    open: () => void;
}

export interface DaumPostcodeOptions {
    oncomplete: (data: DaumPostcodeData) => void;
    onresize?: (size: { width: number; height: number }) => void;
    onclose?: () => void;
    width?: string | number;
    height?: string | number;
    animation?: boolean;
    focusInput?: boolean;
    autoMapping?: boolean;
}

export interface DaumPostcodeInstance {
    Postcode: new (options: DaumPostcodeOptions) => DaumPostcode;
}

// Window 인터페이스 확장
declare global {
    interface Window {
        daum: DaumPostcodeInstance;
    }
}