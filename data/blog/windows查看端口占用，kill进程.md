---
title: Windows查看端口占用，杀死进程
date: '2021-2-13'
tags: ['system', 'config']
draft: false
summary:  Windows查看端口占用，杀死进程
---
# windows查看端口占用，杀死进程

* 查看端口占用：
  netstat -ano |findstr “端口号”
* 杀死进程：
  taskkill /f /t /im “进程id”
  ![image-20210922102902362](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20210922102902362.png)
