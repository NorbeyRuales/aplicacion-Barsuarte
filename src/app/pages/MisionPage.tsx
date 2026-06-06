import { PageLayout } from '../components/PageLayout';
import { MissionVision } from '../components/MissionVision';
import { PageHero } from '../components/PageHero';

export function MisionPage() {
  return (
    <PageLayout>
      <PageHero
        title="Misión & Visión"
        subtitle="Promovemos el arte artesanal colombiano con pasión y propósito"
        emoji="🎯"
      />
      <MissionVision />
    </PageLayout>
  );
}
