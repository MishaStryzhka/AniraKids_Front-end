import Button from 'components/Button/Button';
import {
  Description,
  MainTitle,
  Span,
  WrapButton,
  WrapSection,
} from './SectionHero.styled';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';

const SectionHero = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionHero',
  });
  return (
    <WrapSection>
      <Container>
        <MainTitle>
          <Span>A</Span>nira<Span>K</Span>
        </MainTitle>
        <Description>{t('Platform Description')}</Description>
        <WrapButton>
          <Button>{t('rent')}</Button>
        </WrapButton>
      </Container>
    </WrapSection>
  );
};

export default SectionHero;
