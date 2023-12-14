import IconHeart from 'images/icons/IconHeart';
import IconBag from '../../images/icons/IconBag';
import IconPerson from '../../images/icons/IconPerson';
import { Box, Button } from './BoxNavigation.styled';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { useState } from 'react';
import ModalRegistration from 'components/Modal/ModalRegistration/ModalRegistration';
import Modal from 'components/Modals/Modal';

const BoxNavigation = ({ $mainPage }) => {
  const [isModal, setIsModal] = useState(false);

  const isOpenModal = () => {
    setIsModal(true);
  };

  const isCloseModal = () => {
    setIsModal(false);
  };
  const { currentTheme } = useAuth();
  return (
    <Box>
      <Button type="button">
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
      {isModal && (
        <Modal onClick={isCloseModal}>
          <ModalRegistration />
        </Modal>
      )}

      <Button type="button">
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
