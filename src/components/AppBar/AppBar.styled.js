import styled from 'styled-components';

export const ContainerAppBar = styled.header`
  @media screen and (max-width: 427.5px) {
    width: 90vw;
  }
  margin: 0 auto;
  background-color: ${({ $mainPage }) =>
    $mainPage ? 'transparent' : 'transparent'};
  display: flex;
  position: ${({ $mainPage }) => ($mainPage ? 'absolute' : 'relative')};
  top: 0;
  z-index: 3;
  @media screen and (min-width: 428px) {
    width: 388px;
  }
  @media screen and (min-width: 768px) {
    width: 688px;
  }
  @media screen and (min-width: 1280px) {
    flex-wrap: wrap;
    gap: 16px;
    width: ${({ $mainPage }) => ($mainPage ? '1280px' : '100%')};
  }
`;

export const FirstHeader = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 90vw;
  }
  width: inherit;
  display: flex;
  padding: 12px 0;
  justify-content: space-between;
  align-items: center;
`;
export const SecondHeader = styled.div`
  display: none;
  height: 60px;
  box-sizing: border-box;

  @media screen and (min-width: 1280px) {
    display: block;
    padding: 12px 0;
    margin: 0 auto;
  }
`;

export const WrapSearch = styled.div`
  display: none;
  @media screen and (min-width: 1280px) {
    display: block;
  }
`;

export const WrapBoxNav = styled.div`
  display: none;
  @media screen and (min-width: 1280px) {
    display: block;
  }
`;

export const List = styled.ul`
  display: none;

  @media screen and (min-width: 768px) {
    display: flex;
    gap: 16px;
  }
`;

export const Item = styled.li`
  text-align: center;
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
  padding: 8px 16px;

  color: ${({ $mainPage, theme }) =>
    $mainPage ? theme.color.mainColor1 : theme.color.mainColor5};
`;

export const BoxShadow = styled.div`
  /* @media screen and (min-width: 768px) { */
  box-shadow: 0px 4px 6px 0px rgba(17, 17, 17, 0.1);
  /* } */
`;

export const ButtonMenu = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
  /* margin-left: auto; */
  @media screen and (min-width: 1280px) {
    display: none;
  }
`;

export const Wrapper = styled.div`
  display: none;
  @media screen and (min-width: 1280px) {
    display: flex;
    align-items: center;
    gap: 24px;
  }
`;
