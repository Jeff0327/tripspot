import React from 'react';
import {createClient} from "@/utils/supabase/server";

async function Page() {
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()

    if(!user) return null
    return (
        <div></div>
    );
}

export default Page;