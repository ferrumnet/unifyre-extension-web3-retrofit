import types from 'web3';
import { Web3Provider } from './Connect';
import { TransactionConfig } from 'web3-eth';
export declare class WalletConnectWeb3Provider implements Web3Provider {
    private connector;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    connected(): boolean;
    addEventListener(event: 'disconnect', fun: (reason: string) => void): void;
    netId(): Promise<number>;
    getAccounts(): Promise<string[]>;
    sendTransaction(tx: TransactionConfig): Promise<any>;
    web3(): types | undefined;
}
//# sourceMappingURL=WalletConnectWeb3Provider.d.ts.map