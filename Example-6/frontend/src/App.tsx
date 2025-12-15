import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { CreateMessage } from './components/CreateMessage';
import { MessageList } from './components/MessageList';
import { CONTRACT_ADDRESS } from './config';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [view, setView] = useState<'create' | 'list'>('create');
  
  // Check if contract is configured
  const isContractConfigured = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
  
  // Not connected - show connect screen
  if (!isConnected) {
    return (
      <div className="container connect-screen">
        <h1>🎁 Secret Santa Messages</h1>
        <p>Send encrypted gift messages that reveal at a future block height</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
          Powered by dcipher blocklock encryption
        </p>
        <button onClick={() => connect({ connector: connectors[0] })}>
          Connect Wallet
        </button>
        
        <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '500px', margin: '40px auto' }}>
          <h3 style={{ marginBottom: '12px', color: '#ff6b6b' }}>📚 What is Blocklock?</h3>
          <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Blocklock encryption allows you to encrypt data that can only be decrypted 
            after a specific blockchain block height is reached. This enables time-locked 
            secrets without trusting any third party!
          </p>
        </div>
      </div>
    );
  }
  
  // Connected - show main app
  return (
    <div className="container">
      <header>
        <h1>🎁 Secret Santa Messages</h1>
        <div className="wallet-info">
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <button className="secondary" onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      </header>
      
      {!isContractConfigured && (
        <div className="error-message">
          ⚠️ Contract not configured! Update CONTRACT_ADDRESS in frontend/src/config.ts after deployment.
        </div>
      )}
      
      <nav>
        <button
          onClick={() => setView('create')}
          className={view === 'create' ? 'active' : ''}
        >
          ✉️ Create Message
        </button>
        <button
          onClick={() => setView('list')}
          className={view === 'list' ? 'active' : ''}
        >
          📬 My Messages
        </button>
      </nav>
      
      <main>
        {view === 'create' ? <CreateMessage /> : <MessageList />}
      </main>
      
      <footer>
        <p>Powered by <strong>dcipher</strong> blocklock encryption on Base Sepolia</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          Educational example demonstrating block-based time-locked encryption
        </p>
      </footer>
    </div>
  );
}

export default App;
