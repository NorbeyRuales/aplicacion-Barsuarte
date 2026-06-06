import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-2">Barsuarte Artesanías</h3>
            <p className="text-xl opacity-90">Tradición hecha a mano, con alma colombiana</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5 fill-current" />
            <p className="text-lg italic">
              "Más que artesanías, creamos piezas con historia."
            </p>
            <Heart className="w-5 h-5 fill-current" />
          </div>

          <div className="border-t border-white/30 pt-6 mt-6">
            <p className="opacity-75">
              © 2026 Barsuarte Artesanías. Todos los derechos reservados.
            </p>
            <p className="opacity-75 mt-2">
              Hecho con amor en Colombia 🇨🇴
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
