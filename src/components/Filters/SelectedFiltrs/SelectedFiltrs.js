import { useSearchParams } from 'react-router-dom';
import { SelectedFiltr, StyledSelectedFiltrs } from './SelectedFiltrs.styled';
import { useTranslation } from 'react-i18next';

const SelectedFiltrs = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.selectedFiltrs',
  });

  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const filtrs = Array.from(searchParams.entries());
  console.log('filtrs', filtrs);

  const removeParam = param => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.delete(param);
      return params;
    });
  };

  return (
    <StyledSelectedFiltrs>
      {filtrs.map(([key, value]) => {
        if (key === 'price') {
          const price = value.split('-');
          return (
            <SelectedFiltr>
              <p>{`${price[0]}Kč - ${price[1]}Kč`}</p>
              <button onClick={() => removeParam(key)}>X</button>
            </SelectedFiltr>
          );
        } else if (key === 'size') {
          return (
            <SelectedFiltr>
              <p>{`${t('Size')}: ${value}`}</p>
              <button onClick={() => removeParam(key)}>X</button>
            </SelectedFiltr>
          );
        } else if (key === 'rentalPeriods') {
          return (
            <SelectedFiltr>
              <p>{value}</p>
              <button onClick={() => removeParam(key)}>X</button>
            </SelectedFiltr>
          );
        } else {
          return (
            <SelectedFiltr>
              <p>{t(value)}</p>
              <button onClick={() => removeParam(key)}>X</button>
            </SelectedFiltr>
          );
        }
      })}
    </StyledSelectedFiltrs>
  );
};

export default SelectedFiltrs;
