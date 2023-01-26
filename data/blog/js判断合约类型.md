---
title: js判断合约类型
date: '2023-01-08'
tags: ['js', 'ethereum', 'smart contract']
draft: false
summary: js判断合约类型
---
# js判断合约类型

* 判断是否为合约

```typescript
const isContract = async (address : string)=>{
        const {userProvider} = useUserStore()
        if(!address){
            return false
        }
        try {
            const code = await userProvider.httpProvider.getCode(address);
            if (code !== '0x') return true;
          } catch (error) {
            console.log(error);
          }
          return false
    },
```

* 根据abi来判断是否为ERC20合约

```typescript
const  isErc20ByAbi = (abi)=> {//ERC20abi文件
        const signatures = new Set();
        for (const i of abi['abi']) {
          signatures.add(`${ i.name }(${ i.inputs.map(inp => inp.type).join(",") })`);
        }
        return signatures.has("transfer(address,uint256)")
          && signatures.has("transferFrom(address,address,uint256)")
          && signatures.has("approve(address,uint256)")
          && signatures.has("decimals()")
          && signatures.has("totalSupply()")
          && signatures.has("balanceOf(address)");
      },
```

* 根据地址判断是否为ERC20合约

```typescript
const isERC20ByAddress = async (address:string) => {
        if(!address.match(/0x[a-fA-F0-9]{40}/)){
            return false
        }
        else if(! await isContract(address)){return false}
        else{
            const {userProvider} = useUserStore()
            const abiERC20=["function decimals() external view returns (uint8)"];
            const contract = new ethers.Contract(address, abiERC20, userProvider.httpProvider);
            try {
              const response = await contract.decimals()
              const decimals = Number(response)
              if (isNaN(decimals)) {
                // Most likely not an ERC20 contract
                return false
              }
              if (decimals >= 0) {
                return true
              }
            } catch (error) {
              console.log(error);
              return false
            }
        }
    },
```

* 根据地址来判断是否为ERC721合约

```typescript
const isERC721ByAddress = async(address:string)=>{
        if(!address.match(/0x[a-fA-F0-9]{40}/)){
            return false
        }
        else if(! await isContract(address)){return false}
        else{
            const {userProvider} = useUserStore()
            const abiERC721 = [
                // "function name() view returns (string)",
                // "function symbol() view returns (string)",
                "function supportsInterface(bytes4) public view returns(bool)",
            ];
            const contractERC721 = new ethers.Contract(address, abiERC721, userProvider.httpProvider)
            const selectorERC721 = "0x80ac58cd"
            /**
             * const _INTERFACE_ID_IERC165 = '0x01ffc9a7';
                const _INTERFACE_ID_IERC721 = '0x80ac58cd';
                const _INTERFACE_ID_IERC721METADATA = '0x5b5e139f';
                const _INTERFACE_ID_IERC721ENUMERABLE = '0x780e9d63';
                1155:0xd9b67a26
             */
            const isERC721 = await contractERC721.supportsInterface(selectorERC721)
            return isERC721
  
        }
      
    }
```

* 根据合约地址来获取合约类型

```typescript
const getContractType = async(address:string)=>{
        if(!address.match(/0x[a-fA-F0-9]{40}/)){
            return 0
        }else if(! await isContract(address)){
            return 0
        }else{
            const {userProvider} = useUserStore()
            const abiERC721 = ["function supportsInterface(bytes4) public view returns(bool)"];
            const contractERC721 = new ethers.Contract(address, abiERC721, userProvider.httpProvider)
            const selectorERC721 = "0x80ac58cd"
            const selectorERC1155 = "0xd9b67a26"
            try {
                const isERC721 = await contractERC721.supportsInterface(selectorERC721)
                if(isERC721)return 721  
                const isERC1155 = await contractERC721.supportsInterface(selectorERC1155)
                if(isERC1155)return 1155
                else{
                  
                }
            } catch (error) {
                const abiERC20=["function decimals() external view returns (uint8)"];
                const contract = new ethers.Contract(address, abiERC20, userProvider.httpProvider);
                try {
                const response = await contract.decimals()
                const decimals = Number(response)
                if (isNaN(decimals)) {
                    // Most likely not an ERC20 contract
                    return 0
                }
                if (decimals >= 0) {
                    // Most likely an ERC20 contract
                    return 20
                }
                } catch (error) {
                // Unable to determine if it's ERC20 due to error
                // This might mean that the contract is not an ERC20, or that something else happened
                console.log(error);
                    return 0
                }
            }
        }
    },
```
