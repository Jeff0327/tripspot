'use server'
import {createClient} from "@/utils/supabase/server";
import {Store} from "@/lib/types";

export async function getRestaurant(searchTerm?: string): Promise<Store[]> {
    const supabase = await createClient();

    try {
        let query = supabase
            .from('store')
            .select('*')
            .eq('tag', 'res');

        // 검색어가 있는 경우 title 또는 desc에서 검색
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,desc.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Supabase Error: ${error.message}`);
        }

        // images 필드를 JSON.parse하여 변환
        return (data || []).map(store => ({
            ...store,
            images: store.images && store.images.length > 0 ? JSON.parse(store.images) : []
        }));
    } catch (error) {
        // 에러 로깅
        if (error instanceof Error) {
            throw new Error(`Fetching store error: ${error.message}`);
        }
        return [];
    }
}