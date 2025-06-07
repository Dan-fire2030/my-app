import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 32px;
  max-width: 420px;
  width: 90%;
  margin: 0 16px;
  animation: slideUp 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background-color: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.svg`
  width: 24px;
  height: 24px;
  color: #ef4444;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: #ef4444;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const ModalDelete = ({ deleteTransactionByIndex, handleCloseClick }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <IconContainer>
          <IconWrapper>
            <Icon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </Icon>
          </IconWrapper>
        </IconContainer>

        <Title>取引を削除しますか？</Title>
        <Description>
          この操作は取り消すことができません
        </Description>

        <ButtonGroup>
          <CancelButton onClick={handleCloseClick}>
            キャンセル
          </CancelButton>
          <DeleteButton
            onClick={() => {
              deleteTransactionByIndex();
              handleCloseClick();
            }}
          >
            削除する
          </DeleteButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ModalDelete;