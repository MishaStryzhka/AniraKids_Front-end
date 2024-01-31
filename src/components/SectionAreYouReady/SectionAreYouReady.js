import {
  ImageWrap,
  Picture,
  Section,
  Title,
  WrapText,
} from './SectionAreYouReady.styled';

import Button from 'components/Button/Button';
import { useTranslation } from 'react-i18next';
import AreYouReadyDesktopWebp1x from 'images/photo-ready-woman/photo-ready-desktop-1x.webp';
import AreYouReadyDesktopWebp2x from 'images/photo-ready-woman/photo-ready-desktop-2x.webp';
import AreYouReadyDesktop2x from 'images/photo-ready-woman/photo-ready-desktop-2x.jpg';
import AreYouReadyDesktop1x from 'images/photo-ready-woman/photo-ready-desktop-1x.jpg';
import ReadyMobileWebp1x from 'images/photo-ready-woman/photo-ready-mobile-1x.webp';
import ReadyMobileWebp2x from 'images/photo-ready-woman/photo-ready-mobile-2x.webp';
import ReadyMobile1x from 'images/photo-ready-woman/photo-ready-mobile-1x.jpg';
import ReadyMobile2x from 'images/photo-ready-woman/photo-ready-mobile-2x.jpg';
import ReadyTabletWebp1x from 'images/photo-ready-woman/photo-ready-tablet-1x.webp';
import ReadyTabletWebp2x from 'images/photo-ready-woman/photo-ready-tablet-2x.webp';
import ReadyTablet1x from 'images/photo-ready-woman/photo-ready-tablet-1x.jpg';
import ReadyTablet2x from 'images/photo-ready-woman/photo-ready-tablet-2x.jpg';

const SectionAreYouReady = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionAreYouReady',
  });
  return (
    <Section>
      <ImageWrap>
        <Picture>
          <source
            media="(min-width: 1280px)"
            type="image/webp"
            srcSet={`${AreYouReadyDesktopWebp1x} 1x, ${AreYouReadyDesktopWebp2x} 2x`}
          />
          <source
            media="(min-width: 1280px)"
            srcSet={`${AreYouReadyDesktop1x} 1x, ${AreYouReadyDesktop2x} 2x`}
          />
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet={`${ReadyTabletWebp1x} 1x, ${ReadyTabletWebp2x} 2x`}
          />
          <source
            media="(min-width: 768px)"
            srcSet={`${ReadyTablet1x} 1x, ${ReadyTablet2x} 2x`}
          />
          <source
            media="(max-width: 768px)"
            type="image/webp"
            srcSet={`${ReadyMobileWebp1x} 1x, ${ReadyMobileWebp2x} 2x`}
          />
          <source
            media="(max-width: 768px)"
            srcSet={`${ReadyMobile1x} 1x, ${ReadyMobile2x} 2x`}
          />

          <img
            srcSet={`${AreYouReadyDesktop1x}`}
            alt="Вишукана пані"
            // width="730"
          />
        </Picture>
      </ImageWrap>
      <WrapText>
        <Title>{t('Ready to start')}</Title>
        <Button>{t('Rent')}</Button>
      </WrapText>
    </Section>
  );
};

export default SectionAreYouReady;
