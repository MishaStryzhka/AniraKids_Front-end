import Button from 'components/Button/Button';
import {
  ButtonBack,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalLogOut.styled';

const ModalLogOut = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          onClick();
        }}
      />
      <ModalTitle>Ви дійсно бажаєте вийти?</ModalTitle>

      <Button>Так, вийти</Button>
      <ButtonBack
        onClick={() => {
          onClick();
        }}
      >
        Назад
      </ButtonBack>
    </ModalWindow>
  );
};

export default ModalLogOut;
