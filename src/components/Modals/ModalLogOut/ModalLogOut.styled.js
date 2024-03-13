import IconCross from 'images/icons/IconCross';
import styled from 'styled-components';

export const ModalWindow = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 83.6vw;
    padding: 3.7vw;
  }
  width: 358px;
  display: flex;
  padding: 16px;
  gap: 16px;
  flex-direction: column;
  align-items: center;
  position: relative;
  @media screen and (min-width: 768px) {
    padding: 24px;
    gap: 24px;
    width: 372px;
  }
  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  @media screen and (min-width: 768px) {
    top: 24px;
    right: 24px;
  }
`;

export const ModalTitle = styled.h2`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ButtonBack = styled.button`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
    padding: 3.3vw 9.3vw;
  }
  padding: 14px 40px;
  width: 304px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
  background-color: ${({ theme }) => theme.color.additionalColorGray};
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
