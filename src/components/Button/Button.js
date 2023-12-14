import { StyleButton } from './Button.styled';

const Button = ({ children }) => {
  return <StyleButton type="button">{children}</StyleButton>;
};

export default Button;
