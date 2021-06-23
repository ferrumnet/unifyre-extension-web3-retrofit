import { Injectable } from "ferrum-plumbing";
import Web3 from "web3";
import { TransactionConfig } from 'web3-eth';
export interface Web3Provider {
    isCached(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    connected(): boolean;
    addEventListener(event: 'disconnect' | 'change', fun: (reason: string) => void): void;
    netId(): Promise<number>;
    getAccounts(): Promise<string[]>;
    web3(): Web3 | undefined;
    sendTransaction(tx: TransactionConfig): Promise<string>;
    send(request: any): Promise<string>;
}
export declare class Connect implements Injectable {
    private _netId?;
    private _account?;
    private _provider?;
    constructor();
    __name__(): string;
    connect(): Promise<string | undefined>;
    reset(): Promise<void>;
    setProvider(prov: Web3Provider): void;
    getProvider(): Web3Provider | undefined;
    connected(): boolean | undefined;
    netId(): number | undefined;
    network(): string;
    account(): string | undefined;
}
//# sourceMappingURL=Connect.d.ts.map