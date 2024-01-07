import { StyleButton } from './Button.styled';

const Button = ({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <StyleButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </StyleButton>
  );
};

export default Button;
