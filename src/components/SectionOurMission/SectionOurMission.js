import { Container } from 'components/Container/Container';
import PhotoOpenClosetUrl1xWebp from 'images/photo-mission/photo-open-closet-1x-webp.webp';
import PhotoOpenClosetUrl2xWebp from 'images/photo-mission/photo-open-closet-2x-webp.webp';
import PhotoOpenClosetUrl1x from 'images/photo-mission/photo-open-closet-1x.jpg';
import PhotoOpenClosetUrl2x from 'images/photo-mission/photo-open-closet-2x.jpg';
import IconCheck from 'images/icons/IconCheck';
import { useLocation } from 'react-router-dom';

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
  const { pathname } = useLocation();
  return (
    <Section>
      <TextWrap>
        <Container>
          <Title $mainPage={pathname === `/`}>Наша місія </Title>
          <ListMission>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>
                  Полягає в тому, щоб змінити ваше уявлення про свою шафу.
                </Description>
              </AddWrap>
            </Item>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>
                  Задовільнити потребу в користуванні та носінні дорогого
                  гардеробу без необхідності купувати його, що однозначно
                  зекономить ваші кошти та не обмежить в приємних емоціях.
                </Description>
              </AddWrap>
            </Item>
            <Item>
              <IconCheck />
              <AddWrap>
                <Description>
                  Продовжити життєвий цикл одягу, що нестиме значний позитивний
                  вплив на <br /> екологію.
                  <br /> Ми знаємо, що суспільство почало розглядати більш
                  свідомі та екологічні способи споживання речей. Тому
                  використання вже існуючих нарядів замість купівлі нових
                  посприяє покращенню екології планети.
                </Description>
              </AddWrap>
            </Item>
          </ListMission>
          <Title $mainPage={pathname === `/`}>Унікальна циклічна модель</Title>
          <ListModel>
            <Item>
              <Description>
                Платформа надає можливість отримувати пасивний дохід, тобто
                після авторизації вам стає доступний функціонал щоб
                запропонувати і здавати в оренду свої речі. Важливо, це
                <br /> мають бути вишукані чи брендові речі в чудовому стані,
                для особливих чи святкових подій, заходів, фотосесій. Речі які
                не підходять нашим критеріям не будуть схвалені для <br />
                опублікації.
              </Description>
            </Item>
            <Item>
              <Description>
                Інноваційний процес авторизації та рейтинги користувачів надають
                високий рівень безпеки, а автоматизований функціонал платформи
                робить ваш процес оренди легким і зручним. Спробуйте і вам
                обов’язково це сподобається!
              </Description>
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
