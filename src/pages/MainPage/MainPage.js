import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useTitle } from 'hooks';

export const MainPage = () => {
  useTitle('AniraK');
  return (
    <>
      <SectionHero />
      <SectionAboutAniraK />
      <SectionAboutUs />
    </>
  );
};
