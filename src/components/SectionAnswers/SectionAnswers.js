import { useState } from 'react';
import {
  AnswerDescription,
  Item,
  ListQ,
  QuestionDescription,
  Section,
  StyledIconArrowUp,
  Title,
  Wrap,
} from './SectionAnswers.styled';
import Border from 'components/Border/Border';
import { Container } from 'components/Container/Container';
import { arrayAnswers } from 'helpers';

const SectionAnswers = () => {
  const [isOpenAnswer, setIsOpenAnswer] = useState(
    Array(arrayAnswers.length).fill(false)
  );

  const handleToggleList = index => {
    const newOpenAnswer = [...isOpenAnswer];
    newOpenAnswer[index] = !newOpenAnswer[index];
    setIsOpenAnswer(newOpenAnswer);
  };
  //   const handleToggleList = () => {
  //     setIsOpenAnswer(prevIsOpenAnswer => !prevIsOpenAnswer);
  //   };
  return (
    <Section>
      <Container>
        <Title>Q&A</Title>
        <Border />
      </Container>
      <ListQ>
        {arrayAnswers.map(({ titleQuestion, textAnswer }, index) => (
          <Item key={index}>
            <Wrap>
              <QuestionDescription>{titleQuestion}</QuestionDescription>
              <StyledIconArrowUp
                $openAnswer={isOpenAnswer[index]}
                onClick={() => handleToggleList(index)}
              />
            </Wrap>
            {isOpenAnswer[index] && (
              <AnswerDescription>{textAnswer}</AnswerDescription>
            )}
          </Item>
        ))}
      </ListQ>
    </Section>
  );
};

export default SectionAnswers;
