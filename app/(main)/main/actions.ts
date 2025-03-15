'use server'
import { createClient } from "@/utils/supabase/server";
import { Store } from "@/lib/types";

export async function randomPlace(): Promise<Store[] | null> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .rpc('random_store_res');

        if (error) {
            console.error('Error fetching random store:', error.message);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        return Array.isArray(data) ? data.map(store => ({
            ...store,
            images: store.images && typeof store.images === 'string'
                ? JSON.parse(store.images)
                : []
        })) : [data];

    } catch (error) {
        console.error('Unexpected error in randomPlace:', error);
        return null;
    }
}

export async function randomHotel(): Promise<Store[] | null> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .rpc('random_store_hotel');

        if (error) {
            console.error('Error fetching random hotel:', error.message);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        return Array.isArray(data) ? data.map(store => ({
            ...store,
            images: store.images && typeof store.images === 'string'
                ? JSON.parse(store.images)
                : []
        })) : [data];

    } catch (error) {
        console.error('Unexpected error in randomHotel:', error);
        return null;
    }
}