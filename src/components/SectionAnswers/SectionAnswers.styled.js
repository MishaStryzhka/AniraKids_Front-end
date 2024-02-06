import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 72px;
  padding-bottom: 80px;
  @media screen and (min-width: 1280px) {
    padding-top: 120px;
    padding-bottom: 160px;
  }
`;

export const Title = styled.h2`
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-transform: uppercase;
  @media screen and (min-width: 1280px) {
    font-size: 48px;
    line-height: 1.17;
  }

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const ListQ = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0 20px;
  @media screen and (min-width: 768px) {
    margin: 0 40px;
  }
  @media screen and (min-width: 1280px) {
    margin: 0;
  }
`;

export const Item = styled.li`
  flex-direction: column;
  @media screen and (min-width: 1280px) {
    width: 846px;
  }
`;

export const Wrap = styled.div`
  padding: 16px;
  display: flex;
  gap: 16px;
  /* justify-content: space-between; */
  border-bottom: 1px solid;

  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const StyledIconArrowUp = styled(IconArrow)`
  transform: ${({ $openAnswer }) =>
    $openAnswer ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;

export const QuestionDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  width: 316px;
  @media screen and (min-width: 768px) {
    width: 616px;
  }
  @media screen and (min-width: 1280px) {
    width: 774px;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const AnswerDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  padding: 16px;

  @media screen and (min-width: 1280px) {
    width: 814px;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;
