import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import { Container } from 'components/Container/Container';
import { useTitle } from 'hooks';

export const MainPage = () => {
  useTitle('AniraK');
  return (
    <Container>
      <SectionHero />
      <SectionAboutAniraK />
    </Container>
  );
};
