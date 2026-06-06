import { PageLayout } from '../components/PageLayout';
import { About } from '../components/About';
import { PageHero } from '../components/PageHero';

export function NosotrosPage() {
  return (
    <PageLayout>
      <PageHero
        title="Nosotros"
        subtitle="Conoce la historia y el corazón detrás de Barsuarte Artesanías"
        emoji="🌺"
      />
      <About />
    </PageLayout>
  );
}
