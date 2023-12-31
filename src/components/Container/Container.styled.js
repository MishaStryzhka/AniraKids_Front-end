import styled from 'styled-components';

export const StyledContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0 auto;

  @media screen and (min-width: 768px) {
    width: 768px;
  }

  @media screen and (min-width: 1280px) {
    width: 1440px;
    padding-left: 80px;
    padding-right: 80px;
  }
`;
