import { Container, Module } from "ferrum-plumbing";
import { CurrencyList } from "./client/CurrencyList";
import { UnifyreExtensionWeb3Client } from "./client/UnifyreExtentionWeb3Client";
import { Connect } from "./contract/Connect";
import { TokenContractFactory } from "./contract/Contract";

export class Web3RetrofitModule implements Module {
    constructor(private appId: string, private initialCurrencies: string[]) {
    }

    async configAsync(c: Container): Promise<void> {
        c.registerSingleton(Connect, () => new Connect());
        c.registerSingleton(CurrencyList, () => new CurrencyList(this.initialCurrencies));
        c.registerSingleton(TokenContractFactory, c => new TokenContractFactory(c.get(Connect)))
        c.registerSingleton(UnifyreExtensionWeb3Client, c =>
            new UnifyreExtensionWeb3Client(this.appId, c.get(CurrencyList), c.get(Connect),
            c.get(TokenContractFactory)));
    }
}