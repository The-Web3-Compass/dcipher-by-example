import { AVERAGE_BLOCK_TIME } from '../config';

export function dateToBlock(targetDate: Date, currentBlock: number): number {
  const now = new Date();
  const secondsUntilTarget = (targetDate.getTime() - now.getTime()) / 1000;
  
  if (secondsUntilTarget <= 0) {
    return currentBlock + 1;
  }
  
  const blocksUntilTarget = Math.floor(secondsUntilTarget / AVERAGE_BLOCK_TIME);
  return currentBlock + blocksUntilTarget;
}

export function blockToDate(blockNumber: number, currentBlock: number): Date {
  const blocksUntilTarget = blockNumber - currentBlock;
  const secondsUntilTarget = blocksUntilTarget * AVERAGE_BLOCK_TIME;
  return new Date(Date.now() + (secondsUntilTarget * 1000));
}

export function formatBlocksRemaining(blocksRemaining: number): string {
  if (blocksRemaining <= 0) {
    return 'Ready to decrypt!';
  }
  
  const secondsRemaining = blocksRemaining * AVERAGE_BLOCK_TIME;
  
  if (secondsRemaining < 60) {
    return `${blocksRemaining} blocks (~${secondsRemaining} sec)`;
  }
  
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  
  if (minutes < 60) {
    return `${blocksRemaining} blocks (~${minutes} min ${seconds} sec)`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${blocksRemaining} blocks (~${hours}h ${remainingMinutes}m)`;
}

export function getMinDate(): string {
  const minDate = new Date(Date.now() + 60 * 1000);
  return minDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
}
