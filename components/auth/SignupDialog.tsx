'use client'
import React from 'react';
import {
    CustomDialogContent, Dialog,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/CustomDialog";
import Link from "next/link";

export default function SignupDialog({
                                         isOpen
                                     }: {
    isOpen: boolean
}) {
    return (
        <Dialog open={isOpen}>
            <CustomDialogContent className={'rounded-md'}>
                <DialogHeader>
                    <DialogTitle className={'font-jalnan text-md'}>선택해주세요</DialogTitle>
                    <DialogDescription className={'flex flex-row gap-2 justify-center items-center py-4'}>
                        <Link className={'bg-sky-400 hover:bg-sky-500 text-white font-jalnan rounded-md p-4'} href={'/auth/signin/anonymous'}>회원 가입</Link>
                        <Link className={'bg-sky-400 text-white font-jalnan rounded-md p-4'} href={'/auth/signin/business'}>사업자 가입</Link>
                    </DialogDescription>
                </DialogHeader>
            </CustomDialogContent>
        </Dialog>
    );
}