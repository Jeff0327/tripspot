import React from 'react';
import {Store} from "@/lib/types";

function ServiceList({serviceList}: { serviceList: Store[] }) {
    if(!serviceList || serviceList.length<=0) return null;
    return (
        <div>{serviceList.map((item)=>(
            <div key={item.id}>{item.name}</div>
        ))}</div>
    );
}

export default ServiceList;