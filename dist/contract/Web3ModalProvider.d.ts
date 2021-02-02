import types from "web3";
import { TransactionConfig } from "web3-eth";
import { Web3Provider } from "./Connect";
export declare class Web3ModalProvider implements Web3Provider {
    private web3Providers;
    private _modal;
    private _provider;
    private _web3;
    private _connected;
    private _onDisconnect;
    constructor(web3Providers: {
        [network: string]: string;
    });
    connect(): Promise<void>;
    isCached(): boolean;
    private getModal;
    private providerOptions;
    disconnect(): Promise<void>;
    private _disconnect;
    connected(): boolean;
    addEventListener(event: "disconnect", fun: (reason: string) => void): void;
    netId(): Promise<number>;
    getAccounts(): Promise<string[]>;
    web3(): types | undefined;
    sendTransaction(tx: TransactionConfig): Promise<string>;
    private subscribeProvider;
    private initWeb3;
}
//# sourceMappingURL=Web3ModalProvider.d.ts.map