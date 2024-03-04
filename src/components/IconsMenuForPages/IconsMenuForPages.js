import FilteDate from 'components/Filters/FilterDate/FilterDate';
import Modal from 'components/Modals/Modal';
import ModalFilters from 'components/Modals/ModalFiltes/ModalFilters';
import { useState } from 'react';

const { default: IconFilters } = require('images/icons/IconFilters');
const { ButtonFilters, WrapMenu } = require('./IconsMenuForPages.styled');

const IconsMenuForPages = () => {
  const [isOpenModalFilters, setIsOpenModalFilters] = useState(false);

  return (
    <WrapMenu>
      <ButtonFilters type="button" onClick={() => setIsOpenModalFilters(true)}>
        <IconFilters />
      </ButtonFilters>
      <FilteDate />

      {isOpenModalFilters && (
        <Modal
          onClick={() => {
            setIsOpenModalFilters(false);
          }}
        >
          <ModalFilters onClick={() => setIsOpenModalFilters(false)} />
        </Modal>
      )}
    </WrapMenu>
  );
};

export default IconsMenuForPages;
