import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, useBlockNumber, useWalletClient, useChainId } from 'wagmi';
import { parseEther, encodeFunctionData, decodeFunctionResult } from 'viem';
import { ethers } from 'ethers';
import { Blocklock, encodeCiphertextToSolidity, encodeParams } from 'blocklock-js';
import { GIFT_MESSAGE_ABI } from '../abi';
import { CONTRACT_ADDRESS, DEFAULT_CALLBACK_GAS_LIMIT, DEFAULT_DECRYPTION_PAYMENT, BASE_SEPOLIA_RPC } from '../config';

// JSON RPC provider for blocklock (not MetaMask)
const jsonRpcProvider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);

export interface Ciphertext {
  u: { x: readonly [bigint, bigint]; y: readonly [bigint, bigint] };
  v: `0x${string}`;
  w: `0x${string}`;
}

export interface Message {
  id: bigint;
  sender: `0x${string}`;
  recipient: `0x${string}`;
  encryptedMessage: Ciphertext;
  revealBlock: bigint;
  revealed: boolean;
  decryptedMessage: string;
  createdAt: bigint;
}

export function useGiftMessages() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: currentBlock } = useBlockNumber({ watch: true });
  const chainId = useChainId();
  
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptingMessageId, setDecryptingMessageId] = useState<bigint | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { data: userMessageIds, refetch: refetchMessageIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GIFT_MESSAGE_ABI,
    functionName: 'getUserMessages',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });
  
  const { 
    writeContract: writeCreateMessage, 
    isPending: isCreating,
    isSuccess: createSuccess,
    error: createError,
    reset: resetCreate
  } = useWriteContract();
  
  const { 
    writeContract: writeRequestDecrypt, 
    isPending: isDecrypting,
    isSuccess: decryptSuccess,
    error: decryptError,
    reset: resetDecrypt
  } = useWriteContract();
  
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: GIFT_MESSAGE_ABI,
    eventName: 'MessageRevealed',
    onLogs(logs) {
      console.log('🎉 MessageRevealed event received!', logs);
      // Trigger refetch of message data (not just IDs)
      setRefreshTrigger(prev => prev + 1);
      setDecryptingMessageId(null);
    },
  });
  
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: GIFT_MESSAGE_ABI,
    eventName: 'MessageCreated',
    onLogs() {
      refetchMessageIds();
    },
  });
  
  useEffect(() => {
    async function fetchMessages() {
      if (!userMessageIds || !Array.isArray(userMessageIds) || userMessageIds.length === 0) {
        setUserMessages([]);
        return;
      }
      
      setIsLoadingMessages(true);
      try {
        const messages: Message[] = [];
        
        for (const id of userMessageIds) {
          try {
            const response = await fetch(`https://sepolia.base.org`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                  to: CONTRACT_ADDRESS,
                  data: encodeFunctionData({
                    abi: GIFT_MESSAGE_ABI,
                    functionName: 'getMessage',
                    args: [id],
                  }),
                }, 'latest'],
                id: 1,
              }),
            });
            
            const result = await response.json();
            if (result.result && result.result !== '0x') {
              const decoded = decodeFunctionResult({
                abi: GIFT_MESSAGE_ABI,
                functionName: 'getMessage',
                data: result.result as `0x${string}`,
              }) as any;
              const msg = decoded;
              
              const encryptedMessage: Ciphertext = {
                u: {
                  x: [BigInt(msg.encryptedMessage.u.x[0]), BigInt(msg.encryptedMessage.u.x[1])] as readonly [bigint, bigint],
                  y: [BigInt(msg.encryptedMessage.u.y[0]), BigInt(msg.encryptedMessage.u.y[1])] as readonly [bigint, bigint],
                },
                v: msg.encryptedMessage.v as `0x${string}`,
                w: msg.encryptedMessage.w as `0x${string}`,
              };
              
              messages.push({
                id: BigInt(msg.id),
                sender: msg.sender as `0x${string}`,
                recipient: msg.recipient as `0x${string}`,
                encryptedMessage,
                revealBlock: BigInt(msg.revealBlock),
                revealed: msg.revealed,
                decryptedMessage: msg.decryptedMessage || '',
                createdAt: BigInt(msg.createdAt),
              });
              
            }
          } catch (err) {
            console.error(`Error fetching message ${id}:`, err);
          }
        }
        
        setUserMessages(messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoadingMessages(false);
      }
    }
    
    fetchMessages();
  }, [userMessageIds, refreshTrigger]);
  
  const createMessage = useCallback(async (
    recipient: string,
    messageText: string,
    revealBlock: number
  ) => {
    if (!walletClient || !address) {
      setError('Wallet not connected');
      return;
    }
    
    setError(null);
    
    try {
      // Encode message and encrypt with blocklock using JSON RPC provider (not MetaMask)
      const encoded = encodeParams(['string'], [messageText]);
      const blocklock = Blocklock.createFromChainId(jsonRpcProvider, chainId);
      
      const encrypted = blocklock.encrypt(
        ethers.getBytes(encoded),
        BigInt(revealBlock)
      );
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const solidityCiphertext = encodeCiphertextToSolidity(encrypted) as any;
      
      // Convert Uint8Array to hex string
      const toHexString = (bytes: any): `0x${string}` => {
        if (typeof bytes === 'string' && bytes.startsWith('0x')) {
          return bytes as `0x${string}`;
        }
        // Convert Uint8Array or array-like object to hex
        const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(Object.values(bytes));
        return ('0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
      };

      const formattedCiphertext = {
        u: {
          x: [BigInt(solidityCiphertext.u.x[0]), BigInt(solidityCiphertext.u.x[1])] as readonly [bigint, bigint],
          y: [BigInt(solidityCiphertext.u.y[0]), BigInt(solidityCiphertext.u.y[1])] as readonly [bigint, bigint],
        },
        v: toHexString(solidityCiphertext.v),
        w: toHexString(solidityCiphertext.w),
      };

      writeCreateMessage({
        address: CONTRACT_ADDRESS,
        abi: GIFT_MESSAGE_ABI,
        functionName: 'createMessage',
        args: [recipient as `0x${string}`, formattedCiphertext, BigInt(revealBlock)],
      } as any);
    } catch (err) {
      console.error('Encryption error:', err);
      setError(err instanceof Error ? err.message : 'Encryption failed');
    }
  }, [walletClient, address, writeCreateMessage, chainId]);
  
  const requestDecryption = useCallback((messageId: bigint, ciphertext: Ciphertext) => {
    setError(null);
    setDecryptingMessageId(messageId);
    writeRequestDecrypt({
      address: CONTRACT_ADDRESS,
      abi: GIFT_MESSAGE_ABI,
      functionName: 'requestDecryption',
      args: [messageId, DEFAULT_CALLBACK_GAS_LIMIT, ciphertext],
      value: parseEther(DEFAULT_DECRYPTION_PAYMENT),
    } as any);
  }, [writeRequestDecrypt]);
  
  const resetStates = useCallback(() => {
    resetCreate();
    resetDecrypt();
    setError(null);
    setDecryptingMessageId(null);
  }, [resetCreate, resetDecrypt]);
  
  return {
    userMessages,
    currentBlock: currentBlock ? Number(currentBlock) : 0,
    
    createMessage,
    requestDecryption,
    refetchMessages: refetchMessageIds,
    resetStates,
    
    isLoadingMessages,
    isCreating,
    isDecrypting,
    decryptingMessageId,
    
    createSuccess,
    decryptSuccess,
    
    error: error || (createError?.message) || (decryptError?.message) || null,
  };
}
