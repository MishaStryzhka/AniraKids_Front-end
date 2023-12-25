import FilterFamilyLook from 'components/Filters/FilterFamilyLook/FilterFamilyLook';
import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
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
