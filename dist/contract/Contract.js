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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenContract = exports.TokenContractFactory = exports.ContractCallError = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const FerrumToken_json_1 = __importDefault(require("./FerrumToken.json"));
const big_js_1 = require("big.js");
class ContractCallError extends Error {
    constructor(msg, error) {
        super(msg);
        this.error = error;
    }
}
exports.ContractCallError = ContractCallError;
class ContractBase {
    constructor(connection) {
        this.connection = connection;
    }
    sendTransactionParams(sender, gas) {
        return {
            from: sender, gas
        };
    }
    contractExist(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = yield this.connection.web3().eth.getCode(contractAddress);
            return code.length > 4;
        });
    }
    /**
       * Calls a contract, receives transaction ID.
       * * fun should return a method transactions
       */
    callContractWrapper(topic, sender, fun) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const method = fun();
                const gas = yield method.estimateGas();
                const txId = yield (new Promise((resolve, reject) => {
                    method.send(this.sendTransactionParams(sender, gas))
                        .on('transactionHash', (tid) => resolve(tid))
                        .catch((e) => reject(e));
                }));
                if (!txId) {
                    throw new ContractCallError(`Calling contract for '${topic}' returned no transaction ID`, undefined);
                }
                return txId;
            }
            catch (e) {
                if (e instanceof ContractCallError) {
                    throw e;
                }
                console.error(e);
                throw new ContractCallError(`Error calling contract method: ${topic}`, e);
            }
        });
    }
}
class TokenContractFactory {
    constructor(connection) {
        this.connection = connection;
        this.cache = new ferrum_plumbing_1.LocalCache();
    }
    __name__() { return 'TokenContractFactory'; }
    forToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!token, '"token" must be provided');
            return this.cache.getAsync(token, () => __awaiter(this, void 0, void 0, function* () {
                const con = new TokenContract(this.connection);
                yield con.init(token);
                return con;
            }));
        });
    }
}
exports.TokenContractFactory = TokenContractFactory;
class TokenContract extends ContractBase {
    constructor(connection) {
        super(connection);
        this.rawToAmount = this.rawToAmount.bind(this);
        this.amountToRaw = this.amountToRaw.bind(this);
    }
    init(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.contractExist(tokenAddress))) {
                throw new ContractCallError(`Token contract '${tokenAddress}' not found. Make sure metamask is connected to the right network`, null);
            }
            const web3 = this.connection.web3();
            this.contract = yield new web3.eth.Contract(FerrumToken_json_1.default.abi, tokenAddress);
            this.name = yield this.contract.methods.name.call().call();
            this.symbol = yield this.contract.methods.symbol.call().call();
            this.decimals = yield this.contract.methods.decimals.call().call();
        });
    }
    balanceOf(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rawToAmount(yield this.contract.methods.balanceOf(address).call());
        });
    }
    allowance(userAddress, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rawToAmount(yield this.contract.methods.allowance(userAddress, contractAddress).call());
        });
    }
    getName() { return this.name; }
    getSymbol() { return this.symbol; }
    amountToRaw(amount) {
        return new big_js_1.Big(amount).mul(Math.pow(10, this.decimals)).toFixed();
    }
    rawToAmount(raw) {
        return new big_js_1.Big(raw).div(Math.pow(10, this.decimals)).toFixed();
    }
    approve(userAddress, target, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawAmount = this.amountToRaw(amount);
            return this.callContractWrapper('APPROVE', userAddress, () => this.contract.methods.approve(target, rawAmount));
        });
    }
}
exports.TokenContract = TokenContract;
//# sourceMappingURL=Contract.js.map