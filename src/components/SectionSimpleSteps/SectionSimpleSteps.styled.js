import styled from 'styled-components';

export const Section = styled.section`
  padding: 64px 0;
  @media screen and (min-width: 768px) {
    padding: 72px 0;
  }
  @media screen and (min-width: 1280px) {
    padding: 96px 0;
  }
`;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 8vw;
  }
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const ListSteps = styled.ul`
  display: flex;
  gap: 5px;
  /* justify-content: space-between; */
  @media screen and (min-width: 1280px) {
    padding: 0 70px;
    justify-content: space-between;
    align-items: center;
  }
`;

export const ItemStep = styled.li`
  @media screen and (max-width: 427.5px) {
    width: 42vw;
  }
  width: 180px;
  display: flex;
  flex-direction: column;
  position: relative;
  @media screen and (min-width: 1280px) {
    width: 240px;
  }

  &:nth-child(1)::after,
  &:nth-child(2)::after {
    background-color: ${({ theme }) => theme.color.mainColor2};
    @media screen and (min-width: 768px) {
      content: '';
      display: block;
      height: 1px;
      width: 34px;
      position: absolute;
      left: 110%;
      top: 50%;
    }
    @media screen and (min-width: 1280px) {
      width: 170px;
    }
  }
`;

export const Step = styled.span`
  @media screen and (max-width: 427.5px) {
    font-size: 11.2vw;
  }
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 48px;
  font-weight: 500;
  line-height: 1.17;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const TitleStep = styled.h3`
  @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  }
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  margin-bottom: 8px;

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const DescriptionStep = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  max-width: 234px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
