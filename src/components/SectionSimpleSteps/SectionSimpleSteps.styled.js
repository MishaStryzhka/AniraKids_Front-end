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
  margin-bottom: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const ListSteps = styled.ul`
  display: flex;
  padding: 0 70px;
  justify-content: space-between;
`;

export const ItemStep = styled.li`
  display: flex;
  flex-direction: column;
  position: relative;

  &:nth-child(1)::after,
  &:nth-child(2)::after {
    content: '';
    display: block;
    height: 1px;
    width: 170px;
    position: absolute;
    left: 110%;
    top: 50%;

    background-color: ${({ theme }) => theme.color.mainColor2};
  }
`;

export const Step = styled.span`
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 48px;
  font-weight: 500;
  line-height: 1.17;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const TitleStep = styled.h3`
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
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  max-width: 234px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
