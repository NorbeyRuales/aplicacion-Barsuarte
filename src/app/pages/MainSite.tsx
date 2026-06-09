import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';

export function MainSite() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      {/* Hero covers full viewport including behind the transparent navbar */}
      <Hero />
      <Footer />
    </div>
  );
}
