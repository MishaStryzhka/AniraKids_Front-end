import styled from 'styled-components';

export const Button = styled.button`
  padding: 14px 40px;
  width: 304px;
  border: none;
  border-radius: 2px;

  text-align: center;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor1};
  background-color: ${({ theme }) => theme.color.btnColorBG};
`;
