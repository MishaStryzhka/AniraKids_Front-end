import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import addMonths from 'date-fns/addMonths';
import { addDays, format, getMonth } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';
import cs from 'date-fns/locale/cs';
import uk from 'date-fns/locale/uk';
import { useTranslation } from 'react-i18next';
import './styled.css';
import IconArrow from 'images/icons/IconArrow';

// const range = (start, end, step) => {
//   const length = Math.floor(Math.abs((end - start) / step)) + 1;
//   return Array.from({ length }, (_, index) => start + index * step);
// };

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const Calendar = ({ rentalPeriods, setRentalPeriods }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.calendar',
  });

  // const [startDate, setStartDate] = useState(addDays(new Date(), 3));
  // const [endDate, setEndDate] = useState(addDays(new Date(), 13));
  // const years = range(getYear(new Date()), getYear(new Date()) + 5, 1);

  let startDate = null;
  let endDate = null;

  const rearrangedDateString = dateString => {
    const parts = dateString.split('.');
    return [parts[1], parts[0], parts[2]].join('.');
  };

  if (rentalPeriods && rentalPeriods.includes('-')) {
    const [startDateString, endDateString] = rentalPeriods.split('-');

    if (startDateString)
      startDate = new Date(rearrangedDateString(startDateString));
    if (endDateString !== 'null')
      endDate = new Date(rearrangedDateString(endDateString));
  } else if (rentalPeriods) {
    startDate = new Date(rearrangedDateString(rentalPeriods));
  }

  const onChange = dates => {
    const [start, end] = dates;

    if (end) {
      const newRentalPeriods = `${format(new Date(start), 'dd.MM.yyyy')}-${
        end ? format(new Date(end), 'dd.MM.yyyy') : null
      }`;

      setRentalPeriods(newRentalPeriods);
    } else {
      const newRentalPeriods = `${format(new Date(start), 'dd.MM.yyyy')}`;

      setRentalPeriods(newRentalPeriods);
    }
  };

  const dayClassName = date => {
    if (startDate && endDate) {
      if (date >= addDays(startDate, -2) && date <= addDays(startDate, -1)) {
        return 'highlight-start-date';
      }
      if (date >= addDays(endDate, 1) && date <= addDays(endDate, 1)) {
        return 'highlight-end-date';
      }
    }
    if (!endDate) {
      if (date >= addDays(startDate, -2) && date <= addDays(startDate, -1)) {
        return 'highlight-start-date';
      }
      if (date >= addDays(startDate, 1) && date <= addDays(startDate, 1)) {
        return 'highlight-end-date';
      }
      // if (date >= addDays(endDate, -2) && date <= addDays(endDate, 2)) {
      //   return 'highlight-end-date';
      // }
    }
    return '';
  };

  return (
    <DatePicker
      locale={i18n.language === 'en' ? enGB : i18n.language === 'cs' ? cs : uk}
      selected={startDate}
      onChange={onChange}
      minDate={new Date()}
      maxDate={addMonths(new Date(), 6)}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
      dayClassName={dayClassName}
      // showDisabledMonthNavigation
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="nav-bar">
          <button
            className="togle-month"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
          >
            <IconArrow
              style={{ transform: 'rotate(180deg)' }}
              fill={prevMonthButtonDisabled ? '#ccc' : '#000'}
            />
          </button>
          {/* <select
            value={getYear(date)}
            onChange={({ target: { value } }) => changeYear(value)}
          >
            {years.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select> */}

          <select
            className="select"
            value={months[getMonth(date)]}
            onChange={({ target: { value } }) =>
              changeMonth(months.indexOf(value))
            }
          >
            {months.map(option => (
              <option className="option" key={option} value={option}>
                {t(option)}
              </option>
            ))}
          </select>

          <button
            className="togle-month"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
          >
            <IconArrow fill={nextMonthButtonDisabled ? '#ccc' : '#000'} />
          </button>
        </div>
      )}
    />
  );
};

export default Calendar;
