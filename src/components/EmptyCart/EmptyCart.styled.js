import IconBag from 'images/icons/IconBag';
import { styled } from 'styled-components';

export const WrapCart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  margin-top: 40px;
  @media screen and (min-width: 768px) {
    margin-top: 24px;
  }
  @media screen and (min-width: 1280px) {
    margin-top: 0px;
  }
`;
export const StyledIconBag = styled(IconBag)`
  stroke: ${({ theme }) => theme.color.mainColor3};
  width: 70px;
  height: 70px;
`;
export const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;
export const Title = styled.h3`
  font-family: 'Open Sans Hebrew', sans-serif;

  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;

  color: ${({ theme }) => theme.color.btnColorBG};
`;
export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  color: #303130;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor4};
`;
