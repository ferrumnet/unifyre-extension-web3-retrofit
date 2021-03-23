import types from "web3";
import { TransactionConfig } from "web3-eth";
import { Web3Provider } from "./Connect";
import Web3Modal from "web3modal";
import Web3 from "web3";
import { provider, HttpProvider } from 'web3-core';
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ValidationUtils } from "ferrum-plumbing";

export class Web3ModalProvider implements Web3Provider {
    private _modal: Web3Modal | undefined;
    private _provider: provider | undefined;
    private _web3: Web3 | undefined;
    private _connected: boolean = false;
    private _onDisconnect: any;

    constructor(private web3Providers: {[network: string]: string}) {
    }

    async connect(): Promise<void> {
        const modal = this.getModal();
        this._provider = await modal.connect();
        this._web3 = new Web3(this._provider!);
        this.initWeb3();
        this.subscribeProvider();
        this._connected = true;
    }

    isCached() {
        return !!this.getModal().cachedProvider;
    }

    private getModal() {
        this._modal = this._modal || new Web3Modal({
            // network: "mainnet", 
            cacheProvider: true, 
            providerOptions: this.providerOptions() as any,
          });
        return this._modal!;
    }

    private providerOptions() {
        return {
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                rpc: {
                    1: this.web3Providers['ETHEREUM'],
                    4: this.web3Providers['RINKEBY'],
                    56: this.web3Providers['BSC'],
                    97: this.web3Providers['BSC_TESTNET'],
                }
              }
            },
        };
    }

    async disconnect(): Promise<void> {
        return this._disconnect();
    }

    private async _disconnect(error?: Error, payload?: any): Promise<void> {

        if (this._modal) {
            this._modal!.clearCachedProvider();
        }
        if (this._provider) {
            const prov = this._provider as any;
            try {
                if (prov.close) {
                    await prov.close();
                }
                if (prov.connection && prov.connection.isWalletConnect) {
                    await prov.connection._walletConnector.killSession();
                }
            } catch(e) {
                console.error('Connection failed', e);
            }
        }
        this._modal = undefined;
        this._provider = undefined;
        this._web3 = undefined;
        const onDisc = this._onDisconnect;
        this._onDisconnect = undefined;
        if (onDisc) {
            if (error) {
                onDisc(error?.message);
            } else {
                onDisc(payload);
            }
        }
    }

    connected(): boolean {
        if (!this._provider) { return false; }

        const prov = this._provider as any;
        if (prov.connection && prov.connection.isWalletConnect) {
            return prov.connection._walletConnector.connected;
        }
        return this._connected;
    }

    addEventListener(event: "disconnect", fun: (reason: string) => void): void {
        this._onDisconnect = fun;
        const prov = this._provider as any;
        if (prov) {
            prov.on("close", (error: any, payload: any) => {
                console.error('Provider disconnected', error);
                this._disconnect(error, payload);
            });
        }
    }

    async netId(): Promise<number> {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return await this._web3!.eth.net.getId();
    }

    async getAccounts(): Promise<string[]> {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        const accounts = await this._web3!.eth.getAccounts();
        const account = accounts[0];
        ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
        return accounts;
    }

    web3(): types | undefined {
        return this._web3;
    }

    sendTransaction(tx: TransactionConfig): Promise<string> {
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

    send(request: any): Promise<string> {
        ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return new Promise<string>((resolve, reject) => { 
            (this._web3!.currentProvider! as HttpProvider).send(request,
            (e, h) => {
                if (!!e) { reject(e) } else {
                    resolve(h?.result);
                }
            });
        });
    }

    private async subscribeProvider() {
        const provider = this._provider as any;
        if (!provider.on) {
          return;
        }
        provider.on("close", () => this.disconnect());
        provider.on("accountsChanged", async (accounts: string[]) => {
            this.disconnect();
        });
        provider.on("chainChanged", async (chainId: number) => {
            this.disconnect();
        });
    
        provider.on("networkChanged", async (networkId: number) => {
            this.disconnect();
        });
    }

    private initWeb3() {
        (this._web3 as any).eth.extend({
          methods: [
            {
              name: "chainId",
              call: "eth_chainId",
              outputFormatter: (this._web3 as any).utils.hexToNumber
            }
          ]
        });
    }
}