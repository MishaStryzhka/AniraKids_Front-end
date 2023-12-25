import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangeEmail.styled';

const ModalChangeEmail = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          onClick();
        }}
      />
      <ModalTitle>Змінити пошту</ModalTitle>
      <LabelModal>
        Введіть адресу електронної пошти
        <InputModal placeholder="exsample@gmail.com" />
      </LabelModal>
      <Button>Зберегти</Button>
    </ModalWindow>
  );
};

export default ModalChangeEmail;
