import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  width: 1440px;
  margin: 0 auto;
`;
export const Title = styled.h3`
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  max-width: 626px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextWrap = styled.div`
  width: 730px;

  background-color: ${({ theme }) => theme.color.lightBGColor};
  padding: 40px 0;
`;

export const ListMission = styled.ul`
  max-width: 630px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
`;

export const Item = styled.li`
  display: flex;
  gap: 8px;
`;

export const Description = styled.p`
  display: block;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  max-width: 630px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ListModel = styled.ul`
  max-width: 630px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const ImageWrap = styled.div`
  width: 710px;
`;

export const Picture = styled.picture`
  display: block;
  width: inherit;
`;

export const AddWrap = styled.div`
  max-width: 590px;
`;
