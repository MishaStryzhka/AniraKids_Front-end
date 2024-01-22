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
import { useTranslation } from 'react-i18next';

const SectionSimpleSteps = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionSimpleSteps',
  });
  return (
    <Section>
      <Container>
        <Title>{t('Just three simple steps')}</Title>
        <Border />
        <ListSteps>
          <ItemStep>
            <Step>1</Step>
            <TitleStep>{t('Register')}</TitleStep>
            <DescriptionStep>{t('Description of register')}</DescriptionStep>
          </ItemStep>
          <ItemStep>
            <Step>2</Step>
            <TitleStep>{t('Add a photo')}</TitleStep>
            <DescriptionStep>{t('Description of add a photo')}</DescriptionStep>
          </ItemStep>
          <ItemStep>
            <Step>3</Step>
            <TitleStep>{t('Receive payment')}</TitleStep>
            <DescriptionStep>
              {t('Description of receive payment')}
            </DescriptionStep>
          </ItemStep>
        </ListSteps>
      </Container>
    </Section>
  );
};

export default SectionSimpleSteps;
