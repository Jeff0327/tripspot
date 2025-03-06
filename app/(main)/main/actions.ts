'use server'
import { createClient } from "@/utils/supabase/server";
import { Store } from "@/lib/types";

export async function randomPlace(): Promise<Store[] | null> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .rpc('random_store_res');

        if (error) {
            return null
        }

        if (!data) {
            console.log('No data found in store table')
            return null
        }

        return (data || []).map(store => ({
            ...store,
            images: store.images && store.images.length > 0 ? JSON.parse(store.images) : []
        }));

    } catch (error) {
        console.error('Unexpected error in randomPlace:', error)
        return null
    }
}
export async function randomHotel(): Promise<Store[] | null> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .rpc('random_store_hotel');

        if (error) {
            return null
        }

        if (!data) {
            console.log('No data found in store table')
            return null
        }

        return (data || []).map(store => ({
            ...store,
            images: store.images && store.images.length > 0 ? JSON.parse(store.images) : []
        }));

    } catch (error) {
        console.error('Unexpected error in randomPlace:', error)
        return null
    }
}