import { getDaysInMonth, getFirstDayOfMonth, formatDate, isSameDay } from '../lib/date';

interface CalendarGridProps {
  year: number;
  month: number;
  checkins: Set<string>;
}

export default function CalendarGrid({ year, month, checkins }: CalendarGridProps) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="w-full max-w-md mx-auto" role="grid" aria-label={`${year}年${month + 1}月 打卡日历`}>
      <div className="grid grid-cols-7 mb-2" role="row">
        {weeks.map(d => (
          <div key={d} role="columnheader" className="text-center text-gray-400 text-sm font-medium py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} role="gridcell" />)}
        {days.map(day => {
          const date = new Date(year, month, day);
          const dateStr = formatDate(date);
          const isChecked = checkins.has(dateStr);
          const isToday = isSameDay(date, today);
          return (
            <div key={day} role="gridcell" aria-label={`${month + 1}月${day}日${isChecked ? ' 已打卡' : ''}`} className="flex flex-col items-center justify-center py-1">
              <span className={`flex items-center justify-center w-9 h-9 text-sm rounded-full ${isToday ? 'ring-2 ring-primary-400 ring-offset-1 font-bold' : 'text-gray-700'} ${isChecked ? 'bg-primary-500 text-white' : ''}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
