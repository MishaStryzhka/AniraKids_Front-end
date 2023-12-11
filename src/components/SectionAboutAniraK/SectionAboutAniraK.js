import ButtonAdd from 'components/ButtonAdd/ButtonAdd';
import {
  Description,
  Item,
  List,
  Section,
  Title,
  TitleDescription,
  WrapIcon,
} from './SectionAboutAniraK.styled';
import IconAboutFirst from 'images/icons/IconAboutFirst';
import IconAboutSecond from 'images/icons/IconAboutSecond';
import IconAboutThird from 'images/icons/IconAboutThird';
import IconAboutFour from 'images/icons/IconAboutFour';
import IconAboutFive from 'images/icons/IconAboutFive';

const SectionAboutAniraK = () => {
  return (
    <Section>
      <Title>ПЛАТФОРМА ANIRAK - ЦЕ</Title>
      <List>
        <Item>
          <WrapIcon>
            <IconAboutFirst width="80" height="80" />
          </WrapIcon>

          <TitleDescription>Розширення гардеробу</TitleDescription>
          <Description>
            Можливість виглядати бездоганно при цьому, не витрачаючи багато
            грошей на покупку та не обмежуючи себе в приємних емоціях від
            оновлення гардероба
          </Description>
        </Item>

        <Item>
          <WrapIcon>
            <IconAboutSecond width="80" height="80" />
          </WrapIcon>

          <TitleDescription>Пасивний дохід</TitleDescription>
          <Description>
            Монетизуючи свою шафу і здаючи в оренду свої вишукані речі ви
            заробляєте додаткові кошти
          </Description>
        </Item>

        <Item>
          <WrapIcon>
            <IconAboutThird width="80" height="80" />
          </WrapIcon>

          <TitleDescription>Економічна вигода</TitleDescription>
          <Description>
            Оренда вишуканого і брендового одягу - гарна альтернатива покупці
            нового одягу для ваших особливих подій
          </Description>
        </Item>

        <Item>
          <WrapIcon>
            <IconAboutFour width="80" height="80" />
          </WrapIcon>

          <TitleDescription>Безпечне користування</TitleDescription>
          <Description>
            Завдяки інноваційним процесам авторизації (перевірки особи) та
            рейтингам користувачів — платформа контролює рівень безпеки та
            обмежує можливі шахрайства
          </Description>
        </Item>

        <Item>
          <WrapIcon>
            <IconAboutFive width="80" height="80" />
          </WrapIcon>
          <TitleDescription>Допомога планеті</TitleDescription>
          <Description>
            Свідоме циклічне споживання — це турбота про екологію та реальне
            зменшення негативного впливу на навколишнє середовище
          </Description>
        </Item>
      </List>
      <ButtonAdd />
    </Section>
  );
};
export default SectionAboutAniraK;
