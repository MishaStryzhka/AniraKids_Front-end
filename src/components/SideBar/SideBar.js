import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import { useLocation, useSearchParams } from 'react-router-dom';

const SideBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  console.log('location', location);
  console.log('searchParams', searchParams);

  return (
    <>
      <title>ФІЛЬТРИ</title>
      <FilterForPregnantWomen />
      <div>
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
      </div>
    </>
  );
};

export default SideBar;
