import styled from 'styled-components';

export const ContainerAppBar = styled.header`
  width: ${({ $mainPage }) => ($mainPage ? '1280px' : '100%')};
  margin: 0 auto;
  background-color: ${({ $mainPage }) =>
    $mainPage ? 'transparent' : 'transparent'};
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  position: ${({ $mainPage }) => ($mainPage ? 'absolute' : 'relative')};
  top: 0;
  z-index: 2;
`;

export const FirstHeader = styled.div`
  width: inherit;
  display: flex;
  padding: 12px 0;
  justify-content: space-between;
  align-items: center;
`;
export const SecondHeader = styled.div`
  padding: 12px 0;
  margin: 0 auto;
`;

export const List = styled.ul`
  display: flex;
  gap: 48px;
`;

export const Item = styled.li`
  text-align: center;
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ $mainPage, theme }) =>
    $mainPage ? theme.color.mainColor1 : theme.color.mainColor5};
`;

export const BoxShadow = styled.div`
  /* width: 100%; */
  /* height: ${({ $mainPage }) => ($mainPage ? '0px' : '4px')}; */
  box-shadow: 0px 4px 6px 0px rgba(17, 17, 17, 0.1);
`;
