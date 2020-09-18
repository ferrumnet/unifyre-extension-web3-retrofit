import { Injectable, ValidationUtils } from "ferrum-plumbing";
import Web3 from "web3";

export class Connect implements Injectable {
    private _web3?: Web3;
    private _netId?: number;
    private _account?: string;
    constructor() { }
    __name__() { return 'Connect'; }

    async connect() {
        // @ts-ignore
        const win = window as any || {};
        if (win.ethereum) {
            console.log('USING WIN ETH')
            this._web3 = new Web3(win.ethereum);
            await win.ethereum.enable();
            console.log('WIN ETH DET', this._web3.eth)
            win.shambal = this._web3;
        } else if (win.web3) {
            this._web3 = new Web3(win.web3.currentProvider);
        } else {
            const error = 'Metamask Not Detected';
            throw error;
        }
        this._netId = await this._web3.eth.net.getId();
        const accounts = await this._web3.eth.getAccounts();
        const account = accounts[0];
        ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
        this._account = account!;
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