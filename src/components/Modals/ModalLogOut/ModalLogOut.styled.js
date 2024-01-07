import IconCross from 'images/icons/IconCross';
import styled from 'styled-components';

export const ModalWindow = styled.div`
  width: 420px;
  display: flex;
  padding: 24px;
  gap: 24px;
  flex-direction: column;
  align-items: center;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
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
