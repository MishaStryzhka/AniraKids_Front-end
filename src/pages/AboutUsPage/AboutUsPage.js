import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionAnswers from 'components/SectionAnswers/SectionAnswers';
import { useTranslation } from 'react-i18next';

const AboutUsPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.aboutUsPage',
  });
  return (
    <>
      <Container>
        <NavigationOverlay />
        <GeneralTitle>{t('About us')}</GeneralTitle>
      </Container>
      <SectionAboutUs />
      <SectionOurMission />
      <SectionAnswers />
    </>
  );
};

export default AboutUsPage;
