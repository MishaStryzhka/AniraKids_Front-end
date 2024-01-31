import { Container } from 'components/Container/Container';
import ClosetDesktopWebp1x from 'images/photo-mission/closet-desktop-1x.webp';
import ClosetDesktopWebp2x from 'images/photo-mission/closet-desktop-2x.webp';
import ClosetDesktop1x from 'images/photo-mission/closet-desktop-1x.jpg';
import ClosetDesktop2x from 'images/photo-mission/closet-desktop-2x.jpg';
import ClosetTabletWebp1x from 'images/photo-mission/closet-tablet-1x.webp';
import ClosetTabletWebp2x from 'images/photo-mission/closet-tablet-2x.webp';
import ClosetTablet1x from 'images/photo-mission/closet-tablet-1x.jpg';
import ClosetTablet2x from 'images/photo-mission/closet-tablet-2x.jpg';
import ClosetMobileWebp1x from 'images/photo-mission/closet-mobile-1x.webp';
import ClosetMobileWebp2x from 'images/photo-mission/closet-mobile-2x.webp';
import ClosetMobile1x from 'images/photo-mission/closet-mobile-1x.jpg';
import ClosetMobile2x from 'images/photo-mission/closet-mobile-2x.jpg';
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
            media="(min-width: 1280px)"
            type="image/webp"
            srcSet={`${ClosetDesktopWebp1x} 1x, ${ClosetDesktopWebp2x} 2x`}
          />
          <source
            media="(min-width: 1280px)"
            srcSet={`${ClosetDesktop1x} 1x, ${ClosetDesktop2x} 2x`}
          />
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet={`${ClosetTabletWebp1x} 1x, ${ClosetTabletWebp2x} 2x`}
          />
          <source
            media="(min-width: 768px)"
            srcSet={`${ClosetTablet1x} 1x, ${ClosetTablet2x} 2x`}
          />
          <source
            media="(max-width: 768px)"
            type="image/webp"
            srcSet={`${ClosetMobileWebp1x} 1x, ${ClosetMobileWebp2x} 2x`}
          />
          <source
            media="(max-width: 768px)"
            srcSet={`${ClosetMobile1x} 1x, ${ClosetMobile2x} 2x`}
          />

          <img srcSet={`${ClosetDesktop1x}`} alt="Гардероб" />
        </Picture>
      </ImageWrap>
    </Section>
  );
};

export default SectionOurMission;
