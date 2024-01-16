import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const StyledFooterSelectLanguage = styled.button`
  border: none;
  background: transparent;
  padding: 0;

  display: flex;
  height: 80px;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

export const CurrentLanguage = styled.p`
  color: ${({ theme }) => theme.color.btnColorBG};

  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
`;

export const StyledIconArrow = styled(IconArrow)`
  stroke: ${({ theme }) => theme.color.mainColor2};
  transform: ${({ $isOpenMenuLanguage }) =>
    $isOpenMenuLanguage ? 'rotate(-90deg)' : 'rotate(90deg)'};
`;
