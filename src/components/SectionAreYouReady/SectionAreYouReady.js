import {
  ImageWrap,
  Picture,
  Section,
  Title,
  WrapText,
} from './SectionAreYouReady.styled';

import PhotoReadyWoman1xWebp from 'images/photo-ready-woman/photo-are-you-ready-1x-webp.webp';
import PhotoReadyWoman2xWebp from 'images/photo-ready-woman/photo-are-you-ready-2x-webp.webp';
import PhotoReadyWoman1x from 'images/photo-ready-woman/photo-are-you-ready-1x.jpg';
import PhotoReadyWoman2x from 'images/photo-ready-woman/photo-are-you-ready-2x.jpg';
import Button from 'components/Button/Button';
import { useTranslation } from 'react-i18next';

const SectionAreYouReady = () => {
  const { t } = useTranslation();
  return (
    <Section>
      <ImageWrap>
        <Picture>
          <source
            media="(min-width: 1440px)"
            type="image/webp"
            srcSet={`${PhotoReadyWoman1xWebp} 1x, ${PhotoReadyWoman2xWebp} 2x`}
          />
          <source
            media="(min-width: 1440px)"
            srcSet={`${PhotoReadyWoman1x} 1x, ${PhotoReadyWoman2x} 2x`}
          />

          <img
            srcSet={`${PhotoReadyWoman1x}`}
            alt="Вишукана пані"
            width="730"
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
