import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
);
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const mobileNav = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`;

  const desktopNav = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-6 py-4 space-x-4 transition-colors ${isActive ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 md:flex-row">
      <aside className="hidden w-64 bg-white shadow-md md:flex md:flex-col z-10">
        <div className="flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-primary-600">运动打卡</h1>
        </div>
        <nav className="flex-1 mt-6">
          <NavLink to="/" end className={desktopNav}><HomeIcon /><span className="font-medium">今日打卡</span></NavLink>
          <NavLink to="/calendar" className={desktopNav}><CalendarIcon /><span className="font-medium">历史日历</span></NavLink>
          <NavLink to="/stats" className={desktopNav}><ChartIcon /><span className="font-medium">数据统计</span></NavLink>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-gray-500 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOutIcon /><span className="ml-3">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center md:hidden z-20">
        <NavLink to="/" end className={mobileNav}><HomeIcon /><span className="text-xs">打卡</span></NavLink>
        <NavLink to="/calendar" className={mobileNav}><CalendarIcon /><span className="text-xs">日历</span></NavLink>
        <NavLink to="/stats" className={mobileNav}><ChartIcon /><span className="text-xs">统计</span></NavLink>
      </nav>
    </div>
  );
}
