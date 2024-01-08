import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';

const AboutUsPage = () => {
  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>ПРО НАС</GeneralTitle>
    </Container>
  );
};

export default AboutUsPage;
