import Sceleton from 'components/Sceleton/Sceleton';
import { StyledSceletonStar } from 'components/Sceleton/Sceleton.styled';
import styled from 'styled-components';

export const SceletonCard = styled.div`
  position: relative;

  width: ${({ $pageRentOut }) => ($pageRentOut ? '305px' : '184px')};
  /* height: 100%; */
  border-radius: 2px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  text-decoration: none;
  gap: ${({ $pageRentOut }) => ($pageRentOut ? '16px' : '8px')};

  box-shadow: ${({ theme }) => theme.boxShadow};

  @media screen and (min-width: 768px) {
    gap: ${({ $pageRentOut }) => ($pageRentOut ? '16px' : '12px')};
  }
  @media screen and (min-width: 768px) {
    width: 305px;
  }
`;

export const SceletonPictureCard = styled(Sceleton)`
  width: inherit;
  height: ${({ $pageRentOut }) => ($pageRentOut ? '350px' : '200px')};
  width: ${({ $pageRentOut }) => ($pageRentOut ? '305px' : '184px')};
  border-radius: 2px;

  @media screen and (min-width: 768px) {
    width: 305px;
    height: 350px;
  }
`;

export const SceletonTextName = styled(Sceleton)`
  width: 80px;
  height: 20px;

  @media screen and (min-width: 768px) {
    width: 80px;
    height: 20px;
  }
`;

export const SceletonPrice = styled(Sceleton)`
  border-radius: 50px;
  width: 80px;
  height: 20px;

  @media screen and (min-width: 768px) {
    width: 108px;
    height: 36px;
  }
`;

export const SceletonTextPrice = styled(Sceleton)`
  margin-top: 2px;
  width: 108px;
  height: 18px;

  @media screen and (min-width: 768px) {
    width: 108px;
    height: 18px;
  }
`;

export const SceletonPictureSeller = styled(Sceleton)`
  border-radius: 20px;
  width: 34px;
  height: 34px;

  @media screen and (min-width: 768px) {
    width: 34px;
    height: 34px;
  }
`;

export const SceletonStar = styled(StyledSceletonStar)`
  width: 12px;
  height: 12px;

  @media screen and (min-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

export const SceletonTextRating = styled(Sceleton)`
  width: 25px;
  height: 19px;

  @media screen and (min-width: 768px) {
    width: 25px;
    height: 19px;
  }
`;

export const SceletonUserNickname = styled(Sceleton)`
  width: 80px;
  height: 19px;

  @media screen and (min-width: 768px) {
    width: 80px;
    height: 19px;
  }
`;
