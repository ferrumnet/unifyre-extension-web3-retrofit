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
exports.Connect = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const Networks_1 = require("ferrum-plumbing/dist/models/types/Networks");
const web3_1 = __importDefault(require("web3"));
class MetamaskProvider {
    constructor() {
        this._conneted = false;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const prov = this.getProvider();
            this._web3 = new web3_1.default(prov);
            if (prov.enable) {
                yield prov.enable();
            }
            this._conneted = true;
        });
    }
    isCached() { return false; }
    netId() {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this._web3, 'Connect first');
            return yield this._web3.eth.getChainId();
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
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    connected() {
        return this._conneted;
    }
    addEventListener(_, fun) {
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            window.ethereum.on('accountsChanged', () => {
                this._conneted = false;
                fun('Account disconnected or changed');
            });
        }
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
    send(request) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this._web3, 'Connect first');
        return new Promise((resolve, reject) => {
            this._web3.currentProvider.send(request, (e, h) => {
                if (!!e) {
                    reject(e);
                }
                else {
                    resolve(h === null || h === void 0 ? void 0 : h.result);
                }
            });
        });
    }
    getProvider() {
        if (!this._provider) {
            // @ts-ignore
            const win = window || {};
            if (win.ethereum) {
                this._provider = win.ethereum;
            }
            else if (win.web3) {
                this._provider = win.web3.currentProvider;
            }
            else {
                const error = 'No Web3 provider such as Metamask was detected';
                throw error;
            }
        }
        return this._provider;
    }
}
class Connect {
    constructor() {
        this._provider = new MetamaskProvider();
    }
    __name__() { return 'Connect'; }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const prov = this._provider;
            yield prov.connect();
            yield this.reset();
            return this._account;
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            const prov = this._provider;
            this._netId = yield prov.netId();
            const accounts = yield prov.getAccounts();
            this._account = accounts[0];
        });
    }
    setProvider(prov) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!prov, '"provider" must be provided');
        this._provider = prov;
    }
    getProvider() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this._provider, 'Make sure to initialize before using "getProvider"');
        return this._provider;
    }
    connected() {
        return this._provider && this.getProvider().connected();
    }
    netId() {
        return this._netId;
    }
    network() {
        return Networks_1.Networks.forChainId(this._netId).id;
    }
    account() {
        return this._account;
    }
}
exports.Connect = Connect;
//# sourceMappingURL=Connect.js.map