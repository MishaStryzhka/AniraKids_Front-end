import styled from 'styled-components';
import BgPhotoUrl from 'images/bg-photo/bg-desktop-1x.jpg';

export const WrapSection = styled.section`
  background-color: #77695e;
  padding-top: 306px;
  padding-bottom: 305px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 1440px;
  position: relative;
  z-index: 1;

  background-image: url(${BgPhotoUrl});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

export const MainTitle = styled.h1`
  font-family: 'Cormorant SC';
  font-size: 100px;
  font-weight: 600;
  line-height: normal;
  text-transform: uppercase;
  margin-bottom: 16px;

  color: #ffffff;
`;

export const Span = styled.span`
  font-size: 1.3em;
`;

export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;
  max-width: 400px;
  margin-bottom: 48px;

  color: #fff;
`;
