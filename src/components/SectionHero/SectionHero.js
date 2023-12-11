import ButtonAdd from 'components/ButtonAdd/ButtonAdd';
import {
  Description,
  MainTitle,
  Span,
  WrapSection,
} from './SectionHero.styled';

const SectionHero = () => {
  return (
    <WrapSection>
      <MainTitle>
        <Span>A</Span>nira<Span>K</Span>
      </MainTitle>
      <Description>
        платформа оренди вишуканого вбрання та товарів для дітей і сімʼї{' '}
      </Description>
      <ButtonAdd />
    </WrapSection>
  );
};

export default SectionHero;
