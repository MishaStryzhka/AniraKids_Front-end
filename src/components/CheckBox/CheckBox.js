import IconCheck from 'images/icons/IconCheck';
import { StyledCheckBox } from './CheckBox.styled';

const CheckBox = ({ value }) => {
  return <StyledCheckBox>{value && <IconCheck />}</StyledCheckBox>;
};

export default CheckBox;
