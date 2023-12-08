import { useCallback, useEffect } from 'react';
import { Backdrop, ModalContainer, BtnStyled } from './Modal.styled';

const Modal = ({ children, onClick }) => {
  const handleKeyDown = useCallback(
    evt => {
      document.body.style.overflow = 'auto';
      if (evt.code === 'Escape') {
        onClick();
      }
    },
    [onClick]
  );

  document.body.style.overflow = 'hidden';

  const handleBackdropClick = evt => {
    if (evt.currentTarget === evt.target) {
      onClick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Backdrop onClick={handleBackdropClick}>
      <ModalContainer>
        <BtnStyled
          icon={'IconCross'}
          transparent={true}
          onClick={() => {
            document.body.style.overflow = 'auto';
            onClick();
          }}
        />
        {children}
      </ModalContainer>
    </Backdrop>
  );
};
export default Modal;
