import Calendar from 'components/Calendar/Calendar';
import Modal from 'components/Modals/Modal';
import ModalFilters from 'components/Modals/ModalFiltes/ModalFilters';
import { useEffect, useRef, useState } from 'react';

const { default: IconCalendar } = require('images/icons/IconCalendar');
const { default: IconFilters } = require('images/icons/IconFilters');
const {
  ButtonFilters,
  ButtonCalendar,
  WrapMenu,
  MenuCalendar,
} = require('./IconsMenuForPages.styled');

const IconsMenuForPages = () => {
  const [isOpenModalFilters, setIsOpenModalFilters] = useState(false);
  const [isOpenModalCalendar, setIsOpenModalCalendar] = useState(false);

  const menuRef = useRef(null);

  console.log('menuRef', menuRef);

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenModalCalendar(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpenModalCalendar]);

  return (
    <WrapMenu>
      <ButtonFilters type="button" onClick={() => setIsOpenModalFilters(true)}>
        <IconFilters />
      </ButtonFilters>
      <ButtonCalendar
        type="button"
        onClick={e => {
          e.stopPropagation();
          setIsOpenModalCalendar(true);
        }}
      >
        <IconCalendar />
      </ButtonCalendar>
      {isOpenModalFilters && (
        <Modal
          onClick={() => {
            setIsOpenModalFilters(false);
          }}
        >
          <ModalFilters onClick={() => setIsOpenModalFilters(false)} />
        </Modal>
      )}
      {isOpenModalCalendar && (
        <MenuCalendar
          ref={menuRef}
          style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}
        >
          <div>
            <p>Календар оренди</p>
            <button onClick={() => setIsOpenModalCalendar(false)}>X</button>
          </div>
          <Calendar />
          <p>Вкажіть дату початку та кінця оренди</p>
          <button>ЗБЕРЕГТИ ЗМІНИ</button>
        </MenuCalendar>
      )}
    </WrapMenu>
  );
};

export default IconsMenuForPages;
