import { useEffect, useState } from 'react';
import { statsApi } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Summary {
  currentStreak: number;
  bestStreak: number;
  monthlyCount: number;
  completionRate: number;
}

interface TrendItem {
  month: string;
  count: number;
}

export default function Stats() {
  const [summary, setSummary] = useState<Summary>({ currentStreak: 0, bestStreak: 0, monthlyCount: 0, completionRate: 0 });
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t] = await Promise.all([statsApi.getSummary(), statsApi.getTrend()]);
        setSummary(s.data);
        setTrend(t.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: '当前连签', value: summary.currentStreak, unit: '天', color: 'text-accent-500', icon: '\uD83D\uDD25' },
    { title: '最高连签', value: summary.bestStreak, unit: '天', color: 'text-primary-500', icon: '\uD83C\uDFC6' },
    { title: '本月打卡', value: summary.monthlyCount, unit: '次', color: 'text-blue-500', icon: '\uD83D\uDCC5' },
    { title: '完成率', value: `${summary.completionRate}%`, unit: '', color: 'text-purple-500', icon: '\uD83D\uDCC8' },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">数据统计</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-gray-500 text-xs uppercase font-medium">{card.title}</p>
            <div className={`text-2xl font-bold mt-1 ${card.color}`}>
              {loading ? '-' : card.value}
              {card.unit && <span className="text-xs text-gray-400 ml-1 font-normal">{card.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">近6个月打卡趋势</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loading ? [] : trend} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {trend.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={_entry.count >= 20 ? '#10B981' : '#A7F3D0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
