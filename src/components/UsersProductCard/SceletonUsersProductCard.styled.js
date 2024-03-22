import Sceleton from 'components/Sceleton/Sceleton';
import { StyledSceletonStar } from 'components/Sceleton/Sceleton.styled';
import styled from 'styled-components';

export const SceletonCard = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 43vw;
  }
  position: relative;
  width: 184px;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  text-decoration: none;
  gap: 8px;

  box-shadow: ${({ theme }) => theme.boxShadow};

  @media screen and (min-width: 768px) {
    gap: 12px;
  }
  @media screen and (min-width: 768px) {
    width: 305px;
  }
`;

export const SceletonPictureCard = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    height: 46.7vw;
  }
  height: 200px;
  width: 184px;
  border-radius: 2px;
  overflow: hidden;
  @media screen and (min-width: 768px) {
    width: 305px;
    height: 350px;
  }
`;

export const SceletonTextName = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 18.7vw;
    height: 4.7vw;
  }
  width: 80px;
  height: 20px;

  @media screen and (min-width: 768px) {
    width: 80px;
    height: 20px;
  }
`;

export const SceletonPrice = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 18.7vw;
    height: 4.7vw;
  }
  border-radius: 50px;
  width: 80px;
  height: 20px;

  @media screen and (min-width: 768px) {
    width: 108px;
    height: 36px;
  }
`;

export const SceletonTextPrice = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 25.2vw;
    height: 4.2vw;
  }
  margin-top: 2px;
  width: 108px;
  height: 18px;

  @media screen and (min-width: 768px) {
    width: 108px;
    height: 18px;
  }
`;

export const SceletonPictureSeller = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 7.9vw;
    height: 7.9vw;
  }
  border-radius: 20px;
  width: 34px;
  height: 34px;

  @media screen and (min-width: 768px) {
    width: 34px;
    height: 34px;
  }
`;

export const SceletonStar = styled(StyledSceletonStar)`
  @media screen and (max-width: 427.5px) {
    width: 2.8vw;
    height: 2.8vw;
  }
  width: 12px;
  height: 12px;

  @media screen and (min-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

export const SceletonTextRating = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 5.8vw;
    height: 4.4vw;
  }
  width: 25px;
  height: 19px;

  @media screen and (min-width: 768px) {
    width: 25px;
    height: 19px;
  }
`;

export const SceletonUserNickname = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 18.7vw;
    height: 4.4vw;
  }
  width: 80px;
  height: 19px;

  @media screen and (min-width: 768px) {
    width: 80px;
    height: 19px;
  }
`;
