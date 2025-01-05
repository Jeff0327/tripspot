'use server'
import {createClient} from "@/app/utils/supabase/server";
import {Store} from "@/types";


export async function getStore(searchTerms?:string): Promise<Store[]> {
    const supabase = await createClient()

    try {

        const { data, error } = await supabase
            .from('store')
            .select('*').order('created_at',{ascending:false})

        if (error) {
            return []
        }

        return data || []
    } catch (error) {
        console.error(error)
        return []
    }
}