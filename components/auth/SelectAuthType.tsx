import React from 'react';

import Link from "next/link";
import {CustomDialogContent, Dialog, DialogTrigger,DialogHeader,DialogDescription,DialogTitle} from "@/components/ui/CustomDialog";

function SelectAuthType() {
    return (
        <Dialog>
            <DialogTrigger>로그인</DialogTrigger>
            <CustomDialogContent className={'rounded-md'}>
                <DialogHeader>
                    <DialogTitle className={'font-jalnan text-md'}>선택해주세요</DialogTitle>
                    <DialogDescription className={'flex flex-row gap-2 justify-center items-center'}>
                        <Link className={'bg-sky-400 hover:bg-sky-500 text-white font-jalnan rounded-md p-4'} href={'/auth/user'}>회원 로그인</Link>
                        <Link className={'bg-sky-400 text-white font-jalnan rounded-md p-4'} href={'/auth/user'}>사업자 로그인</Link>
                    </DialogDescription>
                </DialogHeader>
                <Link href={'/auth/signup'} className={'flex font-semibold justify-center items-center text-xs underline'}>
                    계정이 없으신가요?
                </Link>
            </CustomDialogContent>

        </Dialog>

    );
}

export default SelectAuthType;