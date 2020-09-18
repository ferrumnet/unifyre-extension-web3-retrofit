"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencylist = void 0;
class currencylist {
    constructor(currencies) {
        this.currencies = [...currencies];
    }
    __name__() { return 'CurrencyList'; }
    get() { return [...this.currencies]; }
    set(currencies) {
        this.currencies = [...currencies];
    }
}
exports.currencylist = currencylist;
//# sourceMappingURL=CurrencyList.js.map