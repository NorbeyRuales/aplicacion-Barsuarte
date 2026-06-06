import { PageLayout } from '../components/PageLayout';
import { Journey } from '../components/Journey';
import { PageHero } from '../components/PageHero';

export function TrayectoriaPage() {
  return (
    <PageLayout>
      <PageHero
        title="Trayectoria"
        subtitle="El camino recorrido con dedicación, cultura y amor artesanal"
        emoji="🏅"
      />
      <Journey />
    </PageLayout>
  );
}
