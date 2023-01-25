---
title: windchill邮件服务器配置
date: '2019-12-08'
tags: ['windchill', 'config']
draft: false
summary: windchill邮件服务器配置
---
# 邮件服务器配置

* 前提：用户方需提供邮件服务器地址和端口，以及一个邮箱账号。地址最好是以域名形式。
* windchill所在电脑能够连接邮件服务器端口（不仅仅是能ping通）

## 测试用户提供信息是否可用

windows启用telnet之后，使用telnet进行连接测试。

例：

```
telnet mail.sz-sunway.com 587
```

## 将wcadmin账号的邮箱设置为用户所提供的邮箱

##生成账号配置文件（假如以匿名方式则不需要这一步）

以账号为：sunway\pdmelement，密码为E123456为例：

windchill服务器为Linux系统：

```
xconfmanager -s "wt.mail.smtp.username=sunway\\\pdmelement" -t mail.properties -p
xconfmanager -s "wt.mail.smtp.password=E123456" -t mail.properties -p
```

windchill服务器为windows系统：

```xml
xconfmanager -s "wt.mail.smtp.username=sunway\\pdmelement" -t mail.properties -p
xconfmanager -s "wt.mail.smtp.password=E123456" -t mail.properties -p
```

以上两条命令

以上两条命令会在Windchill目录下生成一个mail.properties文件

注意生成的文件应为如下格式（特殊符号前应有"\\"转义字符）：

```xml
wt.mail.smtp.password=E123456
wt.mail.smtp.username=sunway\\pdmelement
```

## 以项目配置文件方式配置

在项目中新建emailConfig.xconf:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Configuration
        SYSTEM "xconf.dtd">
<Configuration targetFile="codebase/wt.properties">

    <Property name="wt.workflow.work.UseDefaultNotificationSenderEmail" overridable="true"
              targetFile="codebase/wt.properties"
              default="true"/>

    <Property name="wt.mail.from" overridable="true"
              targetFile="codebase/wt.properties"
              default="pdmelement@sz-sunway.com"/>

    <Property name="wt.mail.mailhost" overridable="true"
              targetFile="codebase/wt.properties"
              default="mail.sz-sunway.com:587"/>
    <Property name="wt.notify.notifiationSenderEma" overridable="true"
              targetFile="codebase/wt.properties"
              default="wcadmin"/>
<!--匿名方式不需要下面这个属性-->
    <Property name="wt.mail.properties" overridable="true"
              targetFile="codebase/wt.properties"
              default="$(wt.home)$(dir.sep)mail.properties"/>
</Configuration>
```

其中wt.notify.notifiationSenderEma指定的用户的邮箱需为属性wt.mail.from的值。

其中wt.mail.properties属性在windows系统下可直接写成：

```xml
<Property name="wt.mail.properties" overridable="true"
              targetFile="codebase/wt.properties"
              default="mail.properties"/>
```

整个过程中不要直接去更改wt.properties。直接去更改重启后会失效。

```
执行xconfmanager -i <emailConfig.xconf文件位置> -p 部署配置文件

当配置完成后可以使用xconfmanager -d <属性名>来查看结果是否如预期。
```

## 以命令方式：

先将wcadmin账户的邮箱设置成用户提供的账号，如：pdmelement@sz-sunway.com

依次执行以下命令:

```xml
//配置服务器地址：
xconfmanager -t codebase/wt.properties -s wt.mail.mailhost=mail.sz-sunway.com:587 –p

xconfmanager -s wt.workflow.work.UseDefaultNotificationSenderEmail=true -t codebase/wt.properties -p
//配置windchill系统邮件发送者账号
xconfmanager -t codebase/wt.properties -s wt.mail.from=pdmelement@sz-sunway.com –p
//发送者在windchill中对应的用户
xconfmanager -t codebase/wt.properties -s wt.notify.notifiationSenderEma=wcadmin –p

//配置用户验证，匿名方式不需要
xconfmanager -s "wt.mail.smtp.username=sunway\\\pdmelement" -t mail.properties -p
xconfmanager -s "wt.mail.smtp.password=El123456" -t mail.properties -p
xconfmanager -s "wt.mail.properties=\$(wt.home)\$(dir.sep)mail.properties" -t codebase/wt.properties -p
```

## 整个配置过程中需要注意的是

通过自己编写的配置文件或者通过修改site.xconf中的属性值中时特殊符号不需要转义符。

通过xconfmanager去一个个设置属性时，特殊字符需要转义符。

配置生效后在wt.properties中的属性值特殊字符前应有转义符。
