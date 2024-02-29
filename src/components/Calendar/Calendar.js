import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import addMonths from 'date-fns/addMonths';
import { addDays, getMonth } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';
import uk from 'date-fns/locale/uk';
import { useTranslation } from 'react-i18next';

// const range = (start, end, step) => {
//   const length = Math.floor(Math.abs((end - start) / step)) + 1;
//   return Array.from({ length }, (_, index) => start + index * step);
// };

const Calendar = () => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.calendar',
  });

  console.log('t', i18n.language);

  const [startDate, setStartDate] = useState(addDays(new Date(), 3));
  const [endDate, setEndDate] = useState(addDays(new Date(), 13));
  // const years = range(getYear(new Date()), getYear(new Date()) + 5, 1);
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

  const onChange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DatePicker
      locale={uk}
      selected={startDate}
      onChange={onChange}
      minDate={new Date()}
      maxDate={addMonths(new Date(), 6)}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
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
        <div
          style={{
            margin: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
            {'<'}
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
            value={months[getMonth(date)]}
            onChange={({ target: { value } }) =>
              changeMonth(months.indexOf(value))
            }
          >
            {months.map(option => (
              <option key={option} value={option}>
                {t(option)}
              </option>
            ))}
          </select>

          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            {'>'}
          </button>
        </div>
      )}
    />
  );
};

export default Calendar;
