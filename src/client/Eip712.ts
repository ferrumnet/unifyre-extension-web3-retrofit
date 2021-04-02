import Web3 from "web3";

export interface DomainSeparator {
    name: string;
    version: string;
    chainId: string;
    verifyingContract: string;
    salt: string;
}

export interface Eip712TypeItem {
    name: string;
    type: 'string' | 'uint256' | 'address' | 'bytes32';
}

export type Eip712Type = Eip712TypeItem[];

export interface Eip712TypeDefinition {
    [key: string]: Eip712Type;
}

const domainType: Eip712Type  = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];


export function eip712Json(domain: DomainSeparator,
        dataType: Eip712TypeDefinition, primaryType: string, message: any) {
    return JSON.stringify({
    types: {
        EIP712Domain: domainType,
        ...dataType,
    },
    domain: domain,
    primaryType,
    message,
    });

}

export function eipTransactionRequest(web3: Web3, signerAddress: string, eipJsonData: string) {
    const signerChecksum = web3.utils.toChecksumAddress(signerAddress);
    return ({
          method: "eth_signTypedData_v4",
          params: [signerChecksum, eipJsonData],
          from: signerChecksum
        });
}