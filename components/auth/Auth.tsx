import React from 'react';
import Menu from "@/components/layout/header/Menu";
import Link from "next/link";
import {createClient} from "@/utils/supabase/server";
import MyProfile from "@/components/auth/profile/MyProfile";
async function Auth() {

    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    if(!user){
        return (
            <div className={'flex flex-row items-center gap-2 font-jmt text-sm lg:text-lg'}>
                <Link href={'/login?isOpen=true'}>로그인</Link>
                <Menu user={null}/>
            </div>
        );
    }else{
        return (
            <div className={'flex flex-row items-center gap-2'}>
                <MyProfile user={user}/>
                <Menu user={user}/>
            </div>
        )
    }

}

export default Auth;