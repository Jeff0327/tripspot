import React from 'react';
import SignupDialog from "@/components/auth/SignupDialog";

function Page({
                  searchParams,
              }: {
    searchParams: { isOpen?: string }
}) {
    const isOpen = searchParams?.isOpen === 'true'

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="min-h-screen flex items-center justify-center">
                <SignupDialog isOpen={isOpen}/>
            </div>
        </div>
    );
}

export default Page;
