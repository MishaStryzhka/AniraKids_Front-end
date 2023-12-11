import styled from 'styled-components';

export const Section = styled.section`
  padding: 96px 0;
`;

export const Title = styled.h2`
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 40px;

  color: #303130;
`;

export const List = styled.ul`
  display: flex;
  gap: 20px;
  margin-bottom: 48px;
`;

export const Item = styled.li`
  display: flex;
  flex-direction: column;
  width: 240px;
`;

export const WrapIcon = styled.div`
  margin: 0 auto;
`;

export const TitleDescription = styled.h3`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin: 16px 0 8px 0;

  color: #000;
`;

export const Description = styled.p`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: #000;
`;
