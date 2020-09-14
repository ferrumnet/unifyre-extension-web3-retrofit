import { Container, Module } from "ferrum-plumbing";
export declare class Web3RetrofitModule implements Module {
    private appId;
    private initialCurrencies;
    constructor(appId: string, initialCurrencies: string[]);
    configAsync(c: Container): Promise<void>;
}
//# sourceMappingURL=Web3RetrofitModule.d.ts.map