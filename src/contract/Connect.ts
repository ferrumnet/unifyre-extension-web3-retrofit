import { Injectable, ValidationUtils } from "ferrum-plumbing";
import { Networks } from "ferrum-plumbing/dist/models/types/Networks";
import Web3 from "web3";
import { provider, HttpProvider } from 'web3-core';
import { TransactionConfig } from 'web3-eth';

export interface Web3Provider {
    isCached(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    connected(): boolean;
    addEventListener(event: 'disconnect'|'change', fun: (reason: string) => void): void;
    netId(): Promise<number>;
    getAccounts(): Promise<string[]>;
    web3(): Web3|undefined;
    sendTransaction(tx: TransactionConfig): Promise<string>;
    send(request: any): Promise<string>;
}

class MetamaskProvider implements Web3Provider {
    private _web3?: Web3;
    private _provider: provider|undefined;
    private _conneted: boolean = false;
    async connect() {
        const prov = this.getProvider()!;
        this._web3 = new Web3(prov);
        if ((prov as any).enable) {
            await (prov as any).enable();
        }
        this._conneted = true;
    }

    isCached() { return false; }

    async netId() {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return await this._web3!.eth.getChainId();
    }

    async getAccounts(): Promise<string[]> {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        const accounts = await this._web3!.eth.getAccounts();
        const account = accounts[0];
        ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
        return accounts;
    }

    async disconnect(): Promise<void> {
        return;
    }

    connected() {
        return this._conneted;
    }

    addEventListener(_: 'disconnect'|'change', fun: (reason: string) => void) {
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            window.ethereum.on('accountsChanged', () => {
                this._conneted = false;
                fun('Account disconnected or changed');
            });
        }
    }

    web3(): Web3|undefined {
        return this._web3!;
    }

    sendTransaction(tx: TransactionConfig) {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return new Promise<string>((resolve, reject) => { 
            this._web3!.eth.sendTransaction(tx,
            (e, h) => {
                if (!!e) { reject(e) } else {
                    resolve(h);
                }
            }).catch(reject);
        });
    }

    send(request: any) {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return new Promise<string>((resolve, reject) => { 
            (this._web3!.currentProvider! as HttpProvider).send(request,
            (e, h) => {
                if (!!e) { reject(e) } else {
                    resolve(h?.result!);
                }
            });
        });
    }

    private getProvider(): provider {
        if (!this._provider) {
            // @ts-ignore
            const win = window as any || {};
            if (win.ethereum) {
                this._provider = win.ethereum;
            } else if (win.web3) {
                this._provider = win.web3.currentProvider;
            } else {
                const error = 'No Web3 provider such as Metamask was detected';
                throw error;
            }
        }
        return this._provider!;
    }
}

export class Connect implements Injectable {
    private _netId?: number;
    private _account?: string;
    private _provider?: Web3Provider = new MetamaskProvider();
    constructor() { }
    __name__() { return 'Connect'; }

    async connect() {
        const prov = this._provider!;
        await prov.connect();
        await this.reset();
        return this._account;
    }

    async reset() {
        const prov = this._provider!;
        this._netId = await prov.netId();
        const accounts = await prov.getAccounts();
        this._account = accounts[0];
    }
    
    setProvider(prov: Web3Provider) {
        ValidationUtils.isTrue(!!prov, '"provider" must be provided');
        this._provider = prov;
    }

    getProvider() {
        ValidationUtils.isTrue(!!this._provider, 'Make sure to initialize before using "getProvider"');
        return this._provider;
    }

    connected() {
        return this._provider && this.getProvider()!.connected();
    }

    netId() {
        return this._netId;
    }

    network() {
		return Networks.forChainId(this._netId!).id;
    }

    account() {
        return this._account;
    }
}
