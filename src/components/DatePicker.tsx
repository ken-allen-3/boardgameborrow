import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
}

export default function DatePicker({ selectedDate, onChange, minDate = new Date() }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate || new Date()));
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(minDate));
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`
              w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${open ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
            `}
          >
            <div className="flex items-center">
              <CalendarIcon className="absolute left-3 text-gray-400 h-5 w-5" />
              <span className="text-left">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </span>
            </div>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-2 transform w-screen max-w-xs">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      disabled={isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(minDate))}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-semibold">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs leading-6 text-gray-500 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isDisabled = isDateDisabled(day);
                      const dayIsToday = isToday(day);

                      return (
                        <button
                          key={day.toString()}
                          type="button"
                          onClick={() => !isDisabled && onChange(day)}
                          disabled={isDisabled}
                          className={`
                            p-2 rounded-full text-sm relative
                            ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                            ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                            ${dayIsToday && !isSelected ? 'text-indigo-600 font-semibold' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
