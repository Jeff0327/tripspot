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
export interface SearchResult {
    success: boolean;
    message?: string;
    data?: Store[]; // 이제 API 응답에도 addressVerified 필드가 있을 수 있음
}

export interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        success: Array<{ name: string; message: string }>;
        failed: Array<{ name: string; error: string }>;
    };
}

export interface AutomationConfig {
    enabled: boolean;
    interval: number; // 분 단위
    searchTerms: string[];
    maxResults: number;
    currentTermIndex: number;
    importDelay: number; // 초 단위
    verifyAddressAutomatically: boolean; // 주소 자동 검증 여부
}

export interface KakaoMapResult {
    success: boolean;
    message?: string;
    data?: {
        address: string;
        roadAddress?: string;
        placeName?: string;
        placeId?: string;
    };
}