'use client'
import React from 'react';
import {
    CustomDialogContent,
    CustomDialogHeader,
    Dialog,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/CustomDialog";
import { useRouter } from 'next/navigation';

export default function SignupDialog({
                                         isOpen,
                                     }: {
    isOpen: boolean;
}) {
    const router = useRouter();
    const [isModal,setIsModal]=React.useState(isOpen)
    const handleLinkClick = (path: string) => {
        setIsModal(false);
        router.push(path);
    };

    return (
        <Dialog open={isModal} onOpenChange={setIsModal}>
            <CustomDialogContent className={'rounded-md'}>
                <CustomDialogHeader>
                    <DialogTitle className={'font-jalnan text-md'}>선택해주세요</DialogTitle>
                    <DialogDescription className={'flex flex-row gap-2 justify-center items-center py-4'}>
                        <button
                            onClick={() => handleLinkClick('/auth/signup?loginType=user')}
                            className={'bg-sky-400 hover:bg-sky-500 text-white font-jalnan rounded-md p-4'}
                        >
                            회원 가입
                        </button>
                        <button
                            onClick={() => handleLinkClick('/auth/signup?loginType=business')}
                            className={'bg-sky-400 hover:bg-sky-500 text-white font-jalnan rounded-md p-4'}
                        >
                            사업자 가입
                        </button>
                    </DialogDescription>
                </CustomDialogHeader>
            </CustomDialogContent>
        </Dialog>
    );
}