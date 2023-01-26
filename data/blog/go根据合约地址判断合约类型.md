---
title: Golang根据合约地址判断合约类型
date: '2023-01-08'
tags: ['go', 'ethereum', 'smart contract']
draft: false
summary: go根据合约地址判断合约类型
---

# go根据合约地址判断合约类型

```go
package test

import(
    "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/metachris/eth-go-bindings/erc165"
	"github.com/metachris/eth-go-bindings/erc721"
	"github.com/metachris/eth-go-bindings/erc20"
)

func isERC721ThenGetName(address common.Address, client *ethclient.Client) (bool, string) {
	token, err := erc721.NewErc721(address, client)
	if err != nil {
		return false, "create contract err"
	}
	supportsMetadata, err := token.SupportsInterface(nil, erc165.InterfaceIdErc721Metadata)
	if err != nil {
		return false, "call si err "
	}
	name, err := token.Name(nil)
	if err != nil {
		return true, "no name"
	}

	// Invoke the ERC165 SupportsInterface method
	return supportsMetadata, name
}
func GetContractTypeAndName(address common.Address, client *ethclient.Client) (uint64,string, error){
	var err error
	nft ,err :=erc165.NewErc165(address,client)
	if err != nil {
		token ,err := erc20.NewErc20(address,client)
		if err!=nil{
			return 0,"",err
		}
		name,err := token.Name(nil)
		if err!=nil{
			return 20,"",err
		}
		return 20, name,err
	}else{
		is721, err := nft.SupportsInterface(nil, erc165.InterfaceIdErc721Metadata)
		if err!=nil {
			return 165,"",err
		}
		if !is721{
			return 1155,"no name",nil
		}else{
			token, err := erc721.NewErc721(address, client)
			if err!=nil {
				return 721,"",err
			}
			name ,err := token.Name(nil)
			if err != nil{
				return 721,"",err
			}
			return 721, name,nil
		}
	}
}

```
