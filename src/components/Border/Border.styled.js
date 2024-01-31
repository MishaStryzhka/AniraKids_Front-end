import styled from 'styled-components';

export const BorderBottom = styled.div`
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.color.mainColor2};
  /* margin-bottom: 40px; */
  margin: 0 20px 40px;
  @media screen and (min-width: 768px) {
    margin: 0 0 40px 0;
  }
  @media screen and (min-width: 1280px) {
  }
`;
