---
title: Linux创建定时任务步骤
date: '2021-9-13'
tags: ['linux', 'config']
draft: false
summary:  LInux创建定时任务步骤
---
# LInux创建定时任务步骤

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
