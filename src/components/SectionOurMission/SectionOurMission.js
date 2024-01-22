import { Container } from 'components/Container/Container';
import PhotoOpenClosetUrl1xWebp from 'images/photo-mission/photo-open-closet-1x-webp.webp';
import PhotoOpenClosetUrl2xWebp from 'images/photo-mission/photo-open-closet-2x-webp.webp';
import PhotoOpenClosetUrl1x from 'images/photo-mission/photo-open-closet-1x.jpg';
import PhotoOpenClosetUrl2x from 'images/photo-mission/photo-open-closet-2x.jpg';
import IconCheck from 'images/icons/IconCheck';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const {
  Section,
  Title,
  TextWrap,
  ListMission,
  Item,
  Description,
  ListModel,
  ImageWrap,
  Picture,
  AddWrap,
} = require('./SectionOurMission.styled');

const SectionOurMission = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.sectionOurMission',
  });
  const { pathname } = useLocation();
  return (
    <Section>
      <TextWrap>
        <Container>
          <Title $mainPage={pathname === `/`}>{t('Our mission')}</Title>
          <ListMission>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>{t('First mission')}</Description>
              </AddWrap>
            </Item>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>{t('Second mission')}</Description>
              </AddWrap>
            </Item>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>{t('Third mission')}</Description>
              </AddWrap>
            </Item>
          </ListMission>
          <Title $mainPage={pathname === `/`}>{t('Unique cyclic model')}</Title>
          <ListModel>
            <Item>
              <Description>{t('Description first about model')}</Description>
            </Item>
            <Item>
              <Description>{t('Description second about model')}</Description>
            </Item>
          </ListModel>
        </Container>
      </TextWrap>
      <ImageWrap>
        <Picture>
          <source
            media="(min-width: 1440px)"
            type="image/webp"
            srcSet={`${PhotoOpenClosetUrl1xWebp} 1x, ${PhotoOpenClosetUrl2xWebp} 2x`}
          />
          <source
            media="(min-width: 1440px)"
            srcSet={`${PhotoOpenClosetUrl1x} 1x, ${PhotoOpenClosetUrl2x} 2x`}
          />

          <img srcSet={`${PhotoOpenClosetUrl1x}`} alt="Гардероб" width="720" />
        </Picture>
      </ImageWrap>
    </Section>
  );
};

export default SectionOurMission;
