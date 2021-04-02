"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eipTransactionRequest = exports.eip712Json = void 0;
const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];
function eip712Json(domain, dataType, primaryType, message) {
    return JSON.stringify({
        types: Object.assign({ EIP712Domain: domainType }, dataType),
        domain: domain,
        primaryType,
        message,
    });
}
exports.eip712Json = eip712Json;
function eipTransactionRequest(web3, signerAddress, eipJsonData) {
    const signerChecksum = web3.utils.toChecksumAddress(signerAddress);
    return ({
        method: "eth_signTypedData_v4",
        params: [signerChecksum, eipJsonData],
        from: signerChecksum
    });
}
exports.eipTransactionRequest = eipTransactionRequest;
//# sourceMappingURL=Eip712.js.map