import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Menu, Settings, Sparkles, UserCircle2, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  CLIENT_PORTAL_ROUTE,
  CLIENT_PROFILE_ROUTE,
  HOME_ROUTE,
  SESSION_CHANGED_EVENT,
  clearAppSession,
  readAppSession,
} from '../session';

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Productos', path: '/productos' },
  { label: 'Misión', path: '/mision' },
  { label: 'Trayectoria', path: '/trayectoria' },
  { label: 'Contacto', path: '/contacto' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(readAppSession);

  const isHome = location.pathname === HOME_ROUTE;
  const canOpenAdmin = session.isAdmin;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const syncSession = () => setSession(readAppSession());

    syncSession();
    window.addEventListener(SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  // Always show solid bg on non-home pages
  const solidBg = scrolled || !isHome;

  const portalRoute = session.isLoggedIn ? CLIENT_PROFILE_ROUTE : CLIENT_PORTAL_ROUTE;

  const handleAdminClick = () => {
    setMobileOpen(false);
    navigate(`${CLIENT_PROFILE_ROUTE}?admin=1`);
  };

  const handleLogout = () => {
    clearAppSession();
    setSession(readAppSession());
    setMobileOpen(false);
    navigate(HOME_ROUTE);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solidBg
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-fuchsia-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={HOME_ROUTE}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 group"
          >
            <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${solidBg ? 'bg-white' : 'bg-white/20 backdrop-blur-sm border border-white/40'}`}>
              <img
                src="/Logo_Plumas.png"
                alt="Logo Barsuarte"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none -mt-0.5">
              <span
                className={`uppercase transition-colors duration-300 ${solidBg ? 'text-[#163f9b]' : 'text-white'}`}
                style={{
                  fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                  fontSize: '1.28rem',
                  letterSpacing: '0.09em',
                  transform: 'skewX(-3deg)',
                  textShadow: solidBg ? '0 1px 0 rgba(255,255,255,0.35)' : '0 1px 2px rgba(0,0,0,0.25)',
                }}
              >
                Barsuarte
              </span>
              <span
                className={`-mt-1 whitespace-nowrap transition-colors duration-300 ${solidBg ? 'text-[#163f9b]/95' : 'text-white/95'}`}
                style={{
                  fontFamily: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive',
                  fontSize: '0.92rem',
                  letterSpacing: '0.02em',
                  transform: 'skewX(-6deg)',
                }}
              >
                Naturalidad y Color
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? solidBg
                        ? 'bg-fuchsia-100 text-fuchsia-700'
                        : 'bg-white/20 text-white'
                      : solidBg
                      ? 'text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Client Portal + Admin button + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              to={portalRoute}
              onClick={() => setMobileOpen(false)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                solidBg
                  ? 'border border-purple-300 text-purple-600 hover:bg-purple-50'
                  : 'border border-white/40 text-white hover:bg-white/10'
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5" />
              {session.isLoggedIn ? 'Mi portal' : 'Portal Clientes'}
            </Link>
            {canOpenAdmin && (
              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  canOpenAdmin
                    ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-300'
                    : solidBg
                    ? 'border border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50'
                    : 'border border-white/40 text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Panel Admin
              </button>
            )}
            {session.isLoggedIn && (
              <button
                onClick={handleLogout}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  solidBg
                    ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`md:hidden p-2 rounded-lg transition-colors ${solidBg ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/98 backdrop-blur-md shadow-xl border-t border-fuchsia-100"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors text-left ${
                      active
                        ? 'bg-fuchsia-100 text-fuchsia-700'
                        : 'text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to={portalRoute}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors text-left md:hidden"
              >
                <UserCircle2 className="w-4 h-4" />
                {session.isLoggedIn ? 'Mi portal' : 'Portal Clientes'}
              </Link>
              {canOpenAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors text-left md:hidden"
                >
                  <Settings className="w-4 h-4" />
                  Panel Admin
                </button>
              )}
              {session.isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-left md:hidden"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
