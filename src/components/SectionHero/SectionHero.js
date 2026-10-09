import {
  Description,
  MainTitle,
  Span,
  WrapButton,
  WrapSection,
} from './SectionHero.styled';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';
import ButtonRent from 'components/Buttons/ButtonRent/ButtonRent';

const SectionHero = ({ description, cta, to = "/popular" }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionHero',
  });
  return (
    <WrapSection>
      <Container>
        <MainTitle>
          <Span>A</Span>nira<Span>K</Span>
        </MainTitle>
        <Description>{description || t('Platform Description')}</Description>
        <WrapButton>
          <ButtonRent to={to}>{cta || t('rent')}</ButtonRent>
        </WrapButton>
      </Container>
    </WrapSection>
  );
};

export default SectionHero;
