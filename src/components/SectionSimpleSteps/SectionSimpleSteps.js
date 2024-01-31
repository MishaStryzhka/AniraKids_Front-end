import Border from 'components/Border/Border';
import {
  DescriptionStep,
  ItemStep,
  ListSteps,
  Section,
  Step,
  Title,
  TitleStep,
} from './SectionSimpleSteps.styled';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const SectionSimpleSteps = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionSimpleSteps',
  });
  return (
    <Section>
      <Container>
        <Title>{t('Just three simple steps')}</Title>
        <Border />
        <ListSteps>
          <Swiper
            // spaceBetween={20}
            breakpoints={{
              // Розміри Media
              428: {
                slidesPerView: 1.9,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 74,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 210,
              },
            }}
            navigation
            pagination={{ clickable: true, el: '.swiper-pagination' }}
            onSwiper={swiper => console.log(swiper)}
            onSlideChange={() => console.log('slide change')}
          >
            <SwiperSlide>
              <ItemStep>
                <Step>1</Step>
                <TitleStep>{t('Register')}</TitleStep>
                <DescriptionStep>
                  {t('Description of register')}
                </DescriptionStep>
              </ItemStep>
            </SwiperSlide>
            <SwiperSlide>
              <ItemStep>
                <Step>2</Step>
                <TitleStep>{t('Add a photo')}</TitleStep>
                <DescriptionStep>
                  {t('Description of add a photo')}
                </DescriptionStep>
              </ItemStep>
            </SwiperSlide>
            <SwiperSlide>
              <ItemStep>
                <Step>3</Step>
                <TitleStep>{t('Receive payment')}</TitleStep>
                <DescriptionStep>
                  {t('Description of receive payment')}
                </DescriptionStep>
              </ItemStep>
            </SwiperSlide>
          </Swiper>
        </ListSteps>
      </Container>
    </Section>
  );
};

export default SectionSimpleSteps;
