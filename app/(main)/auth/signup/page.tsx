import React from 'react';
import UserSignupForm from "@/components/auth/signup/UserSignupForm";
import BossSignupForm from "@/components/auth/signup/BossSignupForm";

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ loginType: string }>
}) {
    const {loginType} =await searchParams
    if(!loginType) {
        return null;
    }
    if(loginType==='user'){
        return (
            <UserSignupForm/>
        )
    }else{
     return (
            <BossSignupForm/>
     )
    }
}

export default Page;