import styled from 'styled-components';

export const MainWrap = styled.div`
  margin-top: 80px;
  margin-bottom: 136px;
  display: flex;
  flex-direction: column;
  gap: 80px;
`;
export const Section = styled.section``;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 7.5vw;
  }
  font-family: 'Cormorant SC', serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-align: center;
  text-transform: uppercase;

  border-color: ${({ theme }) => theme.color.mainColor5};
`;

export const Border = styled.div`
  border-bottom: 1px solid;
  margin-bottom: 16px;
  border-color: ${({ theme }) => theme.color.mainColor2};
`;
