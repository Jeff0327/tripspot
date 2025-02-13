import React from 'react';
import SigninDialog from "@/components/auth/SigninDialog";

function Page({
                                 searchParams,
                             }: {
    searchParams: { isOpen?: string }
}) {
    const isOpen = searchParams?.isOpen === 'true'

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="min-h-screen flex items-center justify-center">
                <SigninDialog isOpen={isOpen}/>
            </div>
        </div>
    );
}

export default Page;
