import { Injectable } from "ferrum-plumbing";
import Web3 from "web3";
export declare class Connect implements Injectable {
    private _web3?;
    private _netId?;
    private _account?;
    constructor();
    __name__(): string;
    connect(): Promise<void>;
    web3(): Web3 | undefined;
    netId(): number | undefined;
    network(): "ETHEREUM" | "RINKEBY" | undefined;
    account(): string | undefined;
}
//# sourceMappingURL=Connect.d.ts.map