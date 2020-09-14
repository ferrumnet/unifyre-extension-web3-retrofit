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
exports.deployContrat = void 0;
function deployContrat(web3, abi, bytecode, constructorArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        const accounts = yield web3.eth.getAccounts();
        const [ac1] = accounts;
        const owner = ac1;
        try {
            console.log('CONSTRUCTOR ARGS', constructorArgs);
            const festaking = yield new web3.eth.Contract(abi)
                .deploy({ data: `0x${bytecode}`, arguments: constructorArgs });
            const gas = yield festaking.estimateGas();
            const contract = yield festaking.send({ from: owner, gas });
            if (contract._address) {
                throw new Error(`Contract deployed with address: ${contract._address}`);
            }
            return contract._address;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
exports.deployContrat = deployContrat;
//# sourceMappingURL=DeployContract.js.map