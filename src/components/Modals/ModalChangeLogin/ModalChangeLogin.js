import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangeLogin.styled';

const ModalChangeLogin = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>Змінити логін</ModalTitle>
      <LabelModal>
        Логін
        <InputModal placeholder="@nastia25" />
      </LabelModal>
      <Button>Зберегти</Button>
    </ModalWindow>
  );
};

export default ModalChangeLogin;
