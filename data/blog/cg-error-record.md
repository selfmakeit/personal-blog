---
title: cg开发记录-error篇
date: '2022-09-08'
tags: ['golang', 'errors', 'ethereum']
draft: false
summary: 开发时的几个错误记录
---
# 问题记录

```js
let tx = await signer.sendTransaction({
    to:data.receiver,
    nonce:nonce,
    // gasLimit:ethers.utils.hexlify(100000),
    value:ethers.utils.parseUnits(data.value.toString(),'ether')
})
```

这里面的to为undefined，这样的结果会导致回去创建一个合约，转出去的钱就没了

![image-20230125180213960](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230125180213960.png)

**这个问题的衍生问题是在开始的时候gasLimit设置成21000，正常转账gaslimit就是这样，但是这次报了“intrinsic gas too low -3200”错误，这就是因为to地址为undefined就变成了创建合约的操作**

## 问题记录： eth_sendRawTransaction code:-32000,message:already known

解决：获取nonce的时候latest改成pending

```js
let nonce = await provider.getTransactionCount(address,'pending')
// let nonce = await provider.getTransactionCount(address,'latest')
```

## vue路由加keep-alive不生效且不显示组件

是因为组件不止一个根节点导致的

## blocknative接口报403，coinGecko接口连接超时

原因：电脑使用了代理，需要在代码中也配置代理

```go
func GetCoinPriceCMC() {
	u, _ := url.Parse("htttp://127.0.0.1:7890")
	t := &http.Transport{
		MaxIdleConns:    10,
		MaxConnsPerHost: 10,
		IdleConnTimeout: time.Duration(10) * time.Second,
		//Proxy: http.ProxyURL(url),
		Proxy: http.ProxyURL(u),
	}
	client := &http.Client{
		Transport: t,
		Timeout:   time.Duration(10) * time.Second,
	}
	// client := &http.Client{}
	req, err := http.NewRequest("GET", "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", nil)
	if err != nil {
		log.Print(err)
		os.Exit(1)
	}

	q := url.Values{}
	q.Add("start", "1")
	q.Add("limit", "5000")
	q.Add("convert", "USD")

	req.Header.Set("Accepts", "application/json")
	req.Header.Add("X-CMC_PRO_API_KEY", "78c014db-627f-45f4-bc16-a58bc7715439")
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	fmt.Println(resp)
	if err != nil {
		fmt.Println("Error sending request to server")
		os.Exit(1)
	}
	fmt.Println(resp.Status)
	respBody, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}

```

## websocket连接不上

描述：gorllia的websocket框架搭建的服务端结合gin和http服务使用了同一个端口，在vue中连接不上，也没有失败原因，但是在单独的nodejs文件中能够连接，后发现后端换一个端口就可以了

后续又出现了一个用户假如刷新网页会出现建立多次连接的问题，这个把连接id由随机生成的序列号改成用户钱包地址就不会重复连接了。
