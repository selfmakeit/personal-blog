---
title: cg开发记录-vue+vite篇
date: '2022-10-013'
tags: ['vue', 'vite', 'front']
draft: false
summary: 开发时的vue-vite问题记录
---
# vue&VIte

## vue3解决修改原生样式不生效的问题：

```scss
::v-deep(.el-upload){
    margin-left: 150px !important;
}
```

## vite使用process以及vite.config.ts中的动态配置

### 动态配置

以base选项为例，有的时候项目需要部署在服务器的子目录下，这时就要根据开发环境或生产环境动态配置 `vite.config.ts` 中的 `base` 选项。
在配置文件中点击defineConfig进入源码可以发现：defineConfig接收一个UserConfig对象，或者一个返回UserConfig对象的函数，这个函数接收一个ConfigEnv对象作为参数，ConfigEnv的类型声明如下：

```js
export declare interface ConfigEnv {
    command: 'build' | 'serve';
    mode: string;
    /**
     * @experimental
     */
    ssrBuild?: boolean;
}
```

**因此我们可以利用command属性来判断执行的命令，从而动态设置base选项**。

```js
export default defineConfig(({command,mode})=>{
  let base: string
  let wssUrl:string
  if (command === 'build') {
    base = 'https://cryptogang.vip/'
    wssUrl = 'wss://cryptogang.vip/system/ws'
    console.log("build");
  } else {
    base = './'
    wssUrl = 'ws://localhost:4728/system/ws'
  }
  let config ={......其他配置}
  return{
    base,
    config,
  }
})
```

### process使用

vite中提供了loadEnv方法去加载配置文件

```js
import { defineConfig,loadEnv } from 'vite'
```

loadEnv方法声明如下

```js
export declare function loadEnv(
mode: string, 
envDir: string, 
prefixes?: string | string[]): Record<string, string>;
```

其中的mode可以配合scripts命令从 `process.argv`中拿，实际上defineConfig的mode参数也是拿同一个,prefixes则表示可以接收的字段前缀，是一个数组

```js
export default defineConfig(({command,mode})=>{
    const envConfig = loadEnv(mode, './',["VITE","VENUS","GD"]);
    //.....可以根据配置文件里的字段去动态配置一些选项
```

这里就可以根据配置文件里的字段去动态配置一些选项，因为根据执行的命令的不同，这里的配置文件也是不一样的。

> 注意：mode的取值来源为package中的脚本命令参数,没有指定则默认为development：
>
> ```json
> "scripts": {
>     "dev": "vite --mode dev",
>     "serve": "vite --host --mode dev",
>     "build": "vue-tsc && vite build --mode prod",
>     "deploy": "vite build --mode prod && node ./zz_deploy/deploy_web.js"
>   },
> ```
>
> 并且这里的--mode dev，其中的'dev'与配置文件名.env.dev一一对应
>
> 更多关于loadEnv的讲解可参考：https://developer.aliyun.com/article/949754

如果命令中没有指定mode，它会默认先去找'.env.development'文件没有则去找'.env'文件

### 引入环境变量使用

在配置文件中显式调用了loadEnv方法，则能够在不同的模式下调用到对应配置文件下的属性。

一般情况看假如你没有在配置文件中使用以下这种方式定义的话

```js
 define: {
      'process.env': {...envConfig}
    },
```

则只能通过import.meta.env.VITE_SOME_KEY这种方式使用，假如使用了上面的定义方式，则可以通过process.env.SOME_KEY这种方式，process.env这种方式更通用。

> 注意如果在env文件中定义了属性，然后在配置文件中又覆盖了该属性时，比如：
>
> .env.dev文件中：
>
> ```json
> GD_TEST =3333
> ```
>
> ```js
> define: {
>       'process.env': {...envConfig,WSS_URL:wssUrl,GD_TEST:5555}
>     },
> ```
>
> 这时
>
> ```js
>   console.log("GD_TEST1:",import.meta.env.GD_TEST);//GD_TEST1:333
>   console.log("GD_TEST1",process.env.GD_TEST);//GD_TEST1:555
> ```

```js
只在vite.config.ts文件中通过'process.env': {...envConfig}配置的属性无法通过'import.meta.env'访问到
```
其实在弄清楚过程之后在使用过程中一般就使用vite提供的import.meta.env来访问配置就行了，

## form 限制input只能数字：

```js
oninput="value=value.replace(/[^0-9.]/g,'')"
```

## 实现点击复制文本

```vue
 <font-awesome-icon icon="fa-solid fa-copy" @click="copyAddress" style="cursor:pointer"/>
```

