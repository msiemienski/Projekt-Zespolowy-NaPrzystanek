import { Settings, User, BusFront } from 'lucide-react';

export default function Main() {
  return (
    <div className="bg-white w-auto h-auto min-w-196 min-h-196 max-w-2xl max-h-[800px] m-6 rounded-lg shadow-lg">
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
  );
}