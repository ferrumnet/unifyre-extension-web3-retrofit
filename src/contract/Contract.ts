import { Injectable, LocalCache, ValidationUtils } from 'ferrum-plumbing';
import FerrumJson from './FerrumToken.json'
import { Big } from 'big.js';
import { Connect } from './Connect';
import Web3 from 'web3';

export class ContractCallError extends Error {
    constructor(msg: string, public error: any) {
      super(msg);
    }
}

class ContractBase {
    constructor(protected connection: Connect) {
    }
  
    sendTransactionParams(sender: string, gas: string) {
      return {
        from: sender, gas
      };
    }
  
    async contractExist(contractAddress: string) {
      const code = await this.connection.getProvider()!.web3()!.eth.getCode(contractAddress);
      return code.length > 4;
    }
  
    /**
       * Calls a contract, receives transaction ID.
       * * fun should return a method transactions
       */
    async callContractWrapper(topic: string, sender: string,
        fun: () => any) {
      try {
        const method = fun();
        const gas = await method.estimateGas();
        const txId = await (new Promise((resolve, reject) => {
          method.send(this.sendTransactionParams(sender, gas))
            .on('transactionHash', (tid: string) => resolve(tid))
            .catch((e: Error) => reject(e));
        }));
        if (!txId) {
          throw new ContractCallError(`Calling contract for '${topic}' returned no transaction ID`, undefined);
        }
        return txId;
      } catch (e) {
        if (e instanceof ContractCallError) {
          throw e;
        }
        console.error(e);
        throw new ContractCallError(`Error calling contract method: ${topic}`, e);
      }
    }
  }

export class TokenContractFactory implements Injectable {
    private cache: LocalCache;
    constructor(private connection: Connect) {
        this.cache = new LocalCache();
     }
    __name__() { return 'TokenContractFactory'; }

    async forToken(token: string) {
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        return this.cache.getAsync(token, async () => {
          const con = new TokenContract(this.connection);
          await con.init(token);
          return con;
        });
    }
}

export async function tryWithBytes32(web3: any, name: string, address: string, fun: () => Promise<any>) {
    try {
        return await fun();
    } catch(e) {
        const cont = new web3.eth.Contract([{
            "constant": true,
            "inputs": [],
            "name": name,
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }], address);
        const val = await cont.methods[name]().call();
        return Web3.utils.hexToUtf8(val);
    }
}

export class TokenContract extends ContractBase {
    private contract: any;
    private name?: string;
    private symbol?: string;
    private decimals?: number;
    constructor(connection: Connect) {
      super(connection);
      this.rawToAmount = this.rawToAmount.bind(this);
      this.amountToRaw = this.amountToRaw.bind(this);
    }

    async init(tokenAddress: string) {
      if (!await this.contractExist(tokenAddress)) {
        throw new ContractCallError(`Token contract '${tokenAddress}' not found. Make sure metamask is connected to the right network`, null);
      }
      const web3 = this.connection.getProvider()!.web3()!;
      this.contract = await new web3.eth.Contract(FerrumJson.abi as any, tokenAddress);
      this.name = await tryWithBytes32(web3, 'name', tokenAddress, 
        async () => this.contract.methods.name.call().call());
      this.symbol = await tryWithBytes32(web3, 'symbol', tokenAddress, 
        async () => this.contract.methods.symbol.call().call());
      this.decimals = await this.contract.methods.decimals.call().call();
   } 
  
    async balanceOf(address: string) {
      return this.rawToAmount(await this.contract.methods.balanceOf(address).call());
    }
  
    async allowance(userAddress: string, contractAddress: string) {
      return this.rawToAmount(await this.contract.methods.allowance(userAddress, contractAddress).call());
    }

    getName() { return this.name; }

    getSymbol() { return this.symbol; }
  
    amountToRaw(amount: string) {
      return new Big(amount).mul(10 ** this.decimals!).toFixed();
    }
  
    rawToAmount(raw: string) {
      return new Big(raw).div(10 ** this.decimals!).toFixed();
    }
  
    async approve(userAddress: string, target: string, amount: string) {
      const rawAmount = this.amountToRaw(amount);
      return this.callContractWrapper('APPROVE',
        userAddress,
        () => this.contract.methods.approve(target, rawAmount));
    }
}
