import {
  AddWrap,
  Description,
  Item,
  List,
  // PaginationContainer,
  Section,
  Title,
  TitleDescription,
  WrapButton,
  WrapIcon,
} from './SectionAboutAniraK.styled';
import IconAboutFirst from 'images/icons/IconAboutFirst';
import IconAboutSecond from 'images/icons/IconAboutSecond';
import IconAboutThird from 'images/icons/IconAboutThird';
import IconAboutFour from 'images/icons/IconAboutFour';
import IconAboutFive from 'images/icons/IconAboutFive';
import { Container } from 'components/Container/Container';
import Border from 'components/Border/Border';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ButtonRent from 'components/Buttons/ButtonRent/ButtonRent';

const SectionAboutAniraK = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionAboutAniraK',
  });

  return (
    <Section>
      <Container>
        <Title>{t('Platform ANIRAK')}</Title>
        <Border />

        <List>
          <Swiper
            spaceBetween={20}
            breakpoints={{
              // Розміри Media
              428: {
                slidesPerView: 1.5,
              },
              768: {
                slidesPerView: 2.7,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
            navigation
            pagination={{ clickable: true, el: '.swiper-pagination' }}
            // onSwiper={swiper => console.log(swiper)}
            // onSlideChange={() => console.log('slide change')}
          >
            <SwiperSlide>
              <Item>
                <WrapIcon>
                  <IconAboutFirst width="80" height="80" />
                </WrapIcon>
                <TitleDescription>{t('Wardrobe expansion')}</TitleDescription>
                <Description>{t('Description wardrobe expansion')}</Description>
              </Item>
            </SwiperSlide>

            <SwiperSlide>
              <Item>
                <WrapIcon>
                  <IconAboutSecond width="80" height="80" />
                </WrapIcon>

                <TitleDescription>{t('Passive income')}</TitleDescription>
                <Description>{t('Description passive income')}</Description>
              </Item>
            </SwiperSlide>
            <SwiperSlide>
              <Item>
                <WrapIcon>
                  <IconAboutThird width="80" height="80" />
                </WrapIcon>

                <TitleDescription>{t('Economic benefit')}</TitleDescription>
                <Description>{t('Description economic benefit')}</Description>
              </Item>
            </SwiperSlide>
            <SwiperSlide>
              <Item>
                <WrapIcon>
                  <AddWrap>
                    <IconAboutFour width="70" height="54" />
                  </AddWrap>
                </WrapIcon>

                <TitleDescription>{t('Safe usage')}</TitleDescription>
                <Description>{t('Description safe usage')}</Description>
              </Item>
            </SwiperSlide>
            <SwiperSlide>
              <Item>
                <WrapIcon>
                  <IconAboutFive width="80" height="80" />
                </WrapIcon>
                <TitleDescription>{t('Helping the planet')}</TitleDescription>
                <Description>{t('Description of helping')}</Description>
              </Item>
            </SwiperSlide>
          </Swiper>
        </List>
        <WrapButton>
          <ButtonRent to="/popular">{t('rent')}</ButtonRent>
        </WrapButton>
      </Container>
    </Section>
  );
};
export default SectionAboutAniraK;
