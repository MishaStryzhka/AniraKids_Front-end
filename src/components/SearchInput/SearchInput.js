import { useTranslation } from 'react-i18next';
import IconSearch from '../../images/icons/IconSearch';
import { Input, Label, WrapIcon } from './SearchInput.styled';
import { useLocation } from 'react-router-dom';

const SearchInput = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.searchInput',
  });
  const { pathname } = useLocation();
  const handleInput = ({ target }) => {
    console.log(target.value);
  };

  return (
    <Label $mainPage={pathname === '/'}>
      <Input
        placeholder={t('Search')}
        // value={value}
        onChange={e => handleInput(e)}
      />
      {handleInput !== '' ? (
        <WrapIcon>
          <IconSearch />
        </WrapIcon>
      ) : (
        ''
      )}
    </Label>
  );
};
export default SearchInput;
