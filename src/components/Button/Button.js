import { StyleButton } from './Button.styled';

const Button = ({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  className,
  style,
}) => {
  return (
    <StyleButton
      style={style}
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
