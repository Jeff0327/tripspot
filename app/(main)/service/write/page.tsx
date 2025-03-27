import React from 'react';
import CreateStore from "@/components/store/CreateStore";
import {createClient} from "@/utils/supabase/server";
import {addStore} from "@/app/(main)/food/actions";

async function Page() {
    const supabase= await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    if(!user){
        return null;
    }
    const baseUrl='service'
    return (
        <div className="lg:mb-[6vh] mb-0 lg:mt-[10vh]">
            <div className="mx-auto">
                <div className="bg-white rounded-lg p-2">
                    <h1 className="text-2xl font-bold mb-4">맛집 등록</h1>
                    <CreateStore baseUrl={baseUrl} addStoreAction={addStore}/>
                </div>
            </div>
        </div>
    );
}

export default Page;