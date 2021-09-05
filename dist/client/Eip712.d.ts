import Web3 from "web3";
export interface DomainSeparator {
    name: string;
    version: string;
    chainId: string;
    verifyingContract: string;
}
export interface Eip712TypeItem {
    name: string;
    type: 'string' | 'uint256' | 'address' | 'bytes32';
}
export declare type Eip712Type = Eip712TypeItem[];
export interface Eip712TypeDefinition {
    [key: string]: Eip712Type;
}
export declare function eip712Json(domain: DomainSeparator, dataType: Eip712TypeDefinition, primaryType: string, message: any): string;
export declare function eipTransactionRequest(web3: Web3, signerAddress: string, eipJsonData: string): {
    method: string;
    params: string[];
    from: string;
};
//# sourceMappingURL=Eip712.d.ts.map