import { Injectable, ValidationUtils } from "ferrum-plumbing";
import { provider } from 'web3-core';
import Web3 from "web3";

export class Connect implements Injectable {
    private _web3?: Web3;
    private _netId?: number;
    private _account?: string;
    private _provider?: provider;
    constructor() { }
    __name__() { return 'Connect'; }

    async connect() {
        const prov = this.getProvider()!;
        this._web3 = new Web3(prov);
        if ((prov as any).enable) {
            await (prov as any).enable();
        }
        this._netId = await this._web3.eth.net.getId();
        const accounts = await this._web3.eth.getAccounts();
        const account = accounts[0];
        ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
        this._account = account!;
    }

    clearProvider() {
        this._provider = undefined;
    }

    setProvider(prov: provider) {
        ValidationUtils.isTrue(!!prov, '"provider" must be provided');
        this._provider = prov;
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

    web3() {
        return this._web3;
    }

    netId() {
        return this._netId;
    }

    network() {
        switch (this.netId()) {
            case 1:
                return 'ETHEREUM';
            case 4:
                return 'RINKEBY';
        }
    }

    account() {
        return this._account;
    }
}