import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const quickLinks = [
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Productos', path: '/productos' },
  { label: 'Misión', path: '/mision' },
  { label: 'Trayectoria', path: '/trayectoria' },
  { label: 'Contacto', path: '/contacto' },
];

export function Hero() {
  return (
    <div id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-500 to-violet-600">
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Logo provisional */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="mb-8 inline-block"
        >
          <div className="relative bg-white rounded-full p-6 shadow-2xl">
            <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="logo-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4fd8" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="70"
                cy="70"
                r="62"
                fill="none"
                stroke="url(#logo-ring-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              />
            </svg>
            <div className="relative z-10 w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <motion.img
                src="/Logo_Plumas.png"
                alt="Logo Barsuarte"
                className="w-28 h-28 object-contain"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg"
        >
          Barsuarte Artesanías
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-4xl text-white mb-8 drop-shadow-md"
        >
          Tradición hecha a mano, con alma colombiana
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 text-white text-xl md:text-2xl mb-12"
        >
          <Sparkles className="w-6 h-6" />
          <p className="italic font-light">
            "Más que artesanías, creamos piezas con historia."
          </p>
          <Sparkles className="w-6 h-6" />
        </motion.div>

        {/* Quick navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 hover:border-white/60 transition-all duration-200 backdrop-blur-sm text-sm font-medium"
            >
              {link.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
