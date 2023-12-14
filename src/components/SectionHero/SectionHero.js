import Button from 'components/Button/Button';
import {
  Description,
  MainTitle,
  Span,
  WrapSection,
} from './SectionHero.styled';
import { Container } from 'components/Container/Container';

const SectionHero = () => {
  return (
    <WrapSection>
      <Container>
        <MainTitle>
          <Span>A</Span>nira<Span>K</Span>
        </MainTitle>
        <Description>
          платформа оренди вишуканого вбрання та товарів для дітей і сімʼї{' '}
        </Description>
        <Button>ОРЕНДУВАТИ</Button>
      </Container>
    </WrapSection>
  );
};

export default SectionHero;
