import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
import Calendar from './Calendar';
import {
  MenuDescription,
  MenuTitle,
  WrapCalendar,
} from './CalendarSelectDate.styled';
import { useTranslation } from 'react-i18next';
import SelectTypeRent from 'components/SelectTypeRent/SelectTypeRent';
import CalendarDescription from './components/CalendarDescription/CalendarDescription';

const CalendarSelectDate = ({
  rentalPeriods,
  setRentalPeriods,
  typeRent = 'celebration',
  setTypeRent,
  saveSelectedDate,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.calendar.selectDate',
  });

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
      <CalendarDescription typeRent={typeRent} />

      <MenuDescription>{t('menuDescription')}</MenuDescription>
      <ButtonAdd disabled={!rentalPeriods} onClick={() => saveSelectedDate()}>
        {t('buttonSaveChanges')}
      </ButtonAdd>
    </WrapCalendar>
  );
};

export default CalendarSelectDate;
