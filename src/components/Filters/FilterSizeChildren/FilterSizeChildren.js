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
import { arraySizeChildrenProduct } from 'helpers';
import { useTranslation } from 'react-i18next';

const FilterSizeChildren = () => {
  const [isSizeChildrenList, setIsSizeChildrenList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSizeChildren',
  });

  const handleToggleList = () => {
    setIsSizeChildrenList(prevIsSizeChildrenList => !prevIsSizeChildrenList);
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
              ({ descriptionSize, valueSize }, index) => (
                <li key={index}>
                  <Button
                    type="button"
                    onClick={() => {
                      setSearchParams({ size: valueSize });
                    }}
                  >
                    {descriptionSize} см
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
