import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
} from './FilterSizeChildren.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arraySizeChildrenProduct } from 'data';

const FilterSizeChildren = () => {
  const [isSizeChildrenList, setIsSizeChildrenList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  false && console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSizeChildren',
  });

  const handleToggleList = () => {
    setIsSizeChildrenList(prevIsSizeChildrenList => !prevIsSizeChildrenList);
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
    <MainItem>
      <Wrap $openSizeChildrenList={isSizeChildrenList === true}>
        <FilterTitle>{t('Size')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSizeChildrenList={isSizeChildrenList === true}
        />
      </Wrap>
      {isSizeChildrenList && (
        <List>
          <WrapButtons>
            {arraySizeChildrenProduct.map(
              ({ descriptionSize, childSize }, index) => (
                <li key={index}>
                  <Button
                    type="button"
                    onClick={() => {
                      childSize === searchParams.get('childSize')
                        ? removeParam('childSize')
                        : newSetSearchParams('childSize', childSize);
                    }}
                  >
                    {descriptionSize} {t('cm')}
                  </Button>
                </li>
              )
            )}
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeChildren;
