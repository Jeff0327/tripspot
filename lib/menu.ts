import { FaMapMarkerAlt } from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";
import { RiHotelFill } from "react-icons/ri";
export const navItems = [
    { icon: FaMapMarkerAlt, label: '장소 & 편의',link:'/service' ,activeColor:'#1e90ff'},
    { icon: GiKnifeFork , label: '맛집',link:'/food', activeColor:"#b8860b" },
    { icon: RiHotelFill , label: '숙소' ,link:'/hotel', activeColor:"#c71585"},
];