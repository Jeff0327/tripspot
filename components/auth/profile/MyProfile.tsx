import React from 'react';
import {FaUserCircle} from "react-icons/fa";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {User} from "@supabase/auth-js";

function MyProfile({user}: { user: User }) {
    return (
        <Popover>
            <PopoverTrigger><FaUserCircle className={'w-5 h-5 relative'}/></PopoverTrigger>
            <PopoverContent>
                <div className={'text-xs'}>
                    <span>{user.email}</span>
                </div>
            </PopoverContent>
        </Popover>

    );
}

export default MyProfile;