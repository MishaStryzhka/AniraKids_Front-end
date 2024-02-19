import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
} from './FilterSizeAdult.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arraySizeAdult } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterSizeAdult = () => {
  const [isSizeAdultList, setIsSizeAdultList] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSizeAdult',
  });

  const handleToggleList = () => {
    setIsSizeAdultList(prevIsSizeAdultList => !prevIsSizeAdultList);
  };

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
  };
  return (
    <MainFilterWrap>
      <Wrap $openSizeList={isSizeAdultList === true}>
        <FilterTitle>{t('Size')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSizeList={isSizeAdultList === true}
        />
      </Wrap>
      {isSizeAdultList && (
        <List>
          <WrapButtons>
            {arraySizeAdult.map(({ descriptionSize, searchSize }, index) => (
              <li key={index}>
                <Button
                  onClick={() => {
                    newSetSearchParams('size', searchSize);
                  }}
                >
                  {descriptionSize}
                </Button>
              </li>
            ))}
          </WrapButtons>
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterSizeAdult;
