import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {getPostDetail} from "@/app/(main)/auth/setting/myPost/[id]/actions";
import EditPostForm from "@/components/auth/setting/myPost/PostEdit";

async function Page({params}:{params:Promise<{id:string}>}) {
    const {id} = await params
    if(!id){
        return <div className="p-4">내 포스트를 찾을 수 없습니다.</div>
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?isOpen=true');
    }

    const result = await getPostDetail(id);

    if (!result.success || !result.data) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-xl font-bold mb-4">포스트 상세</h1>
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {result.error || "포스트를 불러오는데 실패했습니다."}
                </div>
            </div>
        );
    }

    const post = result.data;

    // 현재 사용자가 포스트 작성자인지 확인
    const isOwner = post.user_id === user.id;

    if (!isOwner) {
        return redirect('/auth/setting/myPost');
    }

    return (
        <div className="max-w-4xl mx-auto p-2">
            <h1 className="text-2xl font-bold mb-6">포스트 수정</h1>
            <EditPostForm post={post}/>
        </div>
    );
}

export default Page;