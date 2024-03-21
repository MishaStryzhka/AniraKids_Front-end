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

const CalendarSelectDate = ({
  rentalPeriods,
  setRentalPeriods,
  saveSelectedDate,
}) => {
  return (
    <WrapCalendar>
      <MenuTitle>Календар оренди</MenuTitle>
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
      <ButtonAdd disabled={!rentalPeriods} onClick={() => saveSelectedDate()}>
        ЗБЕРЕГТИ ЗМІНИ
      </ButtonAdd>
    </WrapCalendar>
  );
};

export default CalendarSelectDate;
