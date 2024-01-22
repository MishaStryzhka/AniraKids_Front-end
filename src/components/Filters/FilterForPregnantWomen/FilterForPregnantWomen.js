import { arrayPregnancyProduct } from 'helpers';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterForPregnantWomen.styled';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FilterForPregnantWomen = () => {
  const [isPregnancyList, setIsPregnancyList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterForPregnantWomen',
  });

  const handleToggleList = () => {
    setIsPregnancyList(prevIsPregnancyList => !prevIsPregnancyList);
  };

  return (
    <MainItem>
      <Wrap $openPregnancyList={isPregnancyList === true}>
        <FilterTitle>{t('For pregnant women')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openPregnancyList={isPregnancyList === true}
        />
      </Wrap>
      {isPregnancyList && (
        <List>
          {arrayPregnancyProduct.map(({ isPregnancy, valueVariant }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Pregnancy: valueVariant });
                }}
              >
                {isPregnancy}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterForPregnantWomen;
