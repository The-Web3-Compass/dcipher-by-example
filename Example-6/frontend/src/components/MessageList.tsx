import { useAccount, useBlockNumber } from 'wagmi';
import { useGiftMessages, Message, Ciphertext } from '../hooks/useGiftMessages';
import { formatBlocksRemaining } from '../utils/blocktime';
import { DEFAULT_DECRYPTION_PAYMENT } from '../config';

export function MessageList() {
  const { address } = useAccount();
  const { data: currentBlock } = useBlockNumber({ watch: true });
  const { 
    userMessages, 
    requestDecryption, 
    decryptingMessageId, 
    isLoadingMessages,
    decryptSuccess,
    error 
  } = useGiftMessages();
  
  const currentBlockNum = currentBlock ? Number(currentBlock) : 0;
  
  const sentMessages = userMessages.filter(
    m => m.sender.toLowerCase() === address?.toLowerCase()
  );
  const receivedMessages = userMessages.filter(
    m => m.recipient.toLowerCase() === address?.toLowerCase()
  );
  
  if (isLoadingMessages) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <span className="loading"></span>
          Loading messages...
        </div>
      </div>
    );
  }
  
  if (userMessages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <p>📭 No messages yet</p>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Create your first encrypted message or wait to receive one!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="message-list">
      {decryptSuccess && (
        <div className="success-message">
          ✅ Decryption requested! The dcipher network will deliver the key shortly.
        </div>
      )}
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      <h2 className="section-title">📥 Received Messages ({receivedMessages.length})</h2>
      {receivedMessages.length === 0 ? (
        <div className="empty-state" style={{ padding: '20px' }}>
          No messages received yet
        </div>
      ) : (
        receivedMessages.map(msg => (
          <MessageCard
            key={msg.id.toString()}
            message={msg}
            currentBlock={currentBlockNum}
            isRecipient={true}
            onDecrypt={requestDecryption}
            decryptingMessageId={decryptingMessageId}
          />
        ))
      )}
      
      <h2 className="section-title" style={{ marginTop: '30px' }}>
        📤 Sent Messages ({sentMessages.length})
      </h2>
      {sentMessages.length === 0 ? (
        <div className="empty-state" style={{ padding: '20px' }}>
          No messages sent yet
        </div>
      ) : (
        sentMessages.map(msg => (
          <MessageCard
            key={msg.id.toString()}
            message={msg}
            currentBlock={currentBlockNum}
            isRecipient={false}
            onDecrypt={requestDecryption}
            decryptingMessageId={decryptingMessageId}
          />
        ))
      )}
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  currentBlock: number;
  isRecipient: boolean;
  onDecrypt: (messageId: bigint, ciphertext: Ciphertext) => void;
  decryptingMessageId: bigint | null;
}

function MessageCard({ message, currentBlock, isRecipient, onDecrypt, decryptingMessageId }: MessageCardProps) {
  const blocksRemaining = Number(message.revealBlock) - currentBlock;
  const canDecrypt = isRecipient && blocksRemaining <= 0 && !message.revealed;
  const isThisDecrypting = decryptingMessageId === message.id;
  
  const truncateAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  return (
    <div className={`message-card ${message.revealed ? 'revealed' : ''}`}>
      <div className="message-header">
        <span className={`status-badge ${message.revealed ? 'revealed' : 'encrypted'}`}>
          {message.revealed ? '🔓 Revealed' : '🔒 Encrypted'}
        </span>
        <span style={{ color: '#666', fontSize: '0.8rem' }}>
          ID: {message.id.toString()}
        </span>
      </div>
      
      <div className="message-details">
        <p>
          <strong>From:</strong>{' '}
          <span className="address">{truncateAddress(message.sender)}</span>
        </p>
        <p>
          <strong>To:</strong>{' '}
          <span className="address">{truncateAddress(message.recipient)}</span>
        </p>
        <p>
          <strong>Reveal Block:</strong> {message.revealBlock.toString()}
        </p>
        
        {!message.revealed && (
          <p className="countdown">
            ⏳ {formatBlocksRemaining(blocksRemaining)}
          </p>
        )}
        
        {canDecrypt && (
          <button
            onClick={() => onDecrypt(message.id, message.encryptedMessage)}
            disabled={decryptingMessageId !== null}
            style={{ marginTop: '12px' }}
          >
            {isThisDecrypting ? (
              <>
                <span className="loading"></span>
                Requesting Decryption...
              </>
            ) : (
              `🔑 Request Decryption (${DEFAULT_DECRYPTION_PAYMENT} ETH)`
            )}
          </button>
        )}
        
        {message.revealed && isRecipient && message.decryptedMessage && (
          <div className="decrypted-message">
            <p>🎁 Your Gift Message:</p>
            <p>{message.decryptedMessage}</p>
          </div>
        )}
        
        {message.revealed && !isRecipient && (
          <div className="decrypted-message">
            <p>✅ Message has been revealed to recipient</p>
          </div>
        )}
        
        {!message.revealed && isRecipient && blocksRemaining > 0 && (
          <p style={{ marginTop: '12px', color: '#666', fontSize: '0.85rem' }}>
            💡 You can request decryption once block {message.revealBlock.toString()} is reached
          </p>
        )}
      </div>
    </div>
  );
}
