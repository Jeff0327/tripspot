import React from 'react';
import UserSignupForm from "@/components/auth/signup/UserSignupForm";

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
         <div>사장님 가입폼</div>
     )
    }
}

export default Page;