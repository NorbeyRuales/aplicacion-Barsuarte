import { PageLayout } from '../components/PageLayout';
import { Contact } from '../components/Contact';
import { PageHero } from '../components/PageHero';

export function ContactoPage() {
  return (
    <PageLayout>
      <PageHero
        title="Contacto"
        subtitle="Estamos aquí para atenderte y crear juntos algo especial"
        emoji="💬"
      />
      <Contact />
    </PageLayout>
  );
}
