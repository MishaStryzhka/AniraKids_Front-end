import IconSearch from '../../images/icons/IconSearch';
import { Input, Label, WrapIcon } from './SearchInput.styled';

const SearchInput = () => {
  const handleInput = ({ target }) => {
    console.log(target.value);
  };

  return (
    <>
      <Label>
        <Input
          placeholder='Пошук'
          // value={value}
          onChange={(e) => handleInput(e)}
        />
        {handleInput !== '' ? (
          <WrapIcon>
            <IconSearch />
          </WrapIcon>
        ) : (
          ''
        )}
      </Label>
    </>
  );
};
export default SearchInput;
