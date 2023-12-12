import styled from 'styled-components';

export const ContainerAppBar = styled.header`
  width: 1280px;
  background-color: ${({ $mainPage }) =>
    $mainPage ? 'transparent' : 'transparent'};
  display: flex;
  flex-wrap: wrap;
  padding-top: 12px;
  align-items: center;
  justify-content: space-between;
  position: ${({ $mainPage }) => ($mainPage ? 'absolute' : 'relative')};
  top: 0;
  z-index: 2;
`;

export const List = styled.ul`
  display: flex;
  gap: 48px;
`;

export const Item = styled.li`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ $mainPage }) => ($mainPage ? '#fff' : '#000')};
`;
