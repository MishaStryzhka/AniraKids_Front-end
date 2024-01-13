import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const Section = styled.section`
  padding-top: 120px;
  padding-bottom: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

export const ListQ = styled.ul`
  display: flex;
  flex-direction: column;
  margin-top: 32px;
`;

export const Item = styled.li`
  flex-direction: column;

  width: 846px;
`;

export const Wrap = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
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
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const AnswerDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  padding: 16px;
  width: 810px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
