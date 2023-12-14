import Button from 'components/Button/Button';
import {
  Description,
  DescriptionLink,
  Form,
  Input,
  Label,
  ModalWindow,
  Separation,
  StyledNavLink,
  StyledNavLinkCondition,
  TextCondition,
  Wrap,
  WrapForm,
  WrapLinks,
} from './ModalRegistration.styled';
import IconFacebook from 'images/icons/IconFacebook';
import IconGoogle from 'images/icons/IconGoogle';
import IconEmail from 'images/icons/IcomEmail';

const ModalRegistration = () => {
  return (
    <ModalWindow>
      <WrapForm>
        <Form>
          <Description>
            Зареєструйтеся за допомогою номера телефону або електронної пошти
          </Description>
          <Wrap>
            <Label>
              Номер телефону
              <Input placeholder="+380" />
            </Label>

            <Label>
              Пароль
              <Input placeholder="****" />
            </Label>
          </Wrap>
          <Button>ПРОДОВЖИТИ</Button>
          <Separation>АБО</Separation>
          <WrapLinks>
            <StyledNavLink>
              <IconFacebook />
              <DescriptionLink>Facebook</DescriptionLink>
            </StyledNavLink>
            <StyledNavLink>
              <IconGoogle />
              <DescriptionLink>Google</DescriptionLink>
            </StyledNavLink>
            <StyledNavLink>
              <IconEmail />
              <DescriptionLink>Інше</DescriptionLink>
            </StyledNavLink>
          </WrapLinks>
          <TextCondition>
            Натискаючи Продовжити, Ви приймаєте
            <StyledNavLinkCondition>
              Політику конфіденційності
            </StyledNavLinkCondition>
            .
          </TextCondition>
        </Form>
      </WrapForm>
    </ModalWindow>
  );
};

export default ModalRegistration;
