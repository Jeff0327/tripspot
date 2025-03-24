'use client'
import React from 'react';
import {FaUserCircle} from "react-icons/fa";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {User} from "@supabase/auth-js";
import {signOutAction} from "@/app/(main)/(modal)/login/actions";

function MyProfile({user}: { user: User }) {
    const handleLogout=async()=>{
        await signOutAction()
        //강제 새로고침(간헐적으로 로그인 모달이 뜨지않음) react-dom 문제
        window.location.href = '/main';
    }
    console.log(user)
    return (
        <Popover>
            <PopoverTrigger><FaUserCircle className={'w-5 h-5 lg:w-8 lg:h-8 relative'}/></PopoverTrigger>
            <PopoverContent>
                <div className={'flex flex-col gap-1 text-xs lg:text-md'}>
                    <span>{user.user_metadata.nickname} 님 환영합니다.</span>
                    <button onClick={handleLogout} className={'flex justify-end items-center font-semibold'}>로그아웃</button>
                </div>
            </PopoverContent>
        </Popover>

    );
}

export default MyProfile;