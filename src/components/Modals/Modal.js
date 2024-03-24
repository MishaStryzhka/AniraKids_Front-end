// ========
// closeModal for close Modal
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

const Modal = ({ children, closeModal, prohibitClosingByBackdrop = false }) => {
  const handleKeyDown = useCallback(
    evt => {
      document.body.style.overflowY = 'auto';
      if (evt.code === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );

  document.body.style.overflowY = 'hidden';

  const handleBackdropClick = evt => {
    if (evt.currentTarget === evt.target) {
      document.body.style.overflowY = 'auto';
      closeModal();
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
        closeModal && !prohibitClosingByBackdrop
          ? handleBackdropClick
          : () => {}
      }
    >
      <ScrollBox
        onClick={
          closeModal && !prohibitClosingByBackdrop
            ? handleBackdropClick
            : () => {}
        }
      >
        <ModalContainer>
          {closeModal && (
            <CloseButton
              onClick={() => {
                document.body.style.overflowY = 'auto';
                closeModal();
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
