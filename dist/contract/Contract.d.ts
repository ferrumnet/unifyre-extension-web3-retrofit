import { Injectable } from 'ferrum-plumbing';
import { Connect } from './Connect';
export declare class ContractCallError extends Error {
    error: any;
    constructor(msg: string, error: any);
}
declare class ContractBase {
    protected connection: Connect;
    constructor(connection: Connect);
    sendTransactionParams(sender: string, gas: string): {
        from: string;
        gas: string;
    };
    contractExist(contractAddress: string): Promise<boolean>;
    /**
       * Calls a contract, receives transaction ID.
       * * fun should return a method transactions
       */
    callContractWrapper(topic: string, sender: string, fun: () => any): Promise<unknown>;
}
export declare class TokenContractFactory implements Injectable {
    private connection;
    private cache;
    constructor(connection: Connect);
    __name__(): string;
    forToken(token: string): Promise<TokenContract>;
}
export declare class TokenContract extends ContractBase {
    private contract;
    private name?;
    private symbol?;
    private decimals?;
    constructor(connection: Connect);
    init(tokenAddress: string): Promise<void>;
    balanceOf(address: string): Promise<string>;
    allowance(userAddress: string, contractAddress: string): Promise<string>;
    getName(): string | undefined;
    getSymbol(): string | undefined;
    amountToRaw(amount: string): string;
    rawToAmount(raw: string): string;
    approve(userAddress: string, target: string, amount: string): Promise<unknown>;
}
export {};
//# sourceMappingURL=Contract.d.ts.map