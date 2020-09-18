import { Injectable } from "ferrum-plumbing";

export class CurrencyList implements Injectable {
    private currencies: string[];
    constructor(currencies: string[]) {
        this.currencies = [...currencies];
    }
    __name__() { return 'CurrencyList'; }

    get() { return [...this.currencies]; }

    set(currencies: string[]) {
        this.currencies = [...currencies];
    }
}