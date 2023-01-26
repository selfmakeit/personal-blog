---
title: influxdb + telegraf (+grafana ) 安装配置
date: '2020-12-3'
tags: ['linux','system']
draft: false
summary:  influxdb + telegraf (+grafana )实现系统状态监控
---

# ubuntu上  influxdb + telegraf (+grafana ) 安装配置

## Telegraf

Telegraf是一款Go语言编写的metrics收集、处理、聚合的代理其设计目标是较小的内存使用，通过插件来构建各种服务和第三方组件的metrics收集Telegraf由4个独立的插件驱动

**Input Plugins**
输入插件，收集系统、服务、第三方组件的数据
**Processor Plugins**
处理插件，转换、处理、过滤数据
**Aggregator Plugins**
聚合插件，数据特征聚合
**Output Plugins**
输出插件，写metrics数据

## InfluxDB

开源的分布式时序、时间和指标数据库，使用Go语言编写，无需外部依赖。其中，时间序列数据库是数据格式里包含Timestamp字段的数据，比如某一时间用户上网流量、通话详单等。几乎所有的数据都可以打上一个Timestamp字段。时间序列数据更重要的一个属性是如何去查询它，包括数据的过滤、计算等。

它有三大特性：
时序性（Time Series）：与时间相关的函数的灵活使用（例如最大、最小、求和等）；
度量（Metrics）：对实时大量数据进行计算；
事件（Event）：支持任意的事件数据，换句话说，任意事件的数据我们都可以做操作。

## 安装配置

**apt方式安装，确保电脑连接外网**

### influxdb 安装配置

* 添加influxdata存储库

```sh
#curl -sL https://repos.influxdata.com/influxdb.key | sudo apt-key add -
#source /etc/lsb-release
#echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/influxdb.list

```

* 安装并启动influxdb服务

```sh
#sudo apt-get update && sudo apt-get install influxdb
#sudo systemctl start influxdb
```

* 创建 Influxdb数据库

```sh
root@ubuntu:~# influx
> create database cqlcb_telegraf
> show databases
name: databases
---------------
name
_internal
cqlcb_telegraf
>use cqlcb_telegraf
>CREATE USER "cqlcb" WITH PASSWORD 'cqlcb' WITH ALL PRIVILEGES
>
```

* 创建influxDB用户

```bash
>create user “username”/username with password 'passwd' with all privileges
```

* 数据库安装完成，可使用Cymaticlabs.InfluxDB连接工具进行可视化界面查询

### telegraf 安装

* 安装并启动telegraf服务

```sh
sudo apt-get install telegraf
sudo systemctl start telegraf
```

* 配置Telegraf

```sh
vi /etc/telegraf/telegraf.conf
```

![img](https://raw.githubusercontent.com/selfmakeit/resource/main/20200206175513700.png)

* vim搜索命令：输入“/”，在其后面输入要搜索的字符串回车，查看下一个匹配，按下n(小写n)，跳转到上一个匹配，按下N（大写N）

假如安装telegraf时出现了E: Unable to locate package telegraf的话在开始部分添加库之后执行：**

```sh
 sudo apt-get update
```

* Telegraf默认是不采集网卡信息的，配置采集网卡信息：

![image-20230126131716782](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230126131716782.png)

## Grafana(可选)

Grafana是一个纯粹的HTML/JS应用，用于数据展示，本次是系统内部自己做数据展示，安装grafana主要用于**在其模板中查看数据查询的sql语句**。

### 安装

* 添加grafana存储库

```sh
echo "deb https://packages.grafana.com/enterprise/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
```

* 添加gpg密钥

```sh
curl https://packages.grafana.com/gpg.key | sudo apt-key add -
```

* 更新库并安装

```sh
sudo apt-get update
sudo apt-get install grafana
```

* http://localhost:3000 进入配置窗口配置

## 系统备份--自动定时备份

以定时备份数据和备份文件夹库为例：

* 1. vim database_backup.sh;

```shell
#!/bin/bash
DATE=$(date +%Y%m%d)
DATE_RM=$(date -d "7 days ago" +%Y%m%d)
IP_ADDRESS=192.168.190.17
USER=root
PASSWD=root
mysqldump --opt --column-statistics=0 -h$IP_ADDRESS --user=$USER --password=$PASSWD --lock-all-tables=true --result-file=/home/hwadee/$(date +%Y%m%d)-databackup.sql --default-character-set=utf8 cqlcb
```

备份文件夹：

```sh
#!/bin/bash
DATE=$(date +%Y%m%d)
DATE_RM=$(date -d "7 days ago" +%Y%m%d)
tar -zcPvf /home/backup/liferay-portal-6.2-ce-ga5_$(date +%Y%m%d).tar   					/opt/module/liferay-portal-6.2-ce-ga5/
rm -rf /home/backup/liferay-portal-6.2-ce-ga5_$DATE_RM.tar
```

* 2. sudo chmod 777 database_backup.sh;
* 3. sudo crontab -e;

```shell
# For more information see the manual pages of crontab(5) and cron(8)
# 
# m h  dom mon dow   command

0 14 * * * sh /home/backup/backup_full.sh#每天14：00执行
10 15 * * * sh /home/backup/database_backup.sh#每天15：10执行                                         
```

* 4. sudo service cron restart;
