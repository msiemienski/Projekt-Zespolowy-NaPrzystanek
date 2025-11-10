import Image from "next/image";
import { Settings, User, BusFront } from 'lucide-react';
export default function Home() {
  return (
    
    <div className="flex flex-col justify-start items-left h-screen pt-10 pl-10">
      <div className="bg-white w-1/3 h-4/5 m-6 rounded-lg shadow-lg">
        <div className="flex flex-row items-center justify-between h-1/12 p-2 border-b border-gray-100">
        <button className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer">
          <User className="w-10 h-10 text-blue-600"/>
        </button>
        <div className="flex flex-row items-center justify-between gap-2">
          <h1 className="font-bold text-2xl select-none" style={{ fontFamily: 'var(--font-poppins)' }}>Na Przystanek</h1>
          <BusFront></BusFront>
        </div>
        
        <button className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer">
          <Settings className="w-10 h-10 text-blue-600"/>
        </button>

        </div>
      </div>

    </div>
  );
}
