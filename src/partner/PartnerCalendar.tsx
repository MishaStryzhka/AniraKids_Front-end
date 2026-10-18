import styled from 'styled-components';
import { Button } from '../design-system/components/Button';
import { designTokens as t } from '../design-system/tokens/designTokens';
import {
  formatCalendarDay,
  formatCalendarMonth,
  monthCalendarGridDays,
  pragueToday,
} from '../admin/calendar/calendarDates';
import {
  rentalsOnDay,
  fittingsOnDay,
  CalendarRental,
  CalendarFitting,
} from './partnerCalendarModel';

const Calendar = styled.section`
  display: grid;
  gap: ${t.space[3]};
  min-width: 0;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: ${t.space[2]};
  @media (max-width: 767px) {
    gap: 4px;
  }
`;
const Weekday = styled.span`
  text-align: center;
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodySm.size};
`;
const Day = styled(Button)`
  padding: ${t.space[2]};
  min-height: 104px;
  align-items: flex-start;
  justify-content: flex-start;
  > span {
    display: grid;
    gap: 4px;
    text-align: left;
    width: 100%;
  }
  &[aria-current='date'] {
    box-shadow: inset 0 0 0 1px ${t.color.focus.ring};
  }
  @media (max-width: 1023px) {
    padding: 4px 2px;
    min-height: 90px;
    > span {
      text-align: center;
    }
  }
`;
const Count = styled.span`
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  font-weight: 400;
  .short {
    display: none;
  }
  @media (max-width: 1023px) {
    .long {
      display: none;
    }
    .short {
      display: inline;
    }
  }
`;
const Legend = styled.p`
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodySm.size};
`;
export function PartnerCalendar({
  month,
  selectedDay,
  onSelectDay,
  rentals,
  fittings,
}: {
  month: string;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  rentals: CalendarRental[];
  fittings: CalendarFitting[];
}) {
  const today = pragueToday();
  return (
    <Calendar aria-labelledby="partner-calendar-title">
      <h2 id="partner-calendar-title">{formatCalendarMonth(month)}</h2>
      <Grid aria-hidden="true">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
          <Weekday key={day}>{day}</Weekday>
        ))}
      </Grid>
      <Grid>
        {monthCalendarGridDays(month).map((day, index) => {
          if (!day) return <span key={index} />;
          const adjacent = !day.startsWith(month + '-');
          const rentalCount = adjacent ? 0 : rentalsOnDay(rentals, day).length;
          const fittingCount = adjacent
            ? 0
            : fittingsOnDay(fittings, day).length;
          return (
            <Day
              key={day}
              size="compact"
              disabled={adjacent}
              variant={day === selectedDay ? 'primary' : 'secondary'}
              aria-pressed={day === selectedDay}
              aria-current={day === today ? 'date' : undefined}
              aria-label={`${formatCalendarDay(day, true)}. ${adjacent ? 'Mimo zobrazený měsíc.' : `Zkoušky: ${fittingCount}. Pronájmy: ${rentalCount}.`}`}
              data-calendar-day={adjacent ? undefined : day}
              onClick={() => onSelectDay(day)}
            >
              <strong>{Number(day.slice(-2))}</strong>
              {!adjacent ? (
                <>
                  <Count>
                    <span className="long">Zkoušky</span>
                    <span className="short">Zk.</span>: {fittingCount}
                  </Count>
                  <Count>
                    <span className="long">Pronájmy</span>
                    <span className="short">Pr.</span>: {rentalCount}
                  </Count>
                </>
              ) : null}
            </Day>
          );
        })}
      </Grid>
      <Legend>
        Zk. = zkoušky · Pr. = pronájmy. Zrušené a propadlé rezervace se
        nezapočítávají.
      </Legend>
    </Calendar>
  );
}
