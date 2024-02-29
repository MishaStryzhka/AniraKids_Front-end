// ========
// onClick for close Modal
//
// prohibitClosingByBackdrop
// ========
import { useCallback, useEffect } from 'react';
import {
  Backdrop,
  CloseButton,
  ModalContainer,
  ScrollBox,
  StyledIconCross,
} from './Modal.styled';
import { createPortal } from 'react-dom';

const Modal = ({ children, onClick, prohibitClosingByBackdrop = false }) => {
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
    <Backdrop
      onClick={
        onClick && !prohibitClosingByBackdrop ? handleBackdropClick : () => {}
      }
    >
      <ScrollBox
        onClick={
          onClick && !prohibitClosingByBackdrop ? handleBackdropClick : () => {}
        }
      >
        <ModalContainer>
          {onClick && (
            <CloseButton
              onClick={() => {
                document.body.style.overflow = 'auto';
                onClick();
              }}
            >
              <StyledIconCross />
            </CloseButton>
          )}
          {children}
        </ModalContainer>
      </ScrollBox>
    </Backdrop>,
    document.querySelector('#modal')
  );
};
export default Modal;
