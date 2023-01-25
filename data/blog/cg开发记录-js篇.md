---
title: cg开发记录-js篇
date: '2022-10-08'
tags: ['js', 'etherjs']
draft: false
summary: 开发时的一些js问题记录
---
# js

## js中map遍历的三种方法

```js
1、forEach遍历：

    map.forEach((key,val)=>{
        ...//操作
    }
key是属性值，val是属性

2、for of遍历：

    for(let item of map){
        ...
    }
    //遍历键值对数组
    for(let item of map.values()){
        ...
    }
    //遍历属性值
    for(let item of map.keys()){
        ...
    }
    //遍历属性

3、entries遍历：

    for(let [key,val] of map.entries()){
        ...
    }
    //类似forEach遍历
```

## 对象和map互转

```js
// ✅ Convert Object to Map
const map1 = new Map(Object.entries(obj));
console.log(map1); // 👉️ {'id' => 1, 'name' => 'Fred'}

// ✅ Convert Map to Object
const objAgain = Object.fromEntries(map1);
console.log(objAgain); // 👉️ {id: 1, name: 'Fred'}
```

## 调用metamask切换网路

```js
const chainId = 137 // Polygon Mainnet

if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(chainId) }]
        });
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Polygon Mainnet',
                chainId: web3.utils.toHex(chainId),
                nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                rpcUrls: ['https://polygon-rpc.com/']
              }
            ]
          });
        }
      }
    }
```

## 监听metamask网络切换

```js
window.ethereum.on('accountsChanged', function (accounts) {
  // Time to reload your interface with accounts[0]!
})

window.ethereum.on('networkChanged', function (networkId) {
  // Time to reload your interface with the new networkId
})
```

## metamask添加网络

```js
window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
        chainId: "0x89",
        rpcUrls: ["https://rpc-mainnet.matic.network/"],
        chainName: "Matic Mainnet",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
        },
        blockExplorerUrls: ["https://polygonscan.com/"]
    }]
});
```

## 获取metamask当前chainId

```js
window.ethereum.networkVersion
```

## 调用小狐狸授权合约

```js
try{
       const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20.abi, jsonRpcProvider);
       const tx = await contract.approve(CONTRACT_ADDRESS, num);
       await tx.wait();
    }catch(err){
       console.log(err); // nothing
    }
```

## 合约调用gas预估

```js
const erc20Abi = [ /* ... */ ];
const address = "TOKEN_ADDRESS_HERE";
const provider = ethers.getDefaultProvider();
const erc20 = new ethers.Contract(address, abi, provider);

const recipient = "SOME_ADDRESS_HERE";
//预估gas的方法为：await contract.estimateGas.functionName(x, y, z);
const estimation = await erc20.estimateGas.transfer(recipient, 100);

```

## promise错误捕获问题

http://www.caotama.com/319360.html

## js forEach()是同步的

## promise在使用中方法内部的 if 语句千万不能省略 else ，异步的执行往往容易乱序

## input框限制只能数字

```vue
                           <el-input v-model="form.maxFee"  oninput="value=value.replace(/[^0-9.]/g,'')" />
```

## 设置请求频率限制

```js
function throttle(fn, delay) {
    let timer;
    return function(){
        if(!timer) {
            fn.apply(this, arguments)
            timer = setTimeout(()=>{
                clearTimeout(timer)
                timer = null
            },delay)
        }
    }
}
```

```js
//因为mempool中的未决交易很多，每秒上百个，很容易达到免费rpc节点的请求上限，因此我们需要用throttle限制请求频率。
let i = 0
provider.on("pending", async (txHash) => {
    if (txHash && i < 100) {
        // 打印txHash
        console.log(`[${(new Date).toLocaleTimeString()}] 监听Pending交易 ${i}: ${txHash} \r`);
        i++
        }
});
```

TypeScript允许您声明重载，但只能有一个实现，并且该实现必须具有与所有重载兼容的签名。

## promise

### await方式执行promise方法时怎么捕获错误

```js
async function go() {
			try{
				let res = await fn()
			}catch(e){
				console.log(e)
			}
		}
```

**items.map()**的用法

```js
var arr = [数组数据]
arr.map(回调函数)

var items =[1,2,3]
var res = items.map((i)=>{
    return i *2
})
console.log(res)//2,4,6
```

### 自己实现类似Promise.allSettled()的功能

```js
const items = [500, 400, 300, 200, 100]

// 请求出错时，catch错误就可以。当出错时，仍能按顺序执行并输出。

function request(param) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (param === 200) {
      // console.log(param, ' failed')
        return reject({ 
          status: 'error',
          data: param
        })
      }
// console.log(param, ' success')
    resolve({
      status: 'success',
      data: param
      })
    }, param)
  }).catch(err => err)
}

//批量执行promise
Promise.all(items.map(request))
    .then(res => {
console.log(res)
    })
    .catch (err => {
console.log(err)
    })
    .finally(res => {
console.log('end', res)
    })
// 输出 [{…}, {…}, {…}, {stauts: 'error', data: 200}, {…}], end

```

### Promiss.allSettled

