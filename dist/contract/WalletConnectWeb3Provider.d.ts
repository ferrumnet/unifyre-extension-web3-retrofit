import { Web3Provider } from './Connect';
import { TransactionConfig } from 'web3-eth';
import { Injectable } from 'ferrum-plumbing';
import Web3 from 'web3';
export declare class WalletConnectWeb3Provider implements Web3Provider, Injectable {
    private web3Providers;
    private connector;
    private _web3;
    constructor(web3Providers: {
        [network: string]: string;
    });
    __name__(): string;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    connected(): boolean;
    addEventListener(event: 'disconnect', fun: (reason: string) => void): void;
    netId(): Promise<number>;
    getAccounts(): Promise<string[]>;
    sendTransaction(tx: TransactionConfig): Promise<any>;
    web3(): Web3 | undefined;
    private setWeb3;
}
//# sourceMappingURL=WalletConnectWeb3Provider.d.ts.map