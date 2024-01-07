import Button from 'components/Button/Button';
import {
  ButtonBack,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalLogOut.styled';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../redux/auth/operations';
// import { logOut } from 'redux/auth/operations';

const ModalLogOut = ({ isCloseModal }) => {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(logOut());
  };

  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          isCloseModal();
        }}
      />
      <ModalTitle>Ви дійсно бажаєте вийти?</ModalTitle>

      <Button type="button" onClick={() => handleSignOut()}>
        Так, вийти
      </Button>
      <ButtonBack
        type="button"
        onClick={() => {
          isCloseModal();
        }}
      >
        Назад
      </ButtonBack>
    </ModalWindow>
  );
};

export default ModalLogOut;
