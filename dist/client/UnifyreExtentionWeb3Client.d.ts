import { Network } from "ferrum-plumbing";
import { Connect } from "src/contract/Connect";
import { TokenContractFactory } from "src/contract/Contract";
import { CustomTransactionCallRequest, CustomTransactionCallResponse, SendMoneyResponse, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { CurrencyList } from "./CurrencyList";
export declare class UnifyreExtensionWeb3Client extends UnifyreExtensionKitClient {
    private appId;
    private currencyList;
    private connection;
    private tokenFac;
    constructor(appId: string, currencyList: CurrencyList, connection: Connect, tokenFac: TokenContractFactory);
    setToken(_: string): Promise<void>;
    /**
     * Connects to metamask
     */
    signInWithToken(_: string): Promise<void>;
    getUserProfile(): Promise<AppUserProfile>;
    createLinkObject<T>(linkObject: AppLinkRequest<T>): Promise<string>;
    getLinkObject<T>(linkId: string): Promise<T>;
    sendMoneyAsync(toAddress: string, currency: string, amount: string, accountGroupId?: string): Promise<string>;
    getSendMoneyResponse(requestId: string): Promise<SendMoneyResponse>;
    sendTransactionAsync(network: Network, transactions: CustomTransactionCallRequest[], payload?: any): Promise<string>;
    sendAsync(request: any, payload?: any): Promise<string>;
    getSendTransactionResponse(requestId: string, timeout?: number): Promise<CustomTransactionCallResponse>;
    getTransaction(transactionId: string): Promise<any>;
}
//# sourceMappingURL=UnifyreExtentionWeb3Client.d.ts.map