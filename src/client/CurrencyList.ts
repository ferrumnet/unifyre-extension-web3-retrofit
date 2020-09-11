
export class CurrencyList {
    private currencies: string[];
    constructor(currencies: string[]) {
        this.currencies = [...currencies];
    }

    get() { return [...this.currencies]; }

    set(currencies: string[]) {
        this.currencies = [...currencies];
    }
}