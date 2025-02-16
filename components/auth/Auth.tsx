import React from 'react';
import Menu from "@/components/layout/header/Menu";
import Link from "next/link";
import {createClient} from "@/utils/supabase/server";

async function Auth() {

    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    if(!user){
        console.log(user)
        return (
            <div className={'flex flex-row items-center gap-2 font-jmt text-sm'}>
                <Link href={'/login?isOpen=true'}>로그인</Link>
                <Menu/>
            </div>
        );
    }else{
        return (
            <div>{user.email}</div>
        )
    }

}

export default Auth;