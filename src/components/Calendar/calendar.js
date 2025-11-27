import React from "react";

export const Calendar = ({ value, onChange }) => {
    // Expect "value" to be a Date()
    const selectedDate = value instanceof Date ? value : new Date();

    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const weekdays = ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"];

    const months = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    // First day of month and #days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const changeMonth = (newMonth) => {
        const updated = new Date(year, newMonth, selectedDate.getDate());
        onChange(updated);
    };

    const changeYear = (newYear) => {
        const updated = new Date(newYear, month, selectedDate.getDate());
        onChange(updated);
    };

    const selectDay = (day) => {
        const updated = new Date(year, month, day);
        onChange(updated);
    };

    const dayCells = [];

    for (let i = 0; i < offset; i++) dayCells.push(<div key={"e" + i} />);

    for (let d = 1; d <= daysInMonth; d++) {
        const isSelected = d === selectedDate.getDate();
        const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

        dayCells.push(
            <div
                key={d}
                onClick={() => selectDay(d)}
                className={`flex flex-col items-center justify-center rounded-xl border 
          cursor-pointer h-14 w-16 transition 
          ${isSelected && "background-primary"}
          ${isToday && "border-2 border-green-500"}
          `}
            >
                <span className={`text-lg font-semibold ${isSelected ? "text-white" : isToday ? "text-green-500" : ""}`}>{d}</span>
                <span className={`text-sm ${isSelected ? "text-white" : isToday ? "text-green-500" : ""}`}>
                    {weekdays[new Date(year, month, d).getDay()]}
                </span>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col items-center gap-4 rounded-xl bg-white">
            <div className="flex gap-4">
                <select
                    value={month}
                    onChange={(e) => changeMonth(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg background-primary text-white"
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>

                <select
                    value={year}
                    onChange={(e) => changeYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg background-primary text-white"
                >
                    {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dayCells}
            </div>
        </div>
    );
};
