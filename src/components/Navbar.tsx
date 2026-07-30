import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusCircle, Library, BarChart3, GitCompare, Menu, X, Download, Upload, Settings, Check, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useChocolate } from '../context/ChocolateContext';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/add', icon: PlusCircle, label: '品鉴' },
  { to: '/collection', icon: Library, label: '收藏' },
  { to: '/compare', icon: GitCompare, label: '对比' },
  { to: '/stats', icon: BarChart3, label: '统计' },
];

function ImportExportMenu() {
  const { exportData, importData } = useChocolate();
  const [open, setOpen] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importData(file);
      setImportMsg({ type: 'ok', text: count > 0 ? `导入了 ${count} 条新记录` : '没有新记录可导入（ID 重复）' });
    } catch {
      setImportMsg({ type: 'err', text: '文件格式错误，请选择 .json 备份文件' });
    }
    setTimeout(() => setImportMsg(null), 3000);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 ${
          open ? 'text-gold-300' : 'text-noir-400 hover:text-noir-200'
        }`}
      >
        <Settings size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50"
          >
            <button
              onClick={() => { exportData(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-noir-300 hover:bg-white/[0.04] hover:text-noir-100 transition-colors"
            >
              <Download size={15} className="text-noir-500" />
              导出备份 (.json)
            </button>
            <button
              onClick={() => { fileRef.current?.click(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-noir-300 hover:bg-white/[0.04] hover:text-noir-100 transition-colors"
            >
              <Upload size={15} className="text-noir-500" />
              导入备份
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* file input 放在 AnimatePresence 外部，防止退出动画卸载后 onChange 不触发 */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <AnimatePresence>
        {importMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`absolute right-0 top-full mt-2 px-3 py-2 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap ${
              importMsg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}
          >
            {importMsg.type === 'ok' ? <Check size={12} /> : <AlertCircle size={12} />}
            {importMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 justify-center pointer-events-none">
        <div className="pointer-events-auto mt-4 px-4">
          <div className="glass-card px-2 py-2 flex items-center gap-1">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 px-4 py-2 mr-2">
              <span className="text-xl">🍫</span>
              <span className="font-display font-bold text-noir-100 text-sm tracking-wide">
                Chocolate Journal
              </span>
            </NavLink>

            <div className="w-px h-6 bg-white/[0.06]" />

            {/* 导航项 */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300"
                >
                  <span className={`relative z-10 flex items-center gap-2 ${
                    isActive ? 'text-gold-300' : 'text-noir-400 hover:text-noir-200'
                  }`}>
                    <item.icon size={16} />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-1 rounded-lg bg-gold-500/10 border border-gold-500/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
            <div className="w-px h-6 bg-white/[0.06]" />
            <ImportExportMenu />
          </div>
        </div>
      </nav>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="glass-card mx-3 mb-3 px-1 py-2 flex items-center justify-around rounded-2xl border-white/[0.08]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <item.icon size={18} className={isActive ? 'text-gold-400' : 'text-noir-500'} />
                <span className={`text-[11px] font-medium ${
                  isActive ? 'text-gold-400' : 'text-noir-500'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-1 rounded-lg bg-gold-500/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* 移动端菜单按钮（右上角设置入口） */}
      <div className="md:hidden fixed top-4 right-4 z-40 flex gap-2">
        <ImportExportMenu />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass-card p-2.5 rounded-xl text-noir-300"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </>
  );
}
