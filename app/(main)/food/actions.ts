'use server'
import {createClient} from "@/app/utils/supabase/server";
import {Store} from "@/lib/types";

export async function getStore(searchTerms?: string): Promise<Store[]> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('store')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error:", error);
            return [];
        }

        // images 필드를 JSON.parse하여 변환
        return (data || []).map(store => ({
            ...store,
            images: store.images && store.images.length > 0 ? JSON.parse(store.images) : []
        }));
    } catch (error) {
        console.error("Fetching store error:", error);
        return [];
    }
}