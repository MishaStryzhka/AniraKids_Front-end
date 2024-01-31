import styled from 'styled-components';

export const StyledContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
  /* mobile */
  @media screen and (min-width: 428px) {
    width: 428px;
  }
  /* tablet */
  @media screen and (min-width: 768px) {
    width: 768px;
    padding-left: 40px;
    padding-right: 40px;
  }
  /* desktop */
  @media screen and (min-width: 1280px) {
    width: 1440px;
    padding-left: 80px;
    padding-right: 80px;
  }
`;
