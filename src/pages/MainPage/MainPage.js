import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useTitle } from 'hooks';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionSimpleSteps from 'components/SectionSimpleSteps/SectionSimpleSteps';
import SectionAreYouReady from 'components/SectionAreYouReady/SectionAreYouReady';
import { useLocation } from 'react-router-dom';

const MainPage = () => {
  const location = useLocation();

  console.log('location', location);

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

export default MainPage;
