import React from 'react';
import SigninDialog from "@/components/auth/SigninDialog";

async function Page({
                  searchParams,
              }: {
    searchParams: { isOpen?: string }
}) {
    const { isOpen } = await searchParams;
    const isModalOpen = isOpen === 'true';

    if(!isOpen){
        return null;
    }else{
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="min-h-screen flex items-center justify-center">
                    <SigninDialog isOpen={isModalOpen}/>
                </div>
            </div>
        );
    }

}

export default Page;
