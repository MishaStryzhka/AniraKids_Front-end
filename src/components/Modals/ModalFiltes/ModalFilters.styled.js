import IconCross from 'images/icons/IconCross';
import styled from 'styled-components';

export const ModalWindow = styled.div`
  @media screen and (max-width: 427.5px) {
    padding: 5.6vw;
  }
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: center;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 26px;
  right: 32px;
  cursor: pointer;
`;

export const ModalTitle = styled.h2`
  /* @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  } */
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  text-transform: uppercase;
  margin-bottom: 24px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
