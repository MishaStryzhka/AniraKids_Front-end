import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const WrapCard = styled(NavLink)`
  width: 305px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;
export const PictureCard = styled.picture`
  width: inherit;
  height: 350px;
`;
export const ButtonAddToFavorites = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  padding: 3px;
  border: none;

  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const WrapText = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    gap: ${({ $pageRentOut }) => ($pageRentOut ? '8px' : '12px')};
  }
`;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TextName = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextSize = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Span = styled.span`
  font-weight: 700;
  margin-right: 8px;
`;

export const Price = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextPrice = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor3};
`;
