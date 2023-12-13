import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useTitle } from 'hooks';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionSimpleSteps from 'components/SectionSimpleSteps/SectionSimpleSteps';
import SectionAreYouReady from 'components/SectionAreYouReady/SectionAreYouReady';

export const MainPage = () => {
  useTitle('AniraK');
  return (
    <>
      <SectionHero />
      <SectionAboutAniraK />
      <SectionAboutUs />
      <SectionOurMission />
      <SectionSimpleSteps />
      <SectionAreYouReady />
    </>
  );
};
