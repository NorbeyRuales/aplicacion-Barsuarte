import { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AdminPanel } from './AdminPanel';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onAdminClick={() => setAdminOpen(true)} isAdmin={isAdmin} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAuthChange={setIsAdmin}
      />
    </div>
  );
}
