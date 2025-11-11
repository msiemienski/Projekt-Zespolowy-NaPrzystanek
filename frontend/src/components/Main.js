'use client';
import { Settings, User, BusFront, Building2, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

export default function Main() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("Gdańsk");
    const handleSelectChange = (option) => {
        setSelected(option);
        setOpen(false);
    };
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
            <div className="flex flex-row justify-start items-center h-1/12 gap-20 pl-5 text-blue-600">
                <div className="flex flex-row items-center justify-center gap-2 relative">
                    <button value={selected} onChange={handleSelectChange} onClick={() => setOpen(!open)} className="cursor-pointer hover:opacity-70 transition">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Building2 
                                className="w-5 h-5" 
                            />
                            <span className="font-bold text-l">{selected}</span>
                            <ChevronsUpDown />
                        </div>
                    </button>
                    {open && (
                        <ul className="absolute top-full mt-1 ml-10 w-40 bg-white border rounded shadow-lg">
                        {["Gdańsk", "Sopot", "Gdynia"].map((opt) => (
                            <li
                            key={opt}
                            onClick={() => handleSelectChange(opt)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                            {opt}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
                
                
            </div>
        </div>
    );
}