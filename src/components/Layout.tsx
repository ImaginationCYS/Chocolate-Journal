import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* 桌面端顶部留白 */}
      <div className="hidden md:block h-24" />
      {/* 移动端顶部留白 */}
      <div className="md:hidden h-4" />
      {/* 主内容区域 */}
      <main className="flex-1 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
    </div>
  );
}
