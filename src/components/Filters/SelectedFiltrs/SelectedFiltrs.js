import { useSearchParams } from 'react-router-dom';
import {
  CloseButton,
  SelectedFiltr,
  StyledSelectedFiltrs,
} from './SelectedFiltrs.styled';
import { useTranslation } from 'react-i18next';
import IconCross from 'images/icons/IconCross';

const SelectedFiltrs = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.selectedFiltrs',
  });

  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const filtrs = Array.from(searchParams.entries());

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
  };

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
        if (key === 'age' || key === 'childSize') {
          const array = value.split(',');
          return array.map((el, index) => (
            <SelectedFiltr>
              <p>
                {key === 'age'
                  ? t(el, {
                      keyPrefix: 'data.arrayAgeProduct',
                    })
                  : key === 'childSize' &&
                    `${el} ${t('cm', {
                      keyPrefix: 'data.dataChildSize',
                    })}`}
                {}
              </p>
              <CloseButton
                onClick={() => {
                  array.splice(index, 1);
                  array.join(',').length > 0
                    ? newSetSearchParams(key, array.join(','))
                    : removeParam(key);
                }}
              >
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          ));
        } else if (key === 'price') {
          const price = value.split('-');
          return (
            <SelectedFiltr>
              <p>{`${price[0]}Kč - ${price[1]}Kč`}</p>
              <CloseButton onClick={() => removeParam(key)}>
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          );
        } else if (key === 'size') {
          return (
            <SelectedFiltr>
              <p>{`${t('Size')}: ${value}`}</p>
              <CloseButton onClick={() => removeParam(key)}>
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          );
        } else if (key === 'rentalPeriods') {
          return (
            <SelectedFiltr>
              <p>{value}</p>
              <CloseButton onClick={() => removeParam(key)}>
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          );
        } else if (key === 'color') {
          const colors = value.split(',');

          console.log('colors', colors);

          return colors.map((color, index) => (
            <SelectedFiltr>
              <p>{t(color)}</p>
              <CloseButton
                onClick={() => {
                  colors.splice(index, 1);
                  colors.join(',').length > 0
                    ? newSetSearchParams('color', colors.join(','))
                    : removeParam(key);
                }}
              >
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          ));
        } else {
          return (
            <SelectedFiltr>
              <p>{t(value)}</p>
              <CloseButton onClick={() => removeParam(key)}>
                <IconCross />
              </CloseButton>
            </SelectedFiltr>
          );
        }
      })}
    </StyledSelectedFiltrs>
  );
};

export default SelectedFiltrs;
