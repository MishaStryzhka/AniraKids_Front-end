import { StyleButton } from './Button.styled';

const Button = ({ children }) => {
  return <StyleButton type="submit">{children}</StyleButton>;
};

export default Button;
