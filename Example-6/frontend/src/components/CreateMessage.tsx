import { useState, useEffect } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { useGiftMessages } from '../hooks/useGiftMessages';
import { dateToBlock, getMinDate } from '../utils/blocktime';

export function CreateMessage() {
  const { address } = useAccount();
  const { data: currentBlock } = useBlockNumber();
  const { createMessage, isCreating, createSuccess, error, resetStates } = useGiftMessages();
  
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [revealDateTime, setRevealDateTime] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const revealBlock = revealDateTime && currentBlock
    ? dateToBlock(new Date(revealDateTime), Number(currentBlock))
    : 0;
  
  useEffect(() => {
    if (createSuccess) {
      setMessage('');
      setRecipient('');
      setRevealDateTime('');
      setTimeout(() => resetStates(), 3000);
    }
  }, [createSuccess, resetStates]);
  
  const validateForm = (): boolean => {
    setLocalError(null);
    
    if (!message.trim()) {
      setLocalError('Please enter a message');
      return false;
    }
    
    if (message.length > 500) {
      setLocalError('Message must be 500 characters or less');
      return false;
    }
    
    if (!recipient.trim()) {
      setLocalError('Please enter a recipient address');
      return false;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setLocalError('Invalid Ethereum address format');
      return false;
    }
    
    if (recipient.toLowerCase() === address?.toLowerCase()) {
      setLocalError('Cannot send a message to yourself');
      return false;
    }
    
    if (!revealDateTime) {
      setLocalError('Please select a reveal date and time');
      return false;
    }
    
    if (revealBlock <= Number(currentBlock || 0)) {
      setLocalError('Reveal time must be in the future');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await createMessage(recipient, message, revealBlock);
  };
  
  return (
    <div className="create-message">
      <h2 className="section-title">Create Encrypted Message</h2>
      
      {createSuccess && (
        <div className="success-message">
          ✅ Message encrypted and sent! It will be revealable at block {revealBlock}.
        </div>
      )}
      
      {(error || localError) && (
        <div className="error-message">
          ❌ {localError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Gift Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your secret gift message here... 🎁"
            maxLength={500}
            disabled={isCreating}
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            {message.length}/500 characters
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isCreating}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="revealDate">Reveal Date & Time</label>
          <input
            id="revealDate"
            type="datetime-local"
            value={revealDateTime}
            onChange={(e) => setRevealDateTime(e.target.value)}
            min={getMinDate()}
            disabled={isCreating}
          />
          
          {revealBlock > 0 && currentBlock ? (
            <div className="block-estimate">
              📦 Estimated reveal block: <strong>{revealBlock}</strong>
              <br />
              <small>Current block: {Number(currentBlock)} | ~{revealBlock - Number(currentBlock)} blocks away</small>
            </div>
          ) : null}
        </div>
        
        <button
          type="submit"
          disabled={isCreating || !message || !recipient || !revealDateTime}
        >
          {isCreating ? (
            <>
              <span className="loading"></span>
              Encrypting & Sending...
            </>
          ) : (
            '🔐 Encrypt & Send Message'
          )}
        </button>
      </form>
      
      <div style={{ marginTop: '30px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '8px', color: '#ff6b6b' }}>📚 How Blocklock Encryption Works</h4>
        <ol style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#aaa', lineHeight: '1.6' }}>
          <li>Your message is encrypted using <strong>blocklock-js</strong> with the target block height</li>
          <li>The encrypted ciphertext is stored on-chain (unreadable until reveal block)</li>
          <li>When the reveal block is reached, the recipient can request decryption</li>
          <li>The <strong>dcipher network</strong> automatically delivers the decryption key</li>
          <li>The contract decrypts and stores the message for the recipient to read</li>
        </ol>
      </div>
    </div>
  );
}