```typescript
   const copyAddress=()=> {
     var input = document.createElement("input"); // 创建input对象
     input.value = form.contractAddress; // 设置复制内容
     document.body.appendChild(input); // 添加临时实例
     input.select(); // 选择实例内容
     document.execCommand("Copy"); // 执行复制
     document.body.removeChild(input); // 删除临时实例
     ElMessage({
          message: "复制成功",
          type: 'success'
        })
}
```

## session和cookie

session和cookie是不分家的。我们每次说到session，其实默认就是要使用cookie了。
服务器就是服务台，储物柜就是session仓库，钥匙就是我们的凭证。携带钥匙其实就是cookie传输。

## vue3+vite+ts报错：找不到模块“@/xxxxxx”或其相应的类型声明。

场景：引入ts文件报错找不到相应类型声明，此时是tsconfig.json文件还要进行文件系统路径别名设置

```js
{
    "compilerOptions": {
        "baseUrl": "./"  // 解析非相对模块的基础地址，默认是当前目录
        "paths"： { // 路径映射，相对于baseUrl
            "@/*": ["src/*"]
        }
    }
}
```

注：注意@/和src/后面的*号，如果缺少了还是会报错！！！

如果在引入vue文件报错时，要在vite.config.ts中配置文件系统路径别名

```js
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
 
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        } 
    },
    plugins: [
        vue()
    ]
})
```

## 使用svg图标

https://www.jb51.net/article/258650.htm

https://www.cnblogs.com/haoxianrui/archive/2022/04/02/16090029.html#svg%E5%9B%BE%E6%A0%87

其中svg-icon组件的代码改成下面这样，就能实现在使用每个图标时都能指定自定义class

```vue
<template>
    <svg aria-hidden="true" :class="svgClass">
      <use :xlink:href="symbolId" :fill="color" />
    </svg>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props=defineProps({
    prefix: {
      type: String,
      default: 'icon',
    },
    iconClass: {
      type: String,
      required: true,
    },
    className:{
      type: String,
      default: 'svg-icon',
    },
    color: {
      type: String,
      default: ''
    }
  })
  
  const symbolId = computed(() => `#${props.prefix}-${props.iconClass}`);
  const svgClass =computed(()=>{
    return props.className
  }) 
  </script>
  
  <style scoped>
  .svg-icon {
    width: 2em;
    height: 2em;
    vertical-align: -0.15em;
    overflow: hidden;
    fill: currentColor;
  }
  </style>
```

使用时：其中icon-class是图标文件名

```vue
<template>
      <svg-icon icon-class="language-solid" className='icon'/>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.icon {
  width: 1.5em;
  height: 1.5em;
}

</style>

```

## 更改svg图标颜色

编辑器打开图片，更改fill后的颜色数值，没有fill属性的就在path后加上

## 使用fontAwesome图标库

* 安装图标

```bash
npm i --save @fortawesome/fontawesome-svg-core

Free icons styles

npm i --save @fortawesome/free-solid-svg-icons
npm i --save @fortawesome/free-regular-svg-icons
npm i --save @fortawesome/free-brands-svg-icons
```

* 安装图标库

```bash
//for Vue 2.x
npm i --save @fortawesome/vue-fontawesome@latest-2

//for Vue 3.x
npm i --save @fortawesome/vue-fontawesome@latest-3
```

* 创建plugins/fontAwesome.ts文件，文件内容如下：

```ts
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { App } from 'vue'

library.add(fas)
library.add(far)
library.add(fab)
export default (app: App<Element>) => {
app.component('font-awesome-icon', FontAwesomeIcon)
}
```

* main.ts配置

```js
import installFontawesome from './plugins/fontAwesome'
installFontawesome(app)
```

## Elementui-plus加载组件v-loading动态改变text内容

```html
<div class="content-wrapper" v-loading="upgradeLoading" :element-loading-text="loadText">
  
const loadText = ref(t('upgrade.wait'))
```

使用loadText.value="aaaa"这种方式是不会生效的

要采用下面的方式：

```js
document.querySelector(".el-loading-text").innerHTML = t('upgrade.cnf')
```

## 创建签名的交易步骤

```typescript
async signTransaction(privateKey: string, txData: TransactionSendDataDto) {
        const provider = new ethers.providers.JsonRpcProvider(EthereumConstants.PROVIDER_URL_KOVAN);
        const wallet = new ethers.Wallet(privateKey, provider);
        const gasPrice = await this.getGasPrice()
        const newTransaction : ethers.providers.TransactionRequest = {
            to: txData.to,
            value: ethers.utils.parseEther(txData.value),
            from: txData.from,
            gasLimit: 21000, 
            gasPrice:'',
            chainId :'',
            nonce: await provider.getTransactionCount(txData.from),
        };

        const signedTransaction = await wallet.signTransaction(newTransaction);
  
        return signedTransaction;
    }
