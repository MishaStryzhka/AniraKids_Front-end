import IconCross from 'images/icons/IconCross';
import styled from 'styled-components';

export const ModalBurgerMenu = styled.div`
  width: 409px;
  height: 428px;
  position: absolute;
  top: 0;
  left: 0;
  padding: 24px;
  z-index: 1;
  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
`;
