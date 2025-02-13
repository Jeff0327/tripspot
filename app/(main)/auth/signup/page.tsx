import React from 'react';

async function Page({
                        searchParams
                    }: {
    searchParams: Promise<{ loginType: string }>
}) {
    const {loginType} =await searchParams
    if(!loginType) {

    }
    return (
        <div></div>
    );
}

export default Page;