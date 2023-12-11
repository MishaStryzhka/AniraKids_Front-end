import styled from 'styled-components';

export const ContainerAppBar = styled.header`
  background-color: ${({ $mainPage }) =>
    $mainPage ? '#77695E' : 'transparent'};
  display: flex;
  flex-wrap: wrap;
  padding-top: 12px;
  align-items: center;
  justify-content: space-between;
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
