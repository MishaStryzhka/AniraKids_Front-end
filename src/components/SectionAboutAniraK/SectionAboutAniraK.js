import Button from 'components/Button/Button';
import {
  AddWrap,
  Description,
  Item,
  List,
  Section,
  Title,
  TitleDescription,
  WrapButton,
  WrapIcon,
} from './SectionAboutAniraK.styled';
import IconAboutFirst from 'images/icons/IconAboutFirst';
import IconAboutSecond from 'images/icons/IconAboutSecond';
import IconAboutThird from 'images/icons/IconAboutThird';
import IconAboutFour from 'images/icons/IconAboutFour';
import IconAboutFive from 'images/icons/IconAboutFive';
import { Container } from 'components/Container/Container';
import Border from 'components/Border/Border';
import { useTranslation } from 'react-i18next';

const SectionAboutAniraK = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionAboutAniraK',
  });
  return (
    <Section>
      <Container>
        <Title>{t('Platform ANIRAK')}</Title>
        <Border />
        <List>
          <Item>
            <WrapIcon>
              <IconAboutFirst width="80" height="80" />
            </WrapIcon>
            <TitleDescription>{t('Wardrobe expansion')}</TitleDescription>
            <Description>{t('Description wardrobe expansion')}</Description>
          </Item>

          <Item>
            <WrapIcon>
              <IconAboutSecond width="80" height="80" />
            </WrapIcon>

            <TitleDescription>{t('Passive income')}</TitleDescription>
            <Description>{t('Description passive income')}</Description>
          </Item>

          <Item>
            <WrapIcon>
              <IconAboutThird width="80" height="80" />
            </WrapIcon>

            <TitleDescription>{t('Economic benefit')}</TitleDescription>
            <Description>{t('Description economic benefit')}</Description>
          </Item>

          <Item>
            <WrapIcon>
              <AddWrap>
                <IconAboutFour width="70" height="54" />
              </AddWrap>
            </WrapIcon>

            <TitleDescription>{t('Safe usage')}</TitleDescription>
            <Description>{t('Description safe usage')}</Description>
          </Item>

          <Item>
            <WrapIcon>
              <IconAboutFive width="80" height="80" />
            </WrapIcon>
            <TitleDescription>{t('Helping the planet')}</TitleDescription>
            <Description>{t('Description of helping')}</Description>
          </Item>
        </List>
        <WrapButton>
          <Button>{t('rent')}</Button>
        </WrapButton>
      </Container>
    </Section>
  );
};
export default SectionAboutAniraK;
