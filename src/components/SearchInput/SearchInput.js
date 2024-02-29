import { useTranslation } from 'react-i18next';
import IconSearch from '../../images/icons/IconSearch';
import { Input, Label, WrapIcon } from './SearchInput.styled';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const SearchInput = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.searchInput',
  });
  const [value, setValue] = useState();
  const { pathname } = useLocation();
  const handleInput = ({ target }) => {
    setValue(target.value);
    console.log(target.value);
  };

  return (
    <Label $mainPage={pathname === '/'}>
      <Input
        placeholder={t('Search')}
        value={value}
        onChange={e => handleInput(e)}
      />
      <WrapIcon>
        <IconSearch />
      </WrapIcon>
    </Label>
  );
};
export default SearchInput;
