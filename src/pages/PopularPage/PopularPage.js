import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Border, MainWrap, Section, Title } from './PopularPage.styled';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import { Container } from 'components/Container/Container';
import { ButtonViewMore } from 'components/Buttons/ButtonViewMore/ButtonViewMore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import SceletonUsersProductCard from 'components/UsersProductCard/SceletonUsersProductCard';

const api = require('../../api');

const PopularPage = () => {
  const [productsByCategory, setProductsByCategory] = useState([]);

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.popularPage',
  });

  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();

  console.log('productsByCategory', productsByCategory);

  useEffect(() => {
    setIsLoading(true);

    api
      .getPopular()
      .then(data => {
        setProductsByCategory(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, []);
  // console.log();
  return (
    <Container>
      <MainWrap>
        {productsByCategory['women`s category']?.length !== 0 && (
          <Section>
            <Title>{t("Women's Clothing")}</Title>
            <Border />
            <Swiper
              breakpoints={{
                // Розміри Media
                320: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                428: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              navigation
              pagination={{ clickable: true, el: '.swiper-pagination' }}
            >
              {!isLoading ? (
                productsByCategory['women`s category']?.map(product => {
                  console.log('product', product);

                  return (
                    <SwiperSlide key={product._id}>
                      <UsersProductCard
                        to={`/forWomen/${product?._id}`}
                        product={product}
                      />
                    </SwiperSlide>
                  );
                })
              ) : (
                <>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <ButtonViewMore to={`../forWomen`}>{t('viewMore')}</ButtonViewMore>
          </Section>
        )}
        {productsByCategory['men`s category']?.length !== 0 && (
          <Section>
            <Title>{t('Men suits')}</Title>
            <Border />
            <Swiper
              breakpoints={{
                // Розміри Media
                320: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                428: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              navigation
              pagination={{ clickable: true, el: '.swiper-pagination' }}
            >
              {!isLoading ? (
                productsByCategory['men`s category']?.map(product => {
                  return (
                    <SwiperSlide key={product._id}>
                      <UsersProductCard
                        to={`/forMen/${product?._id}`}
                        product={product}
                      />
                    </SwiperSlide>
                  );
                })
              ) : (
                <>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <ButtonViewMore to="../forMen">{t('viewMore')}</ButtonViewMore>
          </Section>
        )}
        {productsByCategory['children`s category']?.length !== 0 && (
          <Section>
            <Title>{t("Children's Clothing")}</Title>
            <Border />
            <Swiper
              breakpoints={{
                // Розміри Media
                320: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                428: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              navigation
              pagination={{ clickable: true, el: '.swiper-pagination' }}
            >
              {!isLoading ? (
                productsByCategory['children`s category']?.map(product => {
                  return (
                    <SwiperSlide key={product._id}>
                      <UsersProductCard
                        to={`/forChildren/${product?._id}`}
                        product={product}
                      />
                    </SwiperSlide>
                  );
                })
              ) : (
                <>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <ButtonViewMore to="../forChildren">{t('viewMore')}</ButtonViewMore>
          </Section>
        )}
        {productsByCategory['decoration category']?.length !== 0 && (
          <Section>
            <Title>{t('Decor And Toys')}</Title>
            <Border />
            <Swiper
              breakpoints={{
                // Розміри Media
                320: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                428: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              navigation
              pagination={{ clickable: true, el: '.swiper-pagination' }}
            >
              {!isLoading ? (
                productsByCategory['decoration category']?.map(product => {
                  return (
                    <SwiperSlide key={product._id}>
                      <UsersProductCard
                        to={`/decorAndToys/${product?._id}`}
                        product={product}
                      />
                    </SwiperSlide>
                  );
                })
              ) : (
                <>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                  <SwiperSlide>
                    <SceletonUsersProductCard />
                  </SwiperSlide>
                </>
              )}
            </Swiper>
            <ButtonViewMore to="../decorAndToys">
              {t('viewMore')}
            </ButtonViewMore>
          </Section>
        )}
      </MainWrap>
    </Container>
  );
};

export default PopularPage;
