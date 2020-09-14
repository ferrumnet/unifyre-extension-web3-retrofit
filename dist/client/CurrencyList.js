"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyList = void 0;
class CurrencyList {
    constructor(currencies) {
        this.currencies = [...currencies];
    }
    get() { return [...this.currencies]; }
    set(currencies) {
        this.currencies = [...currencies];
    }
}
exports.CurrencyList = CurrencyList;
//# sourceMappingURL=CurrencyList.js.map