import styled from 'styled-components';

export const ContainerAppBar = styled.header`
  /* background-color: ${({ $mainPage }) => ($mainPage ? 'red' : 'green')}; */
  display: flex;
  flex-wrap: wrap;
  width: 1440px;
  padding: 12px 80px 0 80px;
  align-items: center;
`;

export const List = styled.ul`
  display: flex;
  gap: 48px;
  margin-right: 182px;
`;

export const Item = styled.li`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;

  color: #000;
`;