```

发送交易：

```typescript
async sendTransaction(signedTransaction: string) {
        const provider = new ethers.providers.JsonRpcProvider(EthereumConstants.PROVIDER_URL_KOVAN);
        const transaction = await provider.sendTransaction(signedTransaction);
        transaction.wait();
        return transaction;
    }
```

## watch监听map和数组

watch监听map和数组时需要用set这种方法赋值才能监听到，并且对象必须为响应式

```typescript
const hashPvmap = ref(new Map())
//......
hashPvmap.value.clear()
//......
hashPvmap.value.set(pvArr[i],wal)
```

```typescript
watch(() => [...hashPvmap.value], (nArray, oArray)=>{
    debugger
    const cross = []
    // const n = new Map(nArray);
    // const o = new Map(oArray);
    // console.log(n.get('width'), n.get('height'), o.get('width'), o.get('height'));
});
```

## 页面出不来报没有安装pinia错误解决

在路由守卫中用到了userStore，不要把userStore定义成全局变量，在使用的时候在定义，在类中也是一样的道理

## 错误记录：三级动态路由不生效

原因：组件中template下有多个元素，

解决：把template下的多个元素放在一个div里

## 错误记录：gnutls_handshake() failed: Error in the pull function

原因：电脑使用了vpn代理

解决：

```
vim ~/.gitconfig
```

![image-20221206213800111](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221206213800111.png)

## 富文本防XSS攻击

```
npm i xss -S 
```

```
import  xss  from "xss";

const option={
    whiteList:{
        img:['src','onerror'], //img标签保留src,onerror属性
        style:['type'] //style标签默认是不在whileList属性里的，现在添加上去
    },
    // stripIgnoreTagBody: ["script","noscript"],
    // onIgnoreTagAttr: function(tag, name, value, isWhiteAttr) {
    //     if (['style','class'].includes(name)) {
    //         return `${name}="${xss.escapeAttrValue(value)}"`
    //     }
    // },
}

const myxss = new xss.FilterXSS(option);


form.value.content = myxss.process(form.value.content)
```

但在实际使用中发现wangEditor富文本编辑器似乎自己包含了XSS防范，并不需要使用也能防止

## 一个奇怪的缓存现象记录

假如组件导出时，name这个属性名写错会出现没法缓存，但是vue却能找到组件，仅仅是不能缓存。

```tsx
<script lang="ts">
  export default{
     name:"UserFeedback"
  }
</script>

//比如错写成：
<script lang="ts">
  export default{
     topic:"UserFeedback"
  }
</script>
```

其效果就和没有导出这部分代码一样，按道理我这个地方不用写导出也能行，因为vue3默认会按文件名给你默认导出，我这个地方组件名也是和文件名一样的。

## i18n国际化

```vue
<template>
      {{ t("hashmint.title.pvk") }}
</template>

<script setup lang="ts">
    import { useI18n } from 'vue-i18n'
	const { t } = useI18n()
  
  
    alert(t("hashmint.title.pvk"))
</script>

<style lang="scss" scoped>
.icon {
  width: 1.5em;
  height: 1.5em;
}

</style>

```

## 在缓存情况下刷新组件

原理：在v-if值改变的情况下组件会刷新

```vue
<template>
	<el-row style="width:100%" >
        <el-col :span="24" style="">
            <wangEditor v-if="reloadComponentTag" />
        </el-col>
    </el-row>
</template>
<script lang="ts" setup>
const reloadComponentTag =ref(true)

const reloadThisComponnet = () => {
    reloadComponentTag.value = false;
      setTimeout(() => {
        reloadComponentTag.value = true;
      }, 0)
    }

function xxx(){
    .....
      reloadThisComponnet()
}
</script>
```

## ts构造器重载

## elementui中使用loading时似乎不能对数据进行操作：

```vue
<el-table-column prop="balance" :label="$t('hashmint.label.balance')" style="width: 10%;">
    <template #default="scope">
		<div v-loading="scope.row.loading" >
            {{scope.row.balance}}
            {{scope.row.balance ？ scope.row.balance.slice(0,6) : ''}}
            <!-- {{`${scope.row.balance.slice(0,6)}ETH`}} -->
        </div>
    </template>
</el-table-column>
```

矛盾在于，没有数据时loading才会显示，假如你想办法在没有数据时也能获得值（尽管是空值,比如上面的''）这个时候他都不会显示loading
