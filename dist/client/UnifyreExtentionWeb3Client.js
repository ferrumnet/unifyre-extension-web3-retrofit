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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifyreExtensionWeb3Client = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const unifyre_extension_sdk_1 = require("unifyre-extension-sdk");
const web3_1 = __importDefault(require("web3"));
const Networks_1 = require("ferrum-plumbing/dist/models/types/Networks");
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
            yield this.connection.connect();
        });
    }
    getUserProfile() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Cretate a user profile. And get token fetches for addresses.
            const userAddress = this.connection.account() || '';
            ferrum_plumbing_1.ValidationUtils.isTrue(!!userAddress, 'Make sure to initialize the web3 client such as Metamask');
            const currentNet = this.connection.network();
            const networkPrefix = `${currentNet}:`;
            const currencies = this.currencyList.get().filter(c => c.startsWith(networkPrefix));
            const web3 = (_a = this.connection.getProvider()) === null || _a === void 0 ? void 0 : _a.web3();
            const addressesF = currencies.map((c) => __awaiter(this, void 0, void 0, function* () {
                const [network, tokenAddr] = c.split(':');
                let balance = '0';
                let symbol = '';
                const netObj = Networks_1.Networks.for(network);
                if (network === currentNet) {
                    if (netObj.baseSymbol === tokenAddr) {
                        symbol = tokenAddr;
                        if (!!web3) {
                            balance = web3_1.default.utils.fromWei(yield web3.eth.getBalance(userAddress));
                        }
                        else {
                            balance = '0';
                        }
                    }
                    else {
                        const token = yield this.tokenFac.forToken(tokenAddr);
                        if (!!userAddress) {
                            balance = yield token.balanceOf(userAddress);
                        }
                        symbol = yield token.getSymbol();
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
                userId: userAddress,
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
        return __awaiter(this, void 0, void 0, function* () {
            // Sign and send transaction. Return transaction IDs joined with comma
            ferrum_plumbing_1.ValidationUtils.isTrue(!!transactions && !!transactions.length, '"transactions" must be provided');
            const txIds = [];
            for (const tx of transactions) {
                const txId = yield new Promise((resolve, reject) => {
                    var _a;
                    return this.connection.getProvider().sendTransaction({
                        from: tx.from,
                        to: tx.contract,
                        value: tx.value || '0x',
                        data: tx.data,
                        gas: (_a = tx.gas) === null || _a === void 0 ? void 0 : _a.gasLimit,
                    })
                        .then(h => resolve(h)).catch(reject);
                });
                txIds.push(txId);
            }
            // We should return a request ID. In this case we just return tx IDs as the request ID
            return txIds.join(',') + '|' + JSON.stringify(payload || '');
        });
    }
    // TODO: Manage with sign (for unifyre)
    sendAsync(request, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sign and send transaction. Return transaction IDs joined with comma
            ferrum_plumbing_1.ValidationUtils.isTrue(!!request, '"request" must be provided');
            const rv = yield this.connection.getProvider().send(request);
            // We should return a request ID. In this case we just return result as the request ID
            return rv + '|' + JSON.stringify(payload || '');
        });
    }
    getSendTransactionResponse(requestId, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!requestId, '"requestId" must be provided');
            ferrum_plumbing_1.ValidationUtils.isTrue(requestId.startsWith('0x') || requestId.startsWith('0X'), 'Invalid web3 request ID');
            const [txIdPart, payloadPart] = requestId.split('|');
            const txIds = txIdPart.split(',');
            const requestPayload = JSON.parse(payloadPart);
            return {
                rejected: false,
                requestId: requestId,
                response: txIds.map(tid => ({ transactionId: tid })),
                requestPayload,
            };
        });
    }
    getTransaction(transactionId) {
        return this.connection.getProvider().web3().eth.getTransaction(transactionId);
    }
}
exports.UnifyreExtensionWeb3Client = UnifyreExtensionWeb3Client;
//# sourceMappingURL=UnifyreExtentionWeb3Client.js.map