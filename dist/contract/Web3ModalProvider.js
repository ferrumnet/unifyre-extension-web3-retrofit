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
exports.Web3ModalProvider = void 0;
const web3modal_1 = __importDefault(require("web3modal"));
const web3_1 = __importDefault(require("web3"));
// @ts-ignore
const web3_provider_1 = __importDefault(require("@walletconnect/web3-provider"));
const ferrum_plumbing_1 = require("ferrum-plumbing");
class Web3ModalProvider {
    constructor(web3Providers) {
        this.web3Providers = web3Providers;
        this._connected = false;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const modal = this.getModal();
            if (modal.cachedProvider) {
                this._provider = modal.cachedProvider;
            }
            else {
                this._provider = yield modal.connect();
            }
            this._web3 = new web3_1.default(this._provider);
            this.initWeb3();
            this.subscribeProvider();
            this._connected = true;
        });
    }
    isCached() {
        return !!this.getModal().cachedProvider;
    }
    getModal() {
        this._modal = this._modal || new web3modal_1.default({
            // network: "mainnet", 
            cacheProvider: true,
            providerOptions: this.providerOptions(),
        });
        return this._modal;
    }
    providerOptions() {
        return {
            walletconnect: {
                package: web3_provider_1.default,
                rpc: {
                    1: this.web3Providers['ETHEREUM'],
                    4: this.web3Providers['RINKEBY'],
                }
            },
        };
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._disconnect();
        });
    }
    _disconnect(error, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._modal) {
                this._modal.clearCachedProvider();
            }
            if (this._provider) {
                const prov = this._provider;
                try {
                    if (prov.close) {
                        yield prov.close();
                    }
                    if (prov.connection && prov.connection.isWalletConnect) {
                        yield prov.connection._walletConnector.killSession();
                    }
                }
                catch (e) {
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
                    onDisc(error === null || error === void 0 ? void 0 : error.message);
                }
                else {
                    onDisc(payload);
                }
            }
        });
    }
    connected() {
        if (!this._provider) {
            return false;
        }
        const prov = this._provider;
        if (prov.connection && prov.connection.isWalletConnect) {
            return prov.connection._walletConnector.connected;
        }
        return this._connected;
    }
    addEventListener(event, fun) {
        this._onDisconnect = fun;
        const prov = this._provider;
        if (prov) {
            prov.on("close", (error, payload) => {
                console.error('Provider disconnected', error);
                this._disconnect(error, payload);
            });
        }
    }
    netId() {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this._web3, 'Connect first');
            return yield this._web3.eth.net.getId();
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this._web3, 'Connect first');
            const accounts = yield this._web3.eth.getAccounts();
            const account = accounts[0];
            ferrum_plumbing_1.ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
            return accounts;
        });
    }
    web3() {
        return this._web3;
    }
    sendTransaction(tx) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return new Promise((resolve, reject) => {
            this._web3.eth.sendTransaction(tx, (e, h) => {
                if (!!e) {
                    reject(e);
                }
                else {
                    resolve(h);
                }
            }).catch(reject);
        });
    }
    subscribeProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this._provider;
            if (!provider.on) {
                return;
            }
            provider.on("close", () => this.disconnect());
            provider.on("accountsChanged", (accounts) => __awaiter(this, void 0, void 0, function* () {
                this.disconnect();
            }));
            provider.on("chainChanged", (chainId) => __awaiter(this, void 0, void 0, function* () {
                this.disconnect();
            }));
            provider.on("networkChanged", (networkId) => __awaiter(this, void 0, void 0, function* () {
                this.disconnect();
            }));
        });
    }
    initWeb3() {
        this._web3.eth.extend({
            methods: [
                {
                    name: "chainId",
                    call: "eth_chainId",
                    outputFormatter: this._web3.utils.hexToNumber
                }
            ]
        });
    }
}
exports.Web3ModalProvider = Web3ModalProvider;
//# sourceMappingURL=Web3ModalProvider.js.map