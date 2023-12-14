import { useState } from 'react';
import IconBag from '../../images/icons/IconBag';
import IconHeart from '../../images/icons/IconHeart';
import IconPerson from '../../images/icons/IconPerson';
import { Box } from './BoxNavigation.styled';
import Modal from 'components/Modals/Modal';
import ModalAuthorization from 'components/Modals/ModalAuthorization/ModalAuthorization';

const BoxNavigation = () => {
  const [isOpenModalAuthorization, setIsOpenModalAuthorization] =
    useState(false);
  return (
    <>
      <Box>
        <IconHeart />
        <button
          onClick={() => {
            setIsOpenModalAuthorization(true);
          }}
        >
          <IconPerson />
        </button>

        <IconBag />
      </Box>
      {isOpenModalAuthorization && (
        <Modal
          onClick={() => {
            setIsOpenModalAuthorization(false);
          }}
        >
          <ModalAuthorization />
        </Modal>
      )}
    </>
  );
};
export default BoxNavigation;
