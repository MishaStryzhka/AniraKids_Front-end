import Modal from 'components/Modals/Modal';
import ModalFilters from 'components/Modals/ModalFiltes/ModalFilters';
import { useState } from 'react';

const { default: IconCalendar } = require('images/icons/IconCalendar');
const { default: IconFilters } = require('images/icons/IconFilters');
const {
  ButtonFilters,
  ButtonCalendar,
  WrapMenu,
} = require('./IconsMenuForPages.styled');

const IconsMenuForPages = () => {
  const [isModal, setIsModal] = useState(false);

  const isOpenModal = () => {
    setIsModal(true);
  };

  const closeModal = () => {
    setIsModal(false);
  };
  return (
    <WrapMenu>
      <ButtonFilters type="button" onClick={isOpenModal}>
        <IconFilters />
      </ButtonFilters>
      {isModal && (
        <Modal
          onClick={() => {
            setIsModal(false);
          }}
        >
          <ModalFilters onClick={closeModal} />
        </Modal>
      )}
      <ButtonCalendar type="button">
        <IconCalendar />
      </ButtonCalendar>
    </WrapMenu>
  );
};

export default IconsMenuForPages;