```js
const batchMint2 =()=>{
    let a = [1,2,3,4,5]
    Promise.allSettled(a.map(doMinttest)).then((res)=>{
        debugger
    })
}
const doMinttest=(item:any)=>{
    return new Promise(async (resolve,reject) => {
        try {
            if(item===2){
                resolve(2)
            }
            if(item===3){
                resolve({stat:false})
            }
            else{
                reject({status:false,tx:null,msg:'rejectttttttt'})
            }
        } catch (error) {
            reject({tx:null,msg:'error'})
        }
    })
}
```

![image-20221213162749413](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221213162749413.png)

### 当业务场景中需要同时调用相互独立的异步方法时，可以使用Promise.allSettled()方法

比如，在区块链中批量账号去进行操作时

**关于此方法的介绍**

`Promise.allSettled()` 可用于并行执行独立的异步操作，并收集这些操作的结果。

该函数接受一个 `promise` 数组(通常是一个可迭代对象)作为参数:

```
const statusesPromise = Promise.allSettled(promises);
```

当所有的输入 `promises` 都被 `fulfilled` 或 `rejected` 时，`statusesPromise` 会解析为一个具有它们状态的数组

- `{ status: 'fulfilled', value: value }` — 如果对应的 promise 已经 `fulfilled`
- 或者 `{status: 'rejected'， reason: reason}` 如果相应的 promise 已经被 `rejected`

* 注意：返回的结果数组和传入的数组是一一对应的

**使用案例**

```typescript
const f=()=>{
    ...
      tableLoading.value = true
  Promise.allSettled(pvArr.map(ethUtils.getBalanceByPvk)).then((statuses)=>{
    statuses.forEach((i,v)=>{
      if(i.status==='fulfilled'){
        let wal = (i as any).value   
        if(!(Number(wal.balance)>0)as boolean){
          ElMessage({
                message: '已略过没有余额的钱包(无法参与mint)',
                type: 'warning'
            })
        }else{
          walletList.value.push(wal)
          emitter.emit('addWallet',(wal))
          userStore.userWallets.addHashMintPvKey(pvArr[v])
        }
      }
    })
  }).finally(()=>{
    tableLoading.value = false
    ElMessage({
        message: "解析完成！",
        type: 'success'
    });
  })
}

//ethUtil.GetBalanceByPvk
getBalanceByPvk:async(address:string)=>{
        return new Promise(async(resolve,reject)=>{
            try {
              let addr = new ethers.Wallet(address).address
              let res = await userStore.userProvider.httpProvider.getBalance(addr) as any
              const bal=ethers.utils.formatEther(res)
              resolve({
                address:addr,
                balance:bal
              })
            } catch (error) {
              reject({
                code :-1,
                msg:error
              })
            }
        })
    },
```

## 数据转换：

### 数字转16进制字符串

```js
const a = 2
'0x'+(a.toString(16))
```

### 以太数字转16进制字符串

```js
const UNIT = 1000000000000000000;
('0x'+(1.2)*UNIT).toString(16))

//16进制字符串转10进制数字
Number("0xc738")
```

### 以太数字转BigNumber

```js
ethers.utils.parseEther('1.2')
```

### wei转eth

wei是BigNumber：

![image-20221215174213329](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221215174213329.png)
```js
ethers.utils.formatEther(gas.toString())
ethers.utils.formatEther方法只接受字符串
```

### wei转16进制字符串

```
gas.toHexString()//gas为BigNumber
```

### wei转数字eth

```js
Number(ethers.utils.formatEther(gas.toString()))
```

## 用三种不同方法创建 `Wallet`实例

- 创建随机私钥的 `Wallet`对象。这种方法创建的钱包是单机的，我们需要用 `connect(provider)`函数，连接到以太坊节点。这种方法创建的钱包可以用 `mnemonic`获取助记词。

```javascript
// 创建随机的wallet对象
const wallet1 = ethers.Wallet.createRandom()
const wallet1WithProvider = wallet1.connect(provider)
const mnemonic = wallet1.mnemonic // 获取助记词
```

- 利用私钥和 `Provider`实例创建 `Wallet`对象。这种方法创建的钱包不能获取助记词。

```javascript
// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet2 = new ethers.Wallet(privateKey, provider)
```

- 利用助记词创建 `Wallet`对象。这里我们使用的是 `wallet1`的助记词，因此创建出钱包的私钥和公钥都和 `wallet1`相同。

```javascript
// 从助记词创建wallet对象
const wallet3 = ethers.Wallet.fromMnemonic(mnemonic.phrase)
```

## elementui-plusform表单清空

```vue
 <el-form ref="pvkRef" :model="colForm" :rules="rulesPvk" size="medium" label-width="120px">
   <el-form-item :label="..."  prop="mainWal">

//表单项的prop属性必填
<el-button @click="resetPvkForm" >reset</el-button>
<script>
const pvkRef = ref()
       const colForm=ref( {
    mainWal: '',
    pvk: '',
    token: '',
    priFee: '',
    maxFee: '',
    extrAll: '',
})
   
const resetPvkForm=() =>{
    // dataList.value=[]
    pvkTable.value=[]
    pvkRef.value.resetFields()
}
</script>

```
