import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangePassword.styled';

const ModalChangePassword = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          onClick();
        }}
      />
      <ModalTitle>Змінити пароль</ModalTitle>
      <LabelModal>
        Новий пароль
        <InputModal placeholder="****" />
      </LabelModal>
      <LabelModal>
        Введіть новий пароль ще раз
        <InputModal placeholder="****" />
      </LabelModal>
      <Button>Зберегти</Button>
    </ModalWindow>
  );
};

export default ModalChangePassword;
