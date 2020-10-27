import types from 'web3';
import { Web3Provider } from './Connect';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { TransactionConfig } from 'web3-eth';
import { ValidationUtils } from 'ferrum-plumbing';

export class WalletConnectWeb3Provider implements Web3Provider {
    private connector: WalletConnect | undefined;
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
                        resolve();
                    }
                });
            });
            return connectPromise;
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

    web3(): types | undefined {
        throw new Error('Wallet connect provider does not support full web3 features.');
    }
}