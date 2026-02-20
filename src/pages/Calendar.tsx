import { useState, useEffect } from 'react';
import CalendarGrid from '../components/CalendarGrid';
import { checkinApi } from '../api';
import { formatMonth } from '../lib/date';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkins, setCheckins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const monthStr = formatMonth(currentDate);
        const { data } = await checkinApi.getByMonth(monthStr);
        setCheckins(new Set(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">打卡日历</h2>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">{year}年 {month + 1}月</h3>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
          <CalendarGrid year={year} month={month} checkins={checkins} />
        </div>
      </div>
    </div>
  );
}
