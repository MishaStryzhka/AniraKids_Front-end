import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionAnswers from 'components/SectionAnswers/SectionAnswers';

const AboutUsPage = () => {
  return (
    <>
      <Container>
        <NavigationOverlay />
        <GeneralTitle>ПРО НАС</GeneralTitle>
      </Container>
      <SectionAboutUs />
      <SectionOurMission />
      <SectionAnswers />
    </>
  );
};

export default AboutUsPage;
