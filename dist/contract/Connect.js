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
            // @ts-ignore
            const win = window || {};
            if (win.ethereum) {
                this._web3 = new web3_1.default(win.ethereum);
                yield win.ethereum.enable();
            }
            else if (win.web3) {
                this._web3 = new web3_1.default(win.web3.currentProvider);
            }
            else {
                const error = 'Metamask Not Detected';
                throw error;
            }
            this._netId = yield this._web3.eth.net.getId();
            const account = this._web3.defaultAccount;
            ferrum_plumbing_1.ValidationUtils.isTrue(!!account, 'There is no default account selected for metamask');
            this._account = account;
        });
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