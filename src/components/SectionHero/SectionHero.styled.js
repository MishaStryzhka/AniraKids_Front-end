import styled from 'styled-components';
import BgPhotoDesktopUrl from 'images/bg-photo/bg-desktop-1x.jpg';
import BgPhotoMobileUrl from 'images/bg-photo/photo-bg-mobile-1x.jpg';
import BgPhotoTabletUrl from 'images/bg-photo/photo-bg-tablet-1x.jpg';

export const WrapSection = styled.section`
  @media screen and (max-width: 427.5px) {
    width: 100vw;
  }
  background-color: ${({ theme }) => theme.color.btnColorBG};
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  padding-top: 300px;
  padding-bottom: 305px;
  width: 428px;
  background-image: url(${BgPhotoMobileUrl});
  @media screen and (min-width: 768px) {
    background-image: url(${BgPhotoTabletUrl});
    width: 768px;
  }
  @media screen and (min-width: 1280px) {
    background-image: url(${BgPhotoDesktopUrl});
    width: 1440px;
  }
`;

export const MainTitle = styled.h1`
  @media screen and (max-width: 427.5px) {
    font-size: 16vw;
  }
  font-family: 'Cormorant SC';
  /* font-size - тимчасово має бути 100px */
  font-size: 70px;
  /*  */
  font-weight: 600;
  line-height: normal;
  text-transform: uppercase;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.color.mainColor1};
  @media screen and (min-width: 1200px) {
    font-size: 100px;
  }
`;

export const Span = styled.span`
  font-size: 1.3em;
`;

export const Description = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 5vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;
  max-width: 400px;
  margin-bottom: 48px;
  color: ${({ theme }) => theme.color.mainColor1};
`;

export const WrapButton = styled.div`
  @media screen and (max-width: 427.5px) {
    /* width: 60vw; */
    margin: 0;
  }
  margin: 0 auto;
  width: 304px;
  @media screen and (min-width: 768px) {
    margin: 0;
  }
`;
