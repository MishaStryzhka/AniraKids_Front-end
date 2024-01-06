import { StyleButton } from './Button.styled';

const Button = ({ children, type = 'submit', onClick, disabled = false }) => {
  return (
    <StyleButton type={type} onClick={onClick} disabled={disabled}>
      {children}
    </StyleButton>
  );
};

export default Button;
