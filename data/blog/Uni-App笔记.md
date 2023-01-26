---
title: Uniapp开发记录
date: '2021-2-3'
tags: ['uniapp']
draft: false
summary:  Uniapp开发中的几个记录
---
## js从html标签中提取内容（包含嵌套标签）

```javascript
var content =str.replace(/<\/?.+?>/g,"");
```

## uni-app同步请求数据

* 利用**async**和**await**配合使用，这两个关键字必须成对出现，在调用返回Promise的方法前使用await，在调用的方法外面使用async申明。

```js
import {postUrl,hasErrorMsg} from "@/pages/api/api.js"
import {errdata} from "@/pages/api/errdata.js"
import {url} from "@/pages/api/request.js"
export let spike ={
	//方法外面使用async申明
	getDicNameById:async function(id){
		var result;
		if(id){
            //调用时使用await
			result= await this.doGetDicItemById(id);
		}else{
			return "";
		}
		return result.codeName;
	},
    //返回Promise的方法
	doGetDicItemById: function(id){
		var requestUrl = url;
		var param ={
			    dicItemId: id
			  };
		return new Promise((resolve,reject) =>{
			uni.request({
				url: requestUrl,
				method:'POST',
				data:param,
				header: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'Authorization': 'Bearer ' + uni.getStorageSync("Token")
				},
				success:(res)=>{
					resolve(res.data.datas[0])
				},
				fail:(err)=>{
					reject(err)
				}
			})
		})
	},
}
```

**如果有多层的话要逐层使用，除了最里面的那个返回promise的方法**

```js
	methods: {
			getArchiveDetailById:async function() {
				let that = this;
				let data = this.archiveData;
				var photo = await postUrl(userArchivesUrl.getUserPhotoByUserId, {"userId":data.userId});
				data['profilePhoto'] = url+photo;
				data.gender = await spike.getDicNameById(data.gender);
				data.birthProvince =await spike.getDicNameById(data.birthProvince);
				data.birthCity =await spike.getDicNameById(data.birthCity);
				//成果列表
				await postUrl(userArchivesUrl.getAcquiredOutcome, {"submitId":data.userId}).then((res)=>{
					var datas = res.datas;
					var rows = JSON.parse(datas).rows;
						if(JSON.stringify(rows)=='[]')that.list = null;
						else that.list = rows;
				});
		
				that.archiveData=data;
		
			}
		}
```

### uni-app使用自定义组件

1. 新建uni-common-go.vue文件，在文件中编写组件

```vu
<template>
	<view class="text-row" @click="gotoDetail"> 
		<image :src="leftIcon" mode="" class="rightImg" ></image>
		<text class="text-back">{{leftText}}</text>
		<image :src="rightIcon" mode="" class="leftImg" @click="gotoDetail"></image>
	</view>
</template>
<script>
	export default {
		name:"uni-common-go",
		props:{
			leftIcon:{
				type:String,
				default:require('../../../../static/institution/helpcenter/question.png')
			},
			rightIcon:{
				type:String,
				default:require('../../../../static/institution/helpcenter/toright.png')
			},
			leftText:{
				type:String,
				default:'默认文字'
			},
			params:{
				type:String,
				default:''
			}
		},
		data() {
			return {
		
			};
		},
		methods:{
			//goto为外部使用时的属性名，使用时：@goto=""，并且将组件中的params属性作为goto中方法的参数
			gotoDetail(){
				this.$emit('goto',this.params);
			}
		}
	}
</script>
 
<style>

</style>
```

2. 使用自定义组件：

   ```
   引入组件：import {UniCommonGo} from "@/pages/institution/common/uni-common-go.vue"

   申明组件：components:{UniCommonGo,}, （注意这里的两个逗号）

   ```

```vue
<template>
	<view>
		<view v-for="item in questionList">
			<uni-common-go :leftText="item.title"  :params="item.resourcePrimKey" @goto="getQuestionDetail(item.resourcePrimKey)" ></uni-common-go>
		</view>
	</view>
</template>

<script>
    //1.引入组件
	import {postUrl,hasErrorMsg} from "@/pages/api/api.js"
	import {UniCommonGo} from "@/pages/institution/helpcenter/common/uni-common-go.vue"
	export default {
     //2.申明组件
		components:{
		    			UniCommonGo,
		    		},
		data() {
			return{
				loadStatus: '', //加载状态：正在加载，加载更多，没有更多了
				pageIndex: 0, //页码
				questionList: [], //数据列表
				mode: 'square',
				leftText:'',
				params:0
				}
		},
		//默认加载
		mounted() {
			this.pageIndex = 0;
			this.findQuestionList();
		},
		methods: {
			//加载消息详情
			getQuestionDetail(id) {
				this.$u.route({
					url: 'pages/institution/helpcenter/questionDetail',
					params: {
						resourcePrimKey: id
					}
				})
			},
			//查询档案列表
			findQuestionList: async function() {
				......
			},
	
		},
		//下拉刷新
		onPullDownRefresh() {
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);

			this.questionList = [];
			this.pageIndex = 0;
			this.findQuestionList();
		},
	}
</script>
<style lang="scss" scoped>

</style>

```

3. 注意这其中有个地方可以有两种方式：

   * 方式一：

   ```vue
   //组件里
   methods:{
   		gotoDetail(){
   		this.$emit('goto',this.params);//此处
   		}
    //使用组件时
    <uni-common-go :leftText="item.title"  :params="item.resourcePrimKey" @goto="getQuestionDetail" ></uni-common-go>
    .......
    methods: {
   			//加载消息详情
   			getQuestionDetail(id) {
   				this.$u.route({
   					url: 'pages/institution/helpcenter/questionDetail',
   					params: {
   						resourcePrimKey: id
   					}
   				})
   			},
   		}
   ```
   * 方式二：

   ```vue
   //组件里
   methods:{
   		gotoDetail(){
   		this.$emit('goto');//此处
   		}
    //使用组件时
    <uni-common-go :leftText="item.title"  @goto="getQuestionDetail(item.resourcePrimKey)" ></uni-common-go>
   .......
    methods: {
   			//加载消息详情
   			getQuestionDetail(id) {
   				this.$u.route({
   					url: 'pages/institution/helpcenter/questionDetail',
   					params: {
   						resourcePrimKey: id
   					}
   				})
   			},
   		}
   ```
