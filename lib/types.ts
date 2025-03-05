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
    images: string[] | null;
    user?: {
        id: string;
        email: string;  // user_id 대신 email
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