import IconHeart from 'images/icons/IconHeart';
import IconBag from '../../images/icons/IconBag';
import IconPerson from '../../images/icons/IconPerson';
import { Box, Button } from './BoxNavigation.styled';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { useEffect, useState } from 'react';
import ModalRegistration from 'components/Modals/ModalRegistration/ModalRegistration';
import Modal from 'components/Modals/Modal';
import { useNavigate } from 'react-router-dom';

const BoxNavigation = ({ $mainPage }) => {
  const [isModal, setIsModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    isModal && user && navigate('/my-account/profile', { replace: true });
    isModal && user && setIsModal(false);
  }, [isModal, user, navigate]);

  const isOpenModal = () => {
    user
      ? navigate('/my-account/profile', { replace: true })
      : setIsModal(true);
  };

  const isCloseModal = () => {
    setIsModal(false);
  };
  const { currentTheme } = useAuth();
  return (
    <Box>
      <Button
        type="button"
        onClick={() => navigate('/my-account/favorite', { replace: true })}
      >
        <IconHeart
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>
      <Button type="button" onClick={isOpenModal}>
        <IconPerson
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>
      {isModal && !user && (
        <Modal onClick={isCloseModal}>
          <ModalRegistration />
        </Modal>
      )}
      <Button
        type="button"
        onClick={() => navigate('/my-account/order1', { replace: true })}
      >
        <IconBag
          stroke={
            $mainPage
              ? theme[currentTheme].color.mainColor1
              : theme[currentTheme].color.mainColor5
          }
        />
      </Button>
    </Box>
  );
};
export default BoxNavigation;
