import Button from 'components/Button/Button';
import {
  ButtonBack,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalLogOut.styled';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../redux/auth/operations';

const ModalLogOut = ({ onClick }) => {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(logOut());
  };

  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>Ви дійсно бажаєте вийти?</ModalTitle>

      <Button type="button" onClick={() => handleSignOut()}>
        Так, вийти
      </Button>
      <ButtonBack
        type="button"
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
