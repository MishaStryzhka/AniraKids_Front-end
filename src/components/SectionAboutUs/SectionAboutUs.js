import Border from 'components/Border/Border';
import {
  Description,
  Picture,
  Section,
  Title,
  Wrap,
} from './SectionAboutUs.styled';
import PhotoAbout1xWebp from 'images/photo-about-us/photo-about-us-1x-webp.webp';
import PhotoAbout2xWebp from 'images/photo-about-us/photo-about-us-2x-webp.webp';
import PhotoAbout1x from 'images/photo-about-us/photo-about-us-1x.jpg';
import PhotoAbout2x from 'images/photo-about-us/photo-about-us-2x.jpg';
import { Container } from 'components/Container/Container';
import { useLocation } from 'react-router-dom';

const SectionAboutUs = () => {
  const { pathname } = useLocation();
  return (
    <Section $mainPage={pathname === `/`}>
      <Container>
        {pathname === '/' && <Title>Про нас</Title>}
        <Border />
      </Container>
      <Picture>
        <source
          media="(min-width: 1440px)"
          type="image/webp"
          srcSet={`${PhotoAbout1xWebp} 1x, ${PhotoAbout2xWebp} 2x`}
        />
        <source
          media="(min-width: 1440px)"
          srcSet={`${PhotoAbout1x} 1x, ${PhotoAbout2x} 2x`}
        />

        <img srcSet={`${PhotoAbout1x}`} alt="Гардероб" width="1440" />
      </Picture>
      <Container>
        <Wrap>
          <Description>
            AniraK... — перша в Чеській Республіці платформа циклічної оренди
            вишуканого і брендового одягу і речей для усієї сімʼї. Провідне
            місце для економічно вигідного розширення/оновлення та монетизації
            вашого гардеробу.
          </Description>
        </Wrap>
      </Container>
    </Section>
  );
};

export default SectionAboutUs;
