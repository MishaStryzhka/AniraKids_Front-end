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

const CalendarSelectDate = ({
  rentalPeriods,
  setRentalPeriods,
  saveSelectedDate,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.calendar.selectDate',
  });

  return (
    <WrapCalendar>
      <MenuTitle>{t('menuTitle')}</MenuTitle>
      <Calendar
        rentalPeriods={rentalPeriods}
        setRentalPeriods={rentalPeriods => setRentalPeriods(rentalPeriods)}
      />
      <ListInfo>
        <ItemInfo>
          <MarkerDelivery /> <p>{t('daysDelivery')}</p> <br />
        </ItemInfo>
        <ItemInfo>
          <MarkerRent /> <p>{t('rental')}</p> <br />
        </ItemInfo>
        <ItemInfo>
          <MarkerReturn />
          <p>{t('returnDay')}</p> <br />
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
