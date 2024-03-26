import { Container } from 'components/Container/Container';
import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 1280px) {
    width: 1440px;
    margin: 0 auto;
    flex-direction: row;
  }
`;

export const PictureContainer = styled(Container)`
  padding: 0;
  @media screen and (min-width: 1280px) {
    width: 710px;
  }
`;

export const Title = styled.h3`
  font-family: ${({ $mainPage }) =>
    $mainPage ? 'Cormorant SC' : 'Open Sans Hebrew'};
  font-size: ${({ $mainPage }) => ($mainPage ? '32px' : '20px')};
  font-weight: ${({ $mainPage }) => ($mainPage ? '500' : '700')};
  line-height: ${({ $mainPage }) => ($mainPage ? '1.25' : '1.4')};
  margin-bottom: 16px;
  max-width: 370px;
  @media screen and (min-width: 768px) {
    max-width: 626px;
  }
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextWrap = styled.div`
  padding: 40px 0;
  @media screen and (min-width: 1280px) {
    width: 730px;
  }
  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const ListMission = styled.ul`
  max-width: 630px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
`;

export const Item = styled.li`
  display: flex;
  gap: 8px;
`;

export const Description = styled.p`
  /* display: block; */
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  max-width: 360px;
  @media screen and (min-width: 768px) {
    max-width: 580px;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ListModel = styled.ul`
  max-width: 630px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const ImageWrap = styled.div`
  @media screen and (min-width: 1280px) {
    width: 710px;
  }
`;

export const Picture = styled.picture`
  display: block;
  width: inherit;
  @media screen and (min-width: 1280px) {
    width: 710px;
  }
`;

export const AddWrap = styled.div`
  max-width: 590px;
`;

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
