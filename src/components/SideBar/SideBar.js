import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterFamilyLook from 'components/Filters/FilterFamilyLook/FilterFamilyLook';
import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import FilterOutfits from 'components/Filters/FilterOutfits/FilterOutfits';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import FilterSubject from 'components/Filters/FilterSubject/FilterSubject';
import { useLocation } from 'react-router-dom';

const SideBar = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  console.log('location', location);

  return (
    <>
      <title>ФІЛЬТРИ</title>
      <FilterForPregnantWomen />
      <FilterFamilyLook />
      <FilterPrice />
      <FilterSizeAdult />
      <FilterSizeChildren />
      <FilterAge />
      <FilterDecor />
      <FilterColor />
      <FilterOutfits />
      <FilterSubject />
      {/* <div>
        <p>ДЛЯ ВАГІТНИХ</p>
        <button
          onClick={() => {
            setSearchParams({ forPregnantWomen: true });
          }}
        >
          Так
        </button>
        <button
          onClick={() => {
            setSearchParams({ forPregnantWomen: false });
          }}
        >
          Ні
        </button>
      </div> */}
    </>
  );
};

export default SideBar;
