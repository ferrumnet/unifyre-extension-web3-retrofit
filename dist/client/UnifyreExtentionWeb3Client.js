"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifyreExtensionWeb3Client = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const unifyre_extension_sdk_1 = require("unifyre-extension-sdk");
class UnifyreExtensionWeb3Client extends unifyre_extension_sdk_1.UnifyreExtensionKitClient {
    constructor(appId, currencyList, connection, tokenFac) {
        super();
        this.appId = appId;
        this.currencyList = currencyList;
        this.connection = connection;
        this.tokenFac = tokenFac;
    }
    setToken(_) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Connects to metamask
     */
    signInWithToken(_) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connection.connect();
        });
    }
    getUserProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            // Cretate a user profile. And get token fetches for addresses.
            const userAddress = this.connection.account() || '';
            ferrum_plumbing_1.ValidationUtils.isTrue(!!userAddress, 'Make sure to initialize the web3 client such as Metamask');
            const addressesF = this.currencyList.get().map((c) => __awaiter(this, void 0, void 0, function* () {
                const [network, tokenAddr] = c.split(':');
                const token = yield this.tokenFac.forToken(tokenAddr);
                return {
                    address: userAddress,
                    addressType: 'ADDRESS',
                    balance: !!userAddress ? yield token.balanceOf(userAddress) : '0',
                    currency: c,
                    humanReadableAddress: userAddress,
                    network,
                    pendingForDeposit: '0',
                    pendingForWithdrawal: '0',
                    symbol: (yield token.getSymbol()) || '',
                    addressWithChecksum: userAddress,
                };
            }));
            const addresses = yield Promise.all(addressesF);
            const ag = {
                id: 'ag1',
                addresses,
            };
            const up = {
                appId: this.appId,
                displayName: '',
                userId: '...',
                accountGroups: [
                    ag
                ]
            };
            return up;
        });
    }
    createLinkObject(linkObject) {
        throw new Error("Method not implemented.");
    }
    getLinkObject(linkId) {
        throw new Error("Method not implemented.");
    }
    sendMoneyAsync(toAddress, currency, amount, accountGroupId) {
        throw new Error("Method not implemented.");
    }
    getSendMoneyResponse(requestId) {
        throw new Error("Method not implemented.");
    }
    sendTransactionAsync(network, transactions, payload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Sign and send transaction. Return transaction IDs joined with comma
            ferrum_plumbing_1.ValidationUtils.isTrue(!!transactions && !!transactions.length, '"transactions" must be provided');
            const web3 = this.connection.web3();
            const signedOnes = [];
            for (const tx of transactions) {
                const signed = yield web3.eth.signTransaction(Object.assign(Object.assign({}, tx), { gas: (_a = tx.gas) === null || _a === void 0 ? void 0 : _a.gasLimit, gasPrice: (_b = tx.gas) === null || _b === void 0 ? void 0 : _b.gasPrice, chainId: this.connection.netId() }));
                signedOnes.push(signed);
            }
            const txIds = [];
            for (const tx of signedOnes) {
                const res = yield web3.eth.sendSignedTransaction(tx.raw);
                ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.transactionHash, 'Error broadcasting transaction. No transaction ID was genearted');
                txIds.push(res.transactionHash);
            }
            // We should return a request ID. In this case we just return tx IDs as the request ID
            return txIds.join(',');
        });
    }
    getSendTransactionResponse(requestId, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(requestId.startsWith('0x') || requestId.startsWith('0X'), 'Invalid web3 request ID');
            const txIds = requestId.split(',');
            return {
                rejected: false,
                requestId: requestId,
                response: txIds.map(tid => ({ transactionId: tid })),
            };
        });
    }
    getTransaction(transactionId) {
        return this.connection.web3().eth.getTransaction(transactionId);
    }
}
exports.UnifyreExtensionWeb3Client = UnifyreExtensionWeb3Client;
//# sourceMappingURL=UnifyreExtentionWeb3Client.js.map