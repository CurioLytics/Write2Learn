'use client';

import React, { useState, useMemo } from 'react';
import { formatDate } from '@/utils/date-utils';
import { Journal } from '@/types/journal';

interface WeekCalendarViewProps {
    journals: Journal[];
    onDateSelect: (date: Date) => void;
    selectedDate?: Date;
}

export function WeekCalendarView({ journals, onDateSelect, selectedDate }: WeekCalendarViewProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

    const weekDays = useMemo(() => generateWeekDays(currentWeekStart, journals), [currentWeekStart, journals]);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const weekEndDate = new Date(currentWeekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const formatWeekRange = () => {
        const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(currentWeekStart);
        const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(weekEndDate);
        const startDay = currentWeekStart.getDate();
        const endDay = weekEndDate.getDate();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay}-${endDay}`;
        }
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    };

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center mb-3">
                <button
                    onClick={goToPreviousWeek}
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="Previous week"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <h3 className="text-sm font-medium">
                    {formatWeekRange()}
                </h3>

                <button
                    onClick={goToNextWeek}
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="Next week"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => {
                    const isSelected = selectedDate && day.date &&
                        selectedDate.getDate() === day.date.getDate() &&
                        selectedDate.getMonth() === day.date.getMonth() &&
                        selectedDate.getFullYear() === day.date.getFullYear();

                    const journalDayStyle = day.hasJournal
                        ? 'bg-neutral-300 text-black font-bold'
                        : '';

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div className="text-xs font-medium text-gray-500 mb-1">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                            </div>
                            <button
                                onClick={() => day.date && onDateSelect(day.date)}
                                className={`
                  p-2 h-10 w-10 text-sm rounded-full flex items-center justify-center relative
                  hover:bg-neutral-400
                  ${day.isToday ? 'border-2 border-blue-500 text-blue-600' : ''}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${journalDayStyle}
                `}
                                aria-label={day.date ? formatDate(day.date) : 'Empty day'}
                                aria-pressed={isSelected}
                            >
                                {day.date?.getDate()}
                                {day.hasJournal && <span className="absolute w-1.5 h-1.5 bg-neutral-400 rounded-full -bottom-0.5"></span>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

type CalendarDay = {
    date: Date;
    isToday: boolean;
    hasJournal: boolean;
};

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    return new Date(d.setDate(diff));
}

function generateWeekDays(weekStart: Date, journals: Journal[]): CalendarDay[] {
    const today = new Date();

    // Convert journal dates to strings for easier comparison
    const journalDates = new Set(
        journals.map(journal => {
            const journalDate = new Date(journal.journal_date);
            return `${journalDate.getFullYear()}-${journalDate.getMonth()}-${journalDate.getDate()}`;
        })
    );

    const weekDays: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);

        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

        const isToday =
            today.getDate() === currentDate.getDate() &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear();

        const hasJournal = journalDates.has(dateKey);

        weekDays.push({ date: currentDate, isToday, hasJournal });
    }

    return weekDays;
}
