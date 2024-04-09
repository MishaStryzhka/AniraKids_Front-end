import IconHeart from 'images/icons/IconHeart';
import IconBag from '../../images/icons/IconBag';
import IconPerson from '../../images/icons/IconPerson';
import { Box, Button } from './BoxNavigation.styled';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { useContext, useEffect } from 'react';
import Modal from 'components/Modals/Modal';
import { useNavigate } from 'react-router-dom';
import ModalRegister from 'components/Modals/ModalRegister/ModalRegister';
import { ModalAuthContext } from 'components/App';

const BoxNavigation = ({ onClick, $mainPage }) => {
  const { isOpenModalAuth, setIsOpenModalAuth } = useContext(ModalAuthContext);
  const { user, currentTheme } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    isOpenModalAuth &&
      user &&
      navigate('/my-account/profile', { replace: true });
    isOpenModalAuth && user && setIsOpenModalAuth(false);
  }, [isOpenModalAuth, user, navigate, setIsOpenModalAuth]);

  const onClickAuth = () => {
    if (user) {
      document.body.style.overflowY = 'auto';
      navigate('/my-account/profile', { replace: true });
    } else {
      setIsOpenModalAuth(true);
    }
    user && onClick && onClick();
  };
  return (
    <Box>
      <Button
        type="button"
        onClick={() => {
          onClick && onClick();
          document.body.style.overflowY = 'auto';
          navigate('/my-account/favorite', { replace: true });
        }}
      >
        <IconHeart
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>
      <Button type="button" onClick={onClickAuth}>
        <IconPerson
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>

      <Button
        type="button"
        onClick={() => {
          onClick && onClick();
          document.body.style.overflowY = 'auto';
          navigate('/my-account/cart', { replace: true });
        }}
      >
        <IconBag
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>
      {isOpenModalAuth && !user && (
        <Modal
          closeModal={() => {
            setIsOpenModalAuth(false);
          }}
        >
          <ModalRegister handleCloseModal={() => setIsOpenModalAuth(false)} />
        </Modal>
      )}
    </Box>
  );
};
export default BoxNavigation;
