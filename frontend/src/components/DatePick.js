'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import pl from "date-fns/locale/pl";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("pl", pl);

export default function DatePick() {
    const [today, setToday] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(today)
    const isSameDay = (date1, date2) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
    const [onceChanged, setOnceChanged] = useState(false);
    const onDateChange = (date) => {
        setSelectedDate(date);
        
        if(isSameDay(date, today)){
            setOnceChanged(false);
        }
        else
            setOnceChanged(true);
    }
    return (
        <div className="w-full">
            <DatePicker
                selected={selectedDate}
                onChange={(date) => onDateChange(date)}
                dateFormat={onceChanged ? "d MMMM yyyy HH:mm" : "HH:mm"}
                locale={pl}
                showTimeInput
                className="w-full px-4 py-3 text-base font-semibold text-blue-600 bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 cursor-pointer hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-20"
            />
        </div>
    )
}