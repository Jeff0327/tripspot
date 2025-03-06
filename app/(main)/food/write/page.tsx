import React from 'react';
import CreateStore from "@/components/store/CreateStore";

async function Page() {

    return (
        <div className="min-h-screen bg-gray-100 mb-[6vh]">
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-4">맛집 등록</h1>
                    <CreateStore/>
                </div>
            </div>
        </div>
    );
}

export default Page;