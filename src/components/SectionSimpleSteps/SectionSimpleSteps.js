import Border from 'components/Border/Border';
import {
  DescriptionStep,
  ItemStep,
  ListSteps,
  Section,
  Step,
  Title,
  TitleStep,
} from './SectionSimpleSteps.styled';
import { Container } from 'components/Container/Container';

const SectionSimpleSteps = () => {
  return (
    <Section>
      <Container>
        <Title>ВСЬОГО ТРИ ПРОСТИХ КРОКИ</Title>
        <Border />
        <ListSteps>
          <ItemStep>
            <Step>1</Step>
            <TitleStep>Зареєструйся</TitleStep>
            <DescriptionStep>
              Зареєструйся на платформі та додай свої дані
            </DescriptionStep>
          </ItemStep>
          <ItemStep>
            <Step>2</Step>
            <TitleStep>Додай фото</TitleStep>
            <DescriptionStep>
              Додай фото речі, яку хочеш здати
              <br /> в оренду
            </DescriptionStep>
          </ItemStep>
          <ItemStep>
            <Step>3</Step>
            <TitleStep>Отримай оплату</TitleStep>
            <DescriptionStep>
              Отримай гроші за свою вишукану річ
            </DescriptionStep>
          </ItemStep>
        </ListSteps>
      </Container>
    </Section>
  );
};

export default SectionSimpleSteps;
