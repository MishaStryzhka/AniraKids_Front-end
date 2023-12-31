import styled from 'styled-components';

export const WrapCard = styled.div`
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
export const LikeButton = styled.button`
  width: 24px;
  height: 24px;
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
