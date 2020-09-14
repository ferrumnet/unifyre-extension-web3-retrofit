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
exports.Web3RetrofitModule = void 0;
const CurrencyList_1 = require("./client/CurrencyList");
const UnifyreExtentionWeb3Client_1 = require("./client/UnifyreExtentionWeb3Client");
const Connect_1 = require("./contract/Connect");
const Contract_1 = require("./contract/Contract");
class Web3RetrofitModule {
    constructor(appId, initialCurrencies) {
        this.appId = appId;
        this.initialCurrencies = initialCurrencies;
    }
    configAsync(c) {
        return __awaiter(this, void 0, void 0, function* () {
            c.registerSingleton(Connect_1.Connect, () => new Connect_1.Connect());
            c.registerSingleton(CurrencyList_1.CurrencyList, () => new CurrencyList_1.CurrencyList(this.initialCurrencies));
            c.registerSingleton(Contract_1.TokenContractFactory, c => new Contract_1.TokenContractFactory(c.get(Connect_1.Connect)));
            c.registerSingleton(UnifyreExtentionWeb3Client_1.UnifyreExtensionWeb3Client, c => new UnifyreExtentionWeb3Client_1.UnifyreExtensionWeb3Client(this.appId, c.get(CurrencyList_1.CurrencyList), c.get(Connect_1.Connect), c.get(Contract_1.TokenContractFactory)));
        });
    }
}
exports.Web3RetrofitModule = Web3RetrofitModule;
//# sourceMappingURL=Web3RetrofitModule.js.map