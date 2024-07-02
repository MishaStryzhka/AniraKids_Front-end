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
          {typeRent !== 'celebration' && ` ${t('min_5_hours')}`}
        </p>{' '}
        <br />
      </ItemInfo>
      <ItemInfo>
        {typeRent === 'celebration' ? (
          <>
            <MarkerReturn />
            <p>{t('returnDay')}</p>
          </>
        ) : null}
        <br />
      </ItemInfo>
    </ListInfo>
  );
};

export default CalendarDescription;
