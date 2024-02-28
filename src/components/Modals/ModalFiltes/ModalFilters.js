import { useTranslation } from 'react-i18next';
import { ModalTitle, ModalWindow } from './ModalFilters.styled';
import FilterType from 'components/Filters/FilterType/FilterType';
import { useLocation } from 'react-router-dom';
import FilterFamilyLookWomen from 'components/Filters/FilterFamilyLook/FilterFamilyLookWomen';
import FilterFamilyLookMen from 'components/Filters/FilterFamilyLook/FilterFamilyLookMen';
import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterSubject from 'components/Filters/FilterSubject/FilterSubject';
import FilterOutfits from 'components/Filters/FilterOutfits/FilterOutfits';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterOfToys from 'components/Filters/FilterToys/FilterToys';
import Button from 'components/Button/Button';

const ModalFilters = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalFilters',
  });
  const { pathname } = useLocation();
  console.log(t);
  return (
    <ModalWindow>
      <ModalTitle>{t('filters')}</ModalTitle>
      <FilterType />
      {pathname === '/forWomen' && <FilterForPregnantWomen />}
      {pathname === '/forWomen' && <FilterFamilyLookWomen />}
      {pathname === '/forMen' && <FilterFamilyLookMen />}
      {pathname === '/forChildren' && <FilterSubject />}
      {pathname === '/forChildren' && <FilterOutfits />}
      {pathname === '/forChildren' && <FilterAge />}
      {pathname === '/decorAndToys' && <FilterDecor />}
      {pathname === '/decorAndToys' && <FilterOfToys />}
      <FilterPrice />
      <FilterColor />
      {pathname === '/forWomen' && <FilterSizeAdult />}
      {pathname === '/forMen' && <FilterSizeAdult />}
      {pathname === '/forChildren' && <FilterSizeChildren />}
      <Button
        type="submit"
        onClick={() => {
          onClick();
        }}
      >
        {t('saveButton')}
      </Button>
    </ModalWindow>
  );
};
export default ModalFilters;
