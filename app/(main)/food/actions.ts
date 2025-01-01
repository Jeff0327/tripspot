'use server'
import {createClient} from "@/app/utils/supabase/server";
import {Store} from "@/lib/supabase/types";

export async function getStore():Promise<Store[]|[]>{
    const supabase = await createClient()

    try{
        const {data,error}=await supabase.from('store').select('*').order('createdAt',{ascending:false})

        if(error){
            return []
        }
        console.log(data)
        return data;
    }catch(error){
        throw error;
    }
}