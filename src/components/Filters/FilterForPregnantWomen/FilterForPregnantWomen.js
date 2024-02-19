import {
  Button,
  FilterTitle,
  StyledIconArrowUp,
  Wrap,
} from './FilterForPregnantWomen.styled';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from 'components/Forms/FormAddProduct/FormAddProduct.styled';
import IconCheck from 'images/icons/IconCheck';
import { MainFilterWrap } from '../filter.styled';

const FilterForPregnantWomen = () => {
  const [isPregnancyList, setIsPregnancyList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isPregnancy = searchParams.get('isPregnancy');

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterForPregnantWomen',
  });

  const handleToggleList = () => {
    setIsPregnancyList(prevIsPregnancyList => !prevIsPregnancyList);
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
      <Wrap $openPregnancyList={isPregnancyList === true}>
        <FilterTitle>{t('For pregnant women')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openPregnancyList={isPregnancyList === true}
        />
      </Wrap>
      {isPregnancyList && (
        <Button
          type="button"
          onClick={() => {
            isPregnancy
              ? removeParam('isPregnancy')
              : newSetSearchParams('isPregnancy', isPregnancy !== 'true');
          }}
        >
          <Box>
            {isPregnancy === 'true' && <IconCheck width={16} height={16} />}
          </Box>
          {t('true')}
        </Button>
      )}
    </MainFilterWrap>
  );
};

export default FilterForPregnantWomen;
