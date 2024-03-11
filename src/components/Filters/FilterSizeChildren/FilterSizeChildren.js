import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
} from './FilterSizeChildren.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arraySizeChildrenProduct } from 'data';
import { MainFilterWrap } from '../filter.styled';
import CheckBox from 'components/CheckBox/CheckBox';

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
    <MainFilterWrap>
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
            {arraySizeChildrenProduct.map((childSize, index) => (
              <li key={index}>
                <Button
                  type="button"
                  onClick={() => {
                    const paramsChildSize =
                      searchParams.get('childSize')?.split(',') || [];

                    if (paramsChildSize?.includes(childSize)) {
                      const newParamsChildSize = paramsChildSize.filter(
                        param => param !== childSize
                      );
                      newParamsChildSize.length === 0
                        ? removeParam('childSize')
                        : newSetSearchParams(
                            'childSize',
                            newParamsChildSize.join(',')
                          );
                    } else {
                      paramsChildSize.push(childSize);
                      newSetSearchParams(
                        'childSize',
                        paramsChildSize.join(',')
                      );
                    }
                  }}
                >
                  <CheckBox
                    value={searchParams
                      .get('childSize')
                      ?.split(',')
                      ?.includes(childSize)}
                  />
                  {childSize} {t('cm')}
                </Button>
              </li>
            ))}
          </WrapButtons>
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterSizeChildren;
