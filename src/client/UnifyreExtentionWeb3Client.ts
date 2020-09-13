import { Network, ValidationUtils } from "ferrum-plumbing";
import { Connect } from "src/contract/Connect";
import { TokenContractFactory } from "src/contract/Contract";
import { CustomTransactionCallRequest, CustomTransactionCallResponse, SendMoneyResponse, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { AddressDetails, AppUserProfile, UserAccountGroup } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { CurrencyList } from "./CurrencyList";
import { TransactionConfig, RLPEncodedTransaction } from 'web3-eth';

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
        return this.connection.connect();
    }

    async getUserProfile(): Promise<AppUserProfile> {
        // Cretate a user profile. And get token fetches for addresses.
        const userAddress = this.connection.account() || '';
        ValidationUtils.isTrue(!!userAddress, 'Make sure to initialize the web3 client such as Metamask');
        const addressesF = this.currencyList.get().map(async c => {
            const [network, tokenAddr] = c.split(':');
            const token = await this.tokenFac.forToken(tokenAddr);
            return {
                address: userAddress,
                addressType: 'ADDRESS',
                balance: !!userAddress ? await token.balanceOf(userAddress) : '0',
                currency: c,
                humanReadableAddress: userAddress,
                network,
                pendingForDeposit: '0',
                pendingForWithdrawal: '0',
                symbol: await token.getSymbol() || '',
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
            userId: '...',
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

    async sendTransactionAsync(network: Network, transactions: CustomTransactionCallRequest[]):
    Promise<string> {
        // Sign and send transaction. Return transaction IDs joined with comma
        ValidationUtils.isTrue(!!transactions && !!transactions.length, '"transactions" must be provided');
        const web3 = this.connection.web3()!;
        const signedOnes: RLPEncodedTransaction[] = [];
        for (const tx of transactions) {
            const signed = await web3.eth.signTransaction({
                ...tx,
                gas: tx.gas?.gasLimit,
                gasPrice: tx.gas?.gasPrice,
                chainId: this.connection.netId()
            } as TransactionConfig);
            signedOnes.push(signed);
        }
        const txIds: string[] = [];
        for (const tx of signedOnes) {
            const res = await web3.eth.sendSignedTransaction(tx.raw);
            ValidationUtils.isTrue(!!res && !!res.transactionHash,
                'Error broadcasting transaction. No transaction ID was genearted');
            txIds.push(res.transactionHash);
        }
        // We should return a request ID. In this case we just return tx IDs as the request ID
        return txIds.join(',');
    }

    async getSendTransactionResponse(requestId: string, timeout?: number): Promise<CustomTransactionCallResponse> {
        ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
        ValidationUtils.isTrue(requestId.startsWith('0x') || requestId.startsWith('0X'), 'Invalid web3 request ID');
        const txIds = requestId.split(',');
        return {
            rejected: false,
            requestId: requestId,
            response: txIds.map(tid => ({ transactionId: tid } as SendMoneyResponse)),
        } as CustomTransactionCallResponse;
    }

    getTransaction(transactionId: string): Promise<any> {
        return this.connection.web3()!.eth.getTransaction(transactionId);
    }
}