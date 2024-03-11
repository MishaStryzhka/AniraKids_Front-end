import IconBag from 'images/icons/IconBag';
import styled from 'styled-components';

export const ModalWindow = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 79.4vw;
  }
  width: 340px;
  height: 628px;
  display: flex;
  padding: 24px;
  gap: 24px;
  border-radius: 8px;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;

  box-shadow: 0px 6px 8px 2px rgba(17, 17, 17, 0.2);
  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const Wrap = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

export const Button = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  padding: 8px;
  cursor: pointer;
  background-color: transparent;
`;

export const WrapNavLinks = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 71.3vw;
  }
  display: block;
  width: 305px;
  position: absolute;
  top: 100px;
  left: 24px;
`;

export const WrapBoxNav = styled.div`
  margin: 0 auto;
`;

export const StyledIconBag = styled(IconBag)`
  stroke: ${({ theme }) => theme.color.mainColor5};
  width: 24px;
  height: 24px;
`;

export const CloseButton = styled.button`
  @media screen and (max-width: 427.5px) {
    top: 4vw;
  }
  padding: 0;
  cursor: pointer;
  background-color: transparent;
  border: none;
  position: absolute;
  top: 16px;
  right: 24px;
`;
