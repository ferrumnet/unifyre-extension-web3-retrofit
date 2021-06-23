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
exports.WalletConnectWeb3Provider = void 0;
const client_1 = __importDefault(require("@walletconnect/client"));
const qrcode_modal_1 = __importDefault(require("@walletconnect/qrcode-modal"));
const ferrum_plumbing_1 = require("ferrum-plumbing");
const web3_1 = __importDefault(require("web3"));
const CHAIN_ID_MAP = {
    1: 'ETHEREUM',
    4: 'RINKEBY',
    137: 'MATIC',
    80001: 'MUMBAI_TESTNET',
    56: 'BSC',
    97: 'BSC_TESTNET',
};
class WalletConnectWeb3Provider {
    constructor(web3Providers) {
        this.web3Providers = web3Providers;
    }
    __name__() { return 'WalletConnectWeb3Provider'; }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connector) {
                this.connector = new client_1.default({
                    bridge: "https://bridge.walletconnect.org",
                    qrcodeModal: qrcode_modal_1.default,
                });
            }
            // Check if connection is already established
            if (!this.connector.connected) {
                // create new session
                yield this.connector.createSession();
                const connectPromise = new Promise((resolve, reject) => {
                    // Subscribe to connection events
                    this.connector.on("connect", (error, payload) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            console.log('Wallet connect ceonnected ', payload);
                            this.setWeb3();
                            resolve();
                        }
                    });
                });
                return connectPromise;
            }
            else {
                this.setWeb3();
            }
        });
    }
    isCached() {
        // TODO: Get from the session cache
        return false;
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connector.killSession();
        });
    }
    connected() {
        var _a;
        return ((_a = this.connector) === null || _a === void 0 ? void 0 : _a.connected) || false;
    }
    addEventListener(event, fun) {
        this.connector.on(event, (error, payload) => {
            console.error('Wallet connect disconnected', error);
            if (error) {
                fun(error === null || error === void 0 ? void 0 : error.message);
            }
            else {
                fun(payload);
            }
        });
    }
    netId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connector.chainId;
        });
    }
    getAccounts() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = this.connector) === null || _a === void 0 ? void 0 : _a.accounts) || [];
        });
    }
    sendTransaction(tx) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.connector, 'Connect first');
        return this.connector.sendTransaction(tx);
    }
    send(request) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.connector, 'Connect first');
            throw new Error('Not implemented for wallet connect');
            return '';
        });
    }
    web3() {
        return this._web3;
    }
    setWeb3() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.connector, 'Connect first');
        if (this._web3) {
            return;
        }
        const chainId = this.connector.chainId;
        const chainName = CHAIN_ID_MAP[chainId];
        ferrum_plumbing_1.ValidationUtils.isTrue(!!chainName, `Selected chain with ID ${chainId} is not supported`);
        const httpUrl = this.web3Providers[chainName];
        ferrum_plumbing_1.ValidationUtils.isTrue(!!httpUrl, `No http provider is set for  ${chainName}`);
        this._web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(httpUrl));
    }
}
exports.WalletConnectWeb3Provider = WalletConnectWeb3Provider;
//# sourceMappingURL=WalletConnectWeb3Provider.js.map