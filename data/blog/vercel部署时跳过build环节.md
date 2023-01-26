---
title: vercel部署时跳过build环节
date: '2023-01-26'
tags: ['vercel', 'config']
draft: false
summary: vercel部署时跳过build环节
---
有时候在我们本地改了一些框架默认的东西，或者在一些复杂项目中在一个未经配置的电脑上无法完成项目build时。这时候假如需要把项目部署到vercel上的话，就没法通过build，需要我们build之后在vercel上直接部署已经build好的文件夹。

如何在通过github仓库在vercel上部署项目不再赘述，直接从如何在vercel部署已经打包好的项目开始：

## 将在本地build好的文件上传到github

一般情况下我们是会把build的输出文件忽略不上传到github的

下图中'contac'为我项目的build输出文件夹：

![image-20230126210723301](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230126210723301.png)

## 在vercel上部署时按照下图操作

![image-20230126201929340](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230126201929340.png)
