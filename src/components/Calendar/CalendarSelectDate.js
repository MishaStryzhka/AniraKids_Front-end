import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
import Calendar from './Calendar';
import {
  ItemInfo,
  ListInfo,
  MarkerDelivery,
  MarkerRent,
  MarkerReturn,
  MenuDescription,
  MenuTitle,
  WrapCalendar,
} from './CalendarSelectDate.styled';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import SelectTypeRent from 'components/SelectTypeRent/SelectTypeRent';

const CalendarSelectDate = ({
  rentalPeriods,
  setRentalPeriods,
  saveSelectedDate,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.calendar.selectDate',
  });

  const [typeRent, setTypeRent] = useState('celebration');

  console.log('typeRent', typeRent);
  console.log("typeRent === 'celebration'", typeRent === 'celebration');

  return (
    <WrapCalendar>
      <MenuTitle>{t('menuTitle')}</MenuTitle>

      <SelectTypeRent
        setTypeRent={e => {
          setTypeRent(e);
          setRentalPeriods(null);
        }}
        typeRent={typeRent}
      />
      <Calendar
        selectsRange={typeRent === 'celebration'}
        rentalPeriods={rentalPeriods}
        setRentalPeriods={rentalPeriods => setRentalPeriods(rentalPeriods)}
      />
      <ListInfo>
        <ItemInfo>
          {typeRent === 'celebration' ? (
            <>
              <MarkerDelivery /> <p>{t('daysDelivery')}</p>
            </>
          ) : (
            <>
              <MarkerRent />
              <p>самовивіз</p>
            </>
          )}
          <br />
        </ItemInfo>
        <ItemInfo>
          <MarkerRent />{' '}
          <p>
            {t('rental')}
            {typeRent !== 'celebration' && ' на 6 годин'}
          </p>{' '}
          <br />
        </ItemInfo>
        <ItemInfo>
          {typeRent === 'celebration' ? (
            <>
              <MarkerReturn />
              <p>{t('returnDay')}</p>
            </>
          ) : (
            <>
              <MarkerRent />
              <p>!!!повернення до 6 годин!!!</p>
            </>
          )}
          <br />
        </ItemInfo>
      </ListInfo>
      <MenuDescription>{t('menuDescription')}</MenuDescription>
      <ButtonAdd disabled={!rentalPeriods} onClick={() => saveSelectedDate()}>
        {t('buttonSaveChanges')}
      </ButtonAdd>
    </WrapCalendar>
  );
};

export default CalendarSelectDate;
