import React from 'react';
import SignupDialog from "@/components/auth/SignupDialog";

async function Page({
                        searchParams,
                    }: {
    searchParams: Promise<{ isOpen?: string }>
}) {
    const { isOpen } = await searchParams;

    const isModalOpen = isOpen === 'true';

    if (!isOpen) {
        return null;
    } else {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="min-h-screen flex items-center justify-center">
                    <SignupDialog isOpen={isModalOpen}/>
                </div>
            </div>
        );
    }
}

export default Page;