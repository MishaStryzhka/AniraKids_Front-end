import IconCalendar from 'images/icons/IconCalendar';
import {
  ButtonCalendar,
  ItemInfo,
  ListInfo,
  MarkerDelivery,
  MarkerRent,
  MarkerReturn,
  MenuButtonClose,
  MenuCalendar,
  MenuDescription,
  MenuHeader,
  MenuTitle,
} from './FilteDate.styled';
import Calendar from 'components/Calendar/Calendar';
import { useSearchParams } from 'react-router-dom';
import IconClose from 'images/icons/IconClose';
import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';

const { useState, useRef, useEffect } = require('react');

const FilteDate = () => {
  const [isOpenModalCalendar, setIsOpenModalCalendar] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const menuRef = useRef(null);
  const [rentalPeriods, setRentalPeriods] = useState(
    searchParams.get('rentalPeriods') || null
  );

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
  };

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

  const setFilterDate = () => {
    newSetSearchParams('rentalPeriods', rentalPeriods);
    setIsOpenModalCalendar(false);
  };

  return (
    <>
      <ButtonCalendar
        type="button"
        onClick={e => {
          e.stopPropagation();
          setIsOpenModalCalendar(true);
        }}
      >
        <IconCalendar />
      </ButtonCalendar>
      {isOpenModalCalendar && (
        <MenuCalendar
          ref={menuRef}
          style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}
        >
          <MenuHeader>
            <MenuTitle>Календар оренди</MenuTitle>
            <MenuButtonClose onClick={() => setIsOpenModalCalendar(false)}>
              <IconClose width={24} height={24} />
            </MenuButtonClose>
          </MenuHeader>
          <Calendar
            rentalPeriods={rentalPeriods}
            setRentalPeriods={rentalPeriods => setRentalPeriods(rentalPeriods)}
          />
          <ListInfo>
            <ItemInfo>
              <MarkerDelivery /> <p>дні доставки</p> <br />
            </ItemInfo>
            <ItemInfo>
              <MarkerRent /> <p>оренда</p> <br />
            </ItemInfo>
            <ItemInfo>
              <MarkerReturn />
              <p>день повернення</p> <br />
            </ItemInfo>
          </ListInfo>
          <MenuDescription>
            Виберіть день оренди <br />
            (або дату початку та кінця оренди)
          </MenuDescription>
          <ButtonAdd disabled={!rentalPeriods} onClick={() => setFilterDate()}>
            ЗБЕРЕГТИ ЗМІНИ
          </ButtonAdd>
        </MenuCalendar>
      )}
    </>
  );
};

export default FilteDate;
