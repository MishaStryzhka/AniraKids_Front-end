import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
} from './FilterOutfits.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arrayOfOutfits } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterOutfits = () => {
  const [isFilterOutfitsList, setIsFilterOutfitsList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  false && console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterOutfits',
  });

  const handleToggleList = () => {
    setIsFilterOutfitsList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
  };

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
    <MainFilterWrap>
      <Wrap $openOutfitsList={isFilterOutfitsList === true}>
        <FilterTitle>{t('Outfits')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterOutfitsList === true}
        />
      </Wrap>
      {isFilterOutfitsList && (
        <List>
          {arrayOfOutfits.map((outfits, index) => (
            <li key={index}>
              <Button
                type="button"
                // onClick={() => {
                //   newSetSearchParams('outfits', outfits);
                // }}
                onClick={() => {
                  outfits === searchParams.get('outfits')
                    ? removeParam('outfits')
                    : newSetSearchParams('outfits', outfits);
                }}
              >
                {t(outfits)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterOutfits;
