import { Web3Provider } from './Connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { TransactionConfig } from 'web3-eth';
import { Injectable, ValidationUtils } from 'ferrum-plumbing';
import Web3 from 'web3';

const CHAIN_ID_MAP: {[k: number]: string} = {
    1: 'ETHEREUM',
    4: 'RINKEBY',
}

export class WalletConnectWeb3Provider implements Web3Provider, Injectable {
    private connector: WalletConnect | undefined;
    private _web3: Web3 | undefined;
    constructor(private web3Providers: {[network: string]: string}) {
    }

    __name__() { return 'WalletConnectWeb3Provider'; }

    async connect(): Promise<void> {
        if (this.connector) {
            // Already connected
            return;
        }

        this.connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org", // Required
            qrcodeModal: QRCodeModal,
        });

        // Check if connection is already established
        if (!this.connector!.connected) {
            // create new session
            await this.connector.createSession();
            const connectPromise = new Promise<void>((resolve, reject) => {
                // Subscribe to connection events
                this.connector!.on("connect", (error, payload) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log('Wallet connect ceonnected ', payload);
                        this.setWeb3();
                        resolve();
                    }
                });
            });
            return connectPromise;
        } else {
            this.setWeb3();
        }
    }

    async disconnect(): Promise<void> {
        await this.connector!.killSession();
    }

    connected() {
        return this.connector?.connected || false;
    }

    addEventListener(event: 'disconnect', fun: (reason: string) => void): void {
        this.connector!.on(event, (error, payload) => {
            console.error('Wallet connect disconnected', error);
            if (error) {
                fun(error?.message);
            } else {
                fun(payload);
            }
        });
    }

    async netId(): Promise<number> {
        return this.connector!.chainId;
    }

    async getAccounts(): Promise<string[]> {
        return this.connector?.accounts || [];
    }

    sendTransaction(tx: TransactionConfig) {
        ValidationUtils.isTrue(!!this.connector, 'Connect first');
        return this.connector!.sendTransaction(tx as any);
    }

    web3(): Web3 | undefined {
        return this._web3;
    }

    private setWeb3() {
        ValidationUtils.isTrue(!!this.connector, 'Connect first');
        if (this._web3) { return; }
        const chainId = this.connector!.chainId;
        const chainName = CHAIN_ID_MAP[chainId];
        ValidationUtils.isTrue(!!chainName, `Selected chain with ID ${chainId} is not supported`);
        const httpUrl = this.web3Providers[chainName]
        ValidationUtils.isTrue(!!httpUrl, `No http provider is set for  ${chainName}`);
        this._web3 = new Web3(new Web3.providers.HttpProvider(httpUrl));
    }
}