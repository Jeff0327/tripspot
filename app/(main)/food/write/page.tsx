import React from 'react';
import CreateStore from "@/components/store/CreateStore";
import {createClient} from "@/utils/supabase/server";

async function Page() {
    const supabase= await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    if(!user){
        return null;
    }
    return (
        <div className="mb-[6vh] lg:mb-0 lg:mt-[10vh]">
            <div className="mx-auto">
                <div className="bg-white rounded-lg p-2">
                    <h1 className="text-2xl font-bold mb-4">맛집 등록</h1>
                    <CreateStore/>
                </div>
            </div>
        </div>
    );
}

export default Page;