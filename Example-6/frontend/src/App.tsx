import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { CreateMessage } from './components/CreateMessage';
import { MessageList } from './components/MessageList';
import { CONTRACT_ADDRESS } from './config';

function Snowflakes() {
  return (
    <div className="snowflakes">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="snowflake">❄</div>
      ))}
    </div>
  );
}

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [view, setView] = useState<'create' | 'list'>('create');
  
  const isContractConfigured = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
  
  if (!isConnected) {
    return (
      <>
        <Snowflakes />
        <div className="connect-wrapper">
          <div className="connect-card">
            <h1>Secret Santa Messages</h1>
            <p className="subtitle">Send encrypted gift messages that reveal at a future block height</p>
            <p className="powered-by">Powered by dcipher blocklock encryption</p>
            <button onClick={() => connect({ connector: connectors[0] })}>
              🎁 Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Snowflakes />
      <div className="container">
        <header>
          <h1>Secret Santa Messages</h1>
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
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          Built with ❤️ by Web3compass using dcipher blocklock encryption
        </p>
      </footer>
      </div>
    </>
  );
}

export default App;
