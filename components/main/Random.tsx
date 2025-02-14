import React from 'react';
import { Store } from "@/lib/types";
import Image from "next/image";

function RandomAria({ randomData }: { randomData: Store[] | null }) {

    return (
        <div className={'p-2 h-full max-h-[12vh] animate-fade-in'}>
            <h1 className={'font-jmt text-xl'}>이런곳은 어떤가요?</h1>
            {randomData &&randomData.map((item, i) => (
                <div key={item.id} className={'h-[24vh] rounded'}>
                    {item.images && item.images.length > 0 && (
                        <Image
                            width={500}
                            height={500}
                            src={item.images[0]}
                            alt={item.name}
                            unoptimized={true}
                            className={'w-full h-full rounded-lg'}
                        />
                    )       }
                    {item.name}</div>
            ))}
        </div>
    );
}

export default RandomAria;