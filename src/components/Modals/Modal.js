import { useCallback, useEffect } from 'react';
import { Backdrop, ModalContainer, ScrollBox } from './Modal.styled';
import { createPortal } from 'react-dom';

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
      document.body.style.overflow = 'auto';
      onClick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return createPortal(
    <Backdrop onClick={handleBackdropClick}>
      <ScrollBox onClick={handleBackdropClick}>
        <ModalContainer>{children}</ModalContainer>
      </ScrollBox>
    </Backdrop>,
    document.querySelector('#modal')
  );
};
export default Modal;
