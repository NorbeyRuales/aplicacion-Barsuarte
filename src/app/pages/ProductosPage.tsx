import { Navbar } from '../components/Navbar';
import { Features } from '../components/Features';
import { Gallery } from '../components/Gallery';
import { Footer } from '../components/Footer';
import { PageHero } from '../components/PageHero';

export function ProductosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <PageHero
          title="Productos"
          subtitle="Piezas únicas hechas a mano con alma colombiana"
          emoji="🧵"
        />
        <Features />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
