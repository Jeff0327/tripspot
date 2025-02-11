import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import React from 'react';
import {HiOutlineMenuAlt3} from "react-icons/hi";

function Menu() {
    return (
            <Sheet>
                <SheetTrigger asChild>
                    <button><HiOutlineMenuAlt3 className={'w-5 h-5'}/></button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>어떤 서비스를 찾으시나요?</SheetTitle>
                        <SheetDescription>
                            내정보
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
    );
}

export default Menu;