import { StyleButton } from './Button.styled';

const Button = ({
  children,
  type = 'submit',
  onClick,
  disabled = false,
  className,
  style,
  ariaLabel,
  form,
}) => {
  return (
    <StyleButton
      style={style}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      form={form}
    >
      {children}
    </StyleButton>
  );
};

export default Button;
