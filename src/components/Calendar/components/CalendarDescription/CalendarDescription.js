import { useTranslation } from 'react-i18next';
import {
  ItemInfo,
  ListInfo,
  MarkerDelivery,
  MarkerRent,
  MarkerReturn,
} from './CalendarDescription.styled';

const CalendarDescription = ({ typeRent }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.calendar.selectDate',
  });

  return (
    <ListInfo>
      <ItemInfo>
        {typeRent === 'celebration' ? (
          <>
            <MarkerDelivery /> <p>{t('daysDelivery')}</p>
          </>
        ) : (
          <>
            <MarkerRent />
            <p>{t('self_pickup')}</p>
          </>
        )}
        <br />
      </ItemInfo>
      <ItemInfo>
        <MarkerRent />{' '}
        <p>
          {t('rental')}
          {typeRent !== 'celebration' && ` ${t('up_to_6_hours')}`}
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
            <p>!!!{t('return_within_6_hours')}!!!</p>
          </>
        )}
        <br />
      </ItemInfo>
    </ListInfo>
  );
};

export default CalendarDescription;
