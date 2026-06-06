import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Features } from '../components/Features';
import { Gallery } from '../components/Gallery';
import { Footer } from '../components/Footer';
import { AdminPanel } from '../components/AdminPanel';
import { PageHero } from '../components/PageHero';

export function ProductosPage() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onAdminClick={() => setAdminOpen(true)} isAdmin={isAdmin} />
      <main className="flex-1 pt-16">
        <PageHero
          title="Productos"
          subtitle="Piezas únicas hechas a mano con alma colombiana"
          emoji="🧵"
        />
        <Features />
        <Gallery onAdminClick={() => setAdminOpen(true)} />
      </main>
      <Footer />
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAuthChange={setIsAdmin}
      />
    </div>
  );
}
