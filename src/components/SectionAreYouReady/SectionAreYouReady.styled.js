import styled from 'styled-components';

export const Section = styled.section`
  padding-bottom: 160px;
  width: 1440px;
  margin: 0 auto;
  display: flex;
`;

export const ImageWrap = styled.div`
  width: 730px;
`;

export const Picture = styled.picture``;

export const WrapText = styled.div`
  width: 710px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const Title = styled.h2`
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 48px;
  font-weight: 500;
  line-height: 1.17;
  margin-bottom: 48px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;
