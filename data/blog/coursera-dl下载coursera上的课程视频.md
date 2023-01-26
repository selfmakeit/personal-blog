---
title: 利用coursera-dl下载coursera上的课程视频
date: '2020-12-3'
tags: ['tools']
draft: false
summary:  coursera-dl下载coursera上的课程视频
---
# coursera-dl下载coursera上的课程视频

## 安装python3.8的版本

## pip安装coursera-dl

```bash
 python -m pip install coursera-dl
```

### 修改hosts文件

```bash
#添加下面这句
52.84.167.78 d3c33hcgiwev3.cloudfront.net
```

### 编写下载配置文件

比如你要把视频下载到coursera_download目录下，就在这个目录下新建coursera-dl.conf,并按以下格式填写信息：

```bash
--username XXXX@gmail.com
--password XXXXX
--subtitle-language en,zh-CN
--download-quizzes
--cauth EaGb30YcNwQmRC......
```

其中的cauth值：

- 在自己的浏览器**登陆coursera账号**
- 浏览器设置-cookie和网络权限-查看所有cookie和站点数据-在搜索框中输入coursera-在coursera的cookie中找到”CAUTH“名称

获得值：

![image-20230126132634489](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230126132634489.png)

注意，cookie不是唯一的，一段时间会变，所以一段时间后需要更新

### 切换到coursera_download目录下执行命令：

```bash
#cryptocurrency是课程名称
coursera-dl cryptocurrency
```

假如下载中途退出了或出于其他原因需要继续上次下载时

```bash
coursera-dl cryptocurrency --resume
```

更多信息和命令参数相关可参考官方文档：https://github.com/coursera-dl/coursera-dl#windows
