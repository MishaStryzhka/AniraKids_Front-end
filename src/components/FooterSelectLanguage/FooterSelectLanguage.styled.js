import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const StyledFooterSelectLanguage = styled.div`
  position: relative;

  border: none;
  background: transparent;
  /* padding: 0; */
  padding: 10px 16px;

  display: flex;
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

export const MenuLanguage = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -42px;
  @media screen and (min-width: 1280px) {
    top: -50px;
  }
`;

export const ButtonLanguage = styled.button`
  background: none;
  border: none;
  padding: 0;

  color: #77695e;
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  line-height: 20px;
`;
