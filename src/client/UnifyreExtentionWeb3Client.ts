import { Network, ValidationUtils } from "ferrum-plumbing";
import { Connect } from "../contract/Connect";
import { TokenContractFactory } from "../contract/Contract";
import { CustomTransactionCallRequest, CustomTransactionCallResponse, SendMoneyResponse, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { AddressDetails, AppUserProfile, UserAccountGroup } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { CurrencyList } from "./CurrencyList";
import { TransactionConfig } from 'web3-eth';
import Web3 from "web3";
import { Networks } from "ferrum-plumbing/dist/models/types/Networks";

export class UnifyreExtensionWeb3Client extends UnifyreExtensionKitClient {
    constructor(private appId: string, private currencyList: CurrencyList,
        private connection: Connect, private tokenFac: TokenContractFactory) {
        super();
    }

    async setToken(_: string): Promise<void> {
    }

    /**
     * Connects to metamask
     */
    async signInWithToken(_: string): Promise<void> {
        await this.connection.connect();
    }

    async getUserProfile(): Promise<AppUserProfile> {
        // Cretate a user profile. And get token fetches for addresses.
        const userAddress = this.connection.account() || '';
        ValidationUtils.isTrue(!!userAddress, 'Make sure to initialize the web3 client such as Metamask');
        const currentNet = this.connection.network();
		const networkPrefix = `${currentNet}:`;
        const currencies = this.currencyList.get().filter(c => c.startsWith(networkPrefix as string));
        const web3 = this.connection.getProvider()?.web3();
        const addressesF = currencies.map(async c => {
            const [network, tokenAddr] = c.split(':');
            let balance: string = '0'; 
            let symbol: string = ''; 
			const netObj = Networks.for(network);
            if (network === currentNet) {
                if (netObj.baseSymbol === tokenAddr) {
                    symbol  = tokenAddr;
                    if (!!web3) {
                        balance = Web3.utils.fromWei(await web3!.eth.getBalance(userAddress));
                    } else {
                        balance = '0';
                    }
                } else {
                    const token = await this.tokenFac.forToken(tokenAddr);
                    if (!!userAddress) {
                        balance = await token.balanceOf(userAddress); 
                    }
                    symbol = await token.getSymbol()!;
                }
            }
            return {
                address: userAddress.toLocaleLowerCase(),
                addressType: 'ADDRESS',
                balance,
                currency: c,
                humanReadableAddress: userAddress,
                network,
                pendingForDeposit: '0',
                pendingForWithdrawal: '0',
                symbol: symbol,
                addressWithChecksum: userAddress,
            } as AddressDetails;
        });
        const addresses = await Promise.all(addressesF);
        const ag = {
            id: 'ag1',
            addresses,
        } as UserAccountGroup;
        const up = {
            appId: this.appId,
            displayName: '',
            userId: userAddress,
            accountGroups: [
                ag
            ]
        } as AppUserProfile;
        return up;
    }

    createLinkObject<T>(linkObject: AppLinkRequest<T>): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getLinkObject<T>(linkId: string): Promise<T> {
        throw new Error("Method not implemented.");
    }

    sendMoneyAsync(toAddress: string, currency: string, amount: string, accountGroupId?: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    getSendMoneyResponse(requestId: string): Promise<SendMoneyResponse> {
        throw new Error("Method not implemented.");
    }

    async sendTransactionAsync(network: Network, transactions: CustomTransactionCallRequest[],
        payload?: any):
    Promise<string> {
        // Sign and send transaction. Return transaction IDs joined with comma
        ValidationUtils.isTrue(!!transactions && !!transactions.length, '"transactions" must be provided');
        const txIds: string[] = [];
        for (const tx of transactions) {
            const txId = await new Promise<string>((resolve, reject) =>
            this.connection.getProvider()!.sendTransaction({
                from: tx.from,
                to: tx.contract,
                value: tx.value || '0x',
                data: tx.data,
                gas: tx.gas?.gasLimit,
                // gasPrice: tx.gas?.gasPrice,
                // chainId: this.connection.netId()
            } as TransactionConfig)
            .then(h => resolve(h)).catch(reject)
            );
            txIds.push(txId);
        }
        // We should return a request ID. In this case we just return tx IDs as the request ID
        return txIds.join(',') + '|' + JSON.stringify(payload || '');
    }

    // TODO: Manage with sign (for unifyre)
    async sendAsync(request: any, payload?: any):
    Promise<string> {
        // Sign and send transaction. Return transaction IDs joined with comma
        ValidationUtils.isTrue(!!request, '"request" must be provided');
        const rv = await this.connection.getProvider()!.send(request);
        // We should return a request ID. In this case we just return result as the request ID
        return rv + '|' + JSON.stringify(payload || '');
    }

    async getSendTransactionResponse(requestId: string, timeout?: number): Promise<CustomTransactionCallResponse> {
        ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
        ValidationUtils.isTrue(requestId.startsWith('0x') || requestId.startsWith('0X'), 'Invalid web3 request ID');
        const [txIdPart, payloadPart] = requestId.split('|');
        const txIds = txIdPart.split(',');
        const requestPayload = JSON.parse(payloadPart);
        return {
            rejected: false,
            requestId: requestId,
            response: txIds.map(tid => ({ transactionId: tid } as SendMoneyResponse)),
            requestPayload,
        } as CustomTransactionCallResponse;
    }

    getTransaction(transactionId: string): Promise<any> {
        return this.connection.getProvider()!.web3()!.eth.getTransaction(transactionId);
    }
}