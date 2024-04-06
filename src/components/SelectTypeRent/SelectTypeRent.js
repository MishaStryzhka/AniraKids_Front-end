import {
  RadioInput,
  RadioLabel,
  StyledSelectTypeRent,
} from './SelectTypeRent.styled';

const SelectTypeRent = ({ typeRent = 'celebration', setTypeRent }) => {
  return (
    <StyledSelectTypeRent>
      <RadioLabel>
        <RadioInput
          type="radio"
          name="typeRent"
          value="celebration"
          checked={typeRent === 'celebration'}
          onChange={e => setTypeRent(e.currentTarget.value)}
        />
        Celebration
      </RadioLabel>
      <RadioLabel>
        <RadioInput
          type="radio"
          name="typeRent"
          value="photosession"
          checked={typeRent === 'photosession'}
          onChange={e => setTypeRent(e.currentTarget.value)}
        />
        Photosession
      </RadioLabel>
    </StyledSelectTypeRent>
  );
};

export default SelectTypeRent;
