import Border from 'components/Border/Border';
import {
  Description,
  Picture,
  PictureContainer,
  Section,
  Title,
  Wrap,
} from './SectionAboutUs.styled';
import PhotoAbout1xWebp from 'images/photo-about-us/photo-about-us-1x-webp.webp';
import PhotoAbout2xWebp from 'images/photo-about-us/photo-about-us-2x-webp.webp';
import PhotoAboutTablet1xWebp from 'images/photo-about-us/about-us-tablet-1x-webp.webp';
import PhotoAboutTablet2xWebp from 'images/photo-about-us/about-us-tablet-2x-webp.webp';
import PhotoAboutMobile1xWebp from 'images/photo-about-us/about-us-mobile-1x-webp.webp';
import PhotoAboutMobile2xWebp from 'images/photo-about-us/about-us-mobile-2x-webp.webp';
import PhotoAbout1x from 'images/photo-about-us/photo-about-us-1x.jpg';
import PhotoAbout2x from 'images/photo-about-us/photo-about-us-2x.jpg';
import PhotoAboutTablet1x from 'images/photo-about-us/about-us-tablet-1x.jpg';
import PhotoAboutTablet2x from 'images/photo-about-us/about-us-tablet-2x.jpg';
import PhotoAboutMobile1x from 'images/photo-about-us/about-us-mobile-1x.jpg';
import PhotoAboutMobile2x from 'images/photo-about-us/about-us-mobile-2x.jpg';
import { Container } from 'components/Container/Container';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SectionAboutUs = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionAboutUs',
  });
  return (
    <Section $mainPage={pathname === `/`}>
      <Container>
        {pathname === '/' && <Title>{t('About Us')}</Title>}
        {/* {pathname === '/' && <Border />} */}
        <Border />
      </Container>
      <PictureContainer>
        <Picture>
          <source
            media="(min-width: 1280px)"
            type="image/webp"
            srcSet={`${PhotoAbout1xWebp} 1x, ${PhotoAbout2xWebp} 2x`}
          />
          <source
            media="(min-width: 1280px)"
            srcSet={`${PhotoAbout1x} 1x, ${PhotoAbout2x} 2x`}
          />
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet={`${PhotoAboutTablet1xWebp} 1x, ${PhotoAboutTablet2xWebp} 2x`}
          />
          <source
            media="(min-width: 768px)"
            srcSet={`${PhotoAboutTablet1x} 1x, ${PhotoAboutTablet2x} 2x`}
          />
          <source
            media="(max-width: 767.5px)"
            type="image/webp"
            srcSet={`${PhotoAboutMobile1xWebp} 1x, ${PhotoAboutMobile2xWebp} 2x`}
          />
          <source
            media="(max-width: 767.5px)"
            srcSet={`${PhotoAboutMobile1x} 1x, ${PhotoAboutMobile2x} 2x`}
          />

          <img srcSet={`${PhotoAbout1x}`} alt="Гардероб" />
        </Picture>
      </PictureContainer>
      <Container>
        <Wrap>
          <Description>{t('AniraK...')}</Description>
        </Wrap>
      </Container>
    </Section>
  );
};

export default SectionAboutUs;
