import { useEffect, useState } from 'react';
import { checkinApi, statsApi } from '../api';
import { formatDate } from '../lib/date';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const today = formatDate(new Date());
        const month = today.slice(0, 7);
        const [checkinsRes, statsRes] = await Promise.all([
          checkinApi.getByMonth(month),
          statsApi.getSummary(),
        ]);
        setCheckedIn(checkinsRes.data.includes(today));
        setStreak(statsRes.data.currentStreak);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCheckIn = async () => {
    if (checkedIn || loading) return;
    setLoading(true);
    try {
      const { data } = await checkinApi.checkIn();
      if (data.created) {
        setCheckedIn(true);
        setStreak(prev => prev + 1);
      }
    } catch {
      alert('打卡失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium text-gray-500">{todayStr}</h2>
        <h1 className="text-3xl font-bold text-gray-900">你好，{user?.nickname}！</h1>
        <p className="text-primary-600 font-medium">坚持就是胜利</p>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={checkedIn || loading}
        aria-label={checkedIn ? '今日已打卡' : '点击进行今日打卡'}
        className={`w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-500 transform
          ${checkedIn
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 cursor-default'
            : 'bg-white text-primary-500 border-4 border-primary-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95'
          }`}
      >
        {checkedIn ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : 'GO'}
      </button>

      <div className="text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wider">当前连签</p>
        <p className="text-4xl font-extrabold text-accent-500">{streak} <span className="text-lg text-gray-400 font-medium">天</span></p>
      </div>
    </div>
  );
}
