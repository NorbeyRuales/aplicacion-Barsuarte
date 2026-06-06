import { motion } from 'motion/react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export function PageHero({ title, subtitle, emoji }: PageHeroProps) {
  return (
    <div className="bg-gradient-to-br from-fuchsia-600 via-purple-500 to-violet-600 py-20 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {emoji && <div className="text-5xl mb-4">{emoji}</div>}
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-3">{title}</h1>
        {subtitle && <p className="text-white/85 text-xl max-w-2xl mx-auto">{subtitle}</p>}
        <div className="w-20 h-1 bg-white/50 mx-auto rounded-full mt-6" />
      </motion.div>
    </div>
  );
}
