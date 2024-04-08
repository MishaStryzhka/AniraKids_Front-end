import { useTranslation } from 'react-i18next';
import {
  RadioInput,
  RadioLabel,
  StyledSelectTypeRent,
} from './SelectTypeRent.styled';

const SelectTypeRent = ({ typeRent = 'celebration', setTypeRent }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.selectTypeRent',
  });

  return (
    <StyledSelectTypeRent>
      <RadioLabel>
        <RadioInput
          type="radio"
          name="typeRent"
          value="celebration"
          checked={typeRent === 'celebration'}
          onChange={e => setTypeRent(e.currentTarget.value)}
        />
        {t('celebration')}
      </RadioLabel>
      <RadioLabel>
        <RadioInput
          type="radio"
          name="typeRent"
          value="photosession"
          checked={typeRent === 'photosession'}
          onChange={e => setTypeRent(e.currentTarget.value)}
        />
        {t('photosession')}
      </RadioLabel>
    </StyledSelectTypeRent>
  );
};

export default SelectTypeRent;
