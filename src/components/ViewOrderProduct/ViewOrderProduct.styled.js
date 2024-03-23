import IconBag from 'images/icons/IconBag';
import IconLongArrow from 'images/icons/IconLongArrow';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 260px;
  padding: 4px 0;
  text-decoration: none;
  margin-bottom: 24px;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.mainColor5};
`;
export const StyledIconLongArrow = styled(IconLongArrow)`
  transform: rotate(180deg);
`;

export const MainWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
export const WrapFirst = styled.div`
  width: 522px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;
export const WrapInfoSeller = styled.div`
  width: 522px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;
export const WrapInfoDelivery = styled.div`
  width: 522px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const InnerWrap = styled.div`
  display: flex;
  gap: 4px;
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export const WrapInfoPay = styled.div`
  width: 522px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const MainWrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Text = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  display: flex;
  justify-content: space-between;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const GeneralText = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;

  display: flex;
  justify-content: space-between;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Title = styled.h3`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapTextSeller = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  @media screen and (min-width: 768px) {
    gap: 8px;
  }
  @media screen and (min-width: 1280px) {
    gap: 8px;
    margin-bottom: 8px;
  }
`;

export const WrapIconsStars = styled.div`
  display: flex;
  gap: 8px;
`;

export const TextRating = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.8;
  margin-top: 2px;
  @media screen and (min-width: 768px) {
    margin-top: 0;
    font-size: 14px;
    line-height: 1.43;
  }

  color: ${({ theme }) => theme.color.mainColor3};
`;

export const UserNickname = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor3};
`;

export const WrapPartSeller = styled.div`
  display: flex;
  gap: 8px;
`;
export const PictureSeller = styled.picture`
  display: block;
  width: 48px;
  height: 48px;
  border-radius: 100px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.lightBGColor};
  overflow: hidden;
  background-color: gray;
`;
export const ImageSeller = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const DescriptionSeller = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  display: flex;
  gap: 4px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const StyledIconBag = styled(IconBag)`
  width: 20px;
  height: 20px;
  stroke: ${({ theme }) => theme.color.mainColor5};
`;

export const MessageSeller = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;

  display: flex;
  gap: 4px;

  color: ${({ theme }) => theme.color.mainColor2};
`;

export const TextPayment = styled(Text)`
  font-weight: 400;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
`;
