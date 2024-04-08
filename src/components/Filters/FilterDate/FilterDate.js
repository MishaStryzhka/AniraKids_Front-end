import IconCalendar from 'images/icons/IconCalendar';
import {
  ButtonCalendar,
  MenuButtonClose,
  MenuCalendar,
} from './FilterDate.styled';
import { useSearchParams } from 'react-router-dom';
import IconClose from 'images/icons/IconClose';
import CalendarSelectDate from 'components/Calendar/CalendarSelectDate';
import { useStorage } from 'hooks';
const { useState, useRef, useEffect } = require('react');

const FilterDate = () => {
  const [isOpenModalCalendar, setIsOpenModalCalendar] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const menuRef = useRef(null);
  const [rentalPeriods, setRentalPeriods] = useState(
    searchParams.get('rentalPeriods') || null
  );

  const sessionStorage = useStorage('typeRent', 'session');
  const [typeRent, setTypeRent] = useState(
    sessionStorage.get('typeRent') || 'celebration'
  ); // 'celebration' , 'photosession'

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
          <MenuButtonClose onClick={() => setIsOpenModalCalendar(false)}>
            <IconClose width={24} height={24} />
          </MenuButtonClose>
          <CalendarSelectDate
            rentalPeriods={rentalPeriods}
            setRentalPeriods={setRentalPeriods}
            typeRent={typeRent}
            setTypeRent={typeRent => {
              sessionStorage.set('typeRent', typeRent);
              setTypeRent(typeRent);
            }}
            saveSelectedDate={() => setFilterDate()}
          />
        </MenuCalendar>
      )}
    </>
  );
};

export default FilterDate;
