import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import { useTranslation } from 'react-i18next';

const AboutUsPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.aboutUsPage',
  });
  return (
    <>
      <Container>
        <GeneralTitle>{t('About us')}</GeneralTitle>
      </Container>
      <SectionAboutUs />
      <SectionOurMission />

    </>
  );
};

export default AboutUsPage;
