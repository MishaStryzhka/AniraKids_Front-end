import styled from 'styled-components';

export const Section = styled.section`
  width: 1440px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

export const Title = styled.h2`
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-transform: uppercase;

  color: #303130;
`;

export const Picture = styled.picture`
  display: block;
  width: 1440px;
  margin-bottom: 40px;
`;

export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: #000;
`;

export const Wrap = styled.div`
  padding: 24px;
  border-left: 1px solid #c6a58d;
`;
