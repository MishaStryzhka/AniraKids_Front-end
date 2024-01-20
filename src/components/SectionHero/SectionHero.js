import Button from 'components/Button/Button';
import {
  Description,
  MainTitle,
  Span,
  WrapSection,
} from './SectionHero.styled';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';

const SectionHero = () => {
  const { t } = useTranslation();
  return (
    <WrapSection>
      <Container>
        <MainTitle>
          <Span>A</Span>nira<Span>K</Span>
        </MainTitle>
        <Description>{t('Platform Description')}</Description>
        <Button>{t('rent')}</Button>
      </Container>
    </WrapSection>
  );
};

export default SectionHero;
