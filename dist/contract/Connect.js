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
const web3_1 = __importDefault(require("web3"));
class Connect {
    constructor() { }
    __name__() { return 'Connect'; }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const prov = this.getProvider();
            this._web3 = new web3_1.default(prov);
            if (prov.enable) {
                yield prov.enable();
            }
            this._netId = yield this._web3.eth.net.getId();
            const accounts = yield this._web3.eth.getAccounts();
            const account = accounts[0];
            ferrum_plumbing_1.ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
            this._account = account;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const prov = this.getProvider();
            if (prov.disconnet) {
                yield prov.disconnet();
            }
        });
    }
    clearProvider() {
        this._provider = undefined;
    }
    setProvider(prov) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!prov, '"provider" must be provided');
        this._provider = prov;
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
    web3() {
        return this._web3;
    }
    netId() {
        return this._netId;
    }
    network() {
        switch (this.netId()) {
            case 1:
                return 'ETHEREUM';
            case 4:
                return 'RINKEBY';
        }
    }
    account() {
        return this._account;
    }
}
exports.Connect = Connect;
//# sourceMappingURL=Connect.js.map