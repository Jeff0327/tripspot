'use client'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {FaRegHeart} from "react-icons/fa6";
import React from 'react';
import {HiOutlineMenuAlt3} from "react-icons/hi";
import {User} from "@supabase/auth-js";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import {IoIosArrowForward} from "react-icons/io";
import { BsFillSignpostFill } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
function Menu({user}: { user: User | null }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const {notify} = useAlert()
    const router = useRouter()
    const handleMyinfo = (link: string) => {
        if (!user) {
            notify.info('로그인 후 이용가능합니다.')
        }
        setIsOpen(false)
        router.push(link)
    }
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button><HiOutlineMenuAlt3 className={'w-5 lg:w-8 h-5 lg:h-8'}/></button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className={'flex font-jalnan text-base text-black/70'}>설정 및 메뉴</SheetTitle>
                    <SheetDescription className={'flex flex-col gap-2 font-jmt text-lg text-black/70'}>
                        <button className={'flex flex-row items-center w-full justify-between'}
                                onClick={() => handleMyinfo('/auth/setting/myInfo')}>
                            <div className={'flex flex-row items-center gap-1'}><VscAccount /><span>내 정보</span></div>
                            <IoIosArrowForward className={'w-5 h-5'}/>
                        </button>
                        <button className={'flex flex-row items-center w-full justify-between'}
                                onClick={() => handleMyinfo('/auth/setting/myPost')}>
                            <div className={'flex flex-row items-center gap-1'}><BsFillSignpostFill/><span>내 포스트</span></div>
                            <IoIosArrowForward className={'w-5 h-5'}/>
                        </button>
                        <button className={'flex flex-row items-center w-full justify-between'}
                                onClick={() => handleMyinfo('/auth/setting/myLike')}>
                            <div className={'flex flex-row items-center gap-1'}><FaRegHeart/><span>찜 목록</span></div>
                            <IoIosArrowForward className={'w-5 h-5'}/>
                        </button>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}

export default Menu;