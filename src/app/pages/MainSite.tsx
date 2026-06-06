import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { AdminPanel } from '../components/AdminPanel';

export function MainSite() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onAdminClick={() => setAdminOpen(true)} isAdmin={isAdmin} />
      {/* Hero covers full viewport including behind the transparent navbar */}
      <Hero />
      <Footer />
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAuthChange={setIsAdmin}
      />
    </div>
  );
}
