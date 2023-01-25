---
title: linux下主机名、环境变量、内核参数、以及远程桌面连接配置
date: '2020-12-08'
tags: ['linux', 'config','database']
draft: false
summary: linux下主机名、环境变量、内核参数、以及远程桌面连接配置
---

# linux下主机名、环境变量、内核参数、以及远程桌面连接配置

==以下操作以root身份进行==

## 更改服务器主机名，配置dns

以信维测试环境安装为例:
更改以下两个文件
1./etc/sysconfig/network

```css
vim /etc/sysconfig/network
```

改为：HOSTNAME=testpdm-e.sz-sunway.com

2./etc/hostname

```css
vim /etc/hostname
或者：（下面这个命令的效果一样）
hostnamectl set-hostname testpdm-e.sz-sunway.com
```

改为：testpdm-e.sz-sunway.com
注意这两个文件的区别，一个是要写HOSTNAME=

更改后使用hostname命令查看结果。
更改完主机名后要及时更新hosts文件，否则下次重启的时候会很慢，而且在重启之前dns无法解析主机名（ping不通）：

```css
vim /etc/hosts
```

加入：127.0.0.1 testpdm-e.sz-sunway.com

##创建用户和目录环境

所用到命令：useradd、groupadd、mkdir、chown、chmod
1.创建oracle数据库用户，这么做的原因有以下几点：

* 要有专门属于oracle的环境变量等，oracle的环境变量都是配置在oracle用户下的 ，这个环境变量不便于给root。
* 出于安全考虑，不同的软件环境最好隔离，而用户和组就是一种很好的隔离方式。

```css
groupadd dba
groupadd oinstall
useradd oracle -m -s /bin/bash -d /home/oracle -g oinstall -G dba
```

*-m：自动建立用户的登入目录。*
设置oracle用户密码

```css
passwd oracle
```

可能用到的命令：

```css
//连同用户目录一并删除用户
userdel -f username
//将用户添加到组
usermod -g groupName userName
```

## 创建目录

## 创建安装包存放目录

```css
mkdir -p /packages/windchill
mkdir -p /packages/oracle
chmod -R 755 /packages
chown -R oracle:oinstall /packages
```

*-p递归创建没有的目录*

## 创建程序安装目录

==以oracle身份进行==

```css
mkdir -p /app/oracle;
chown -R oracle:dba /app/oracle;
chmod -R 775 /app/oracle;
//oracle的家目录
mkdir -p /app/oracle/product/12.1.0/dbhome_1;
//oracle的日志目录
mkdir -p /app/oracle/oraInventory;
//oracle的数据文件目录
mkdir -p /app/oracle/oradata;
//oracle闪回区目录
mkdir -p /app/oracle/flash_recovery_area;
```

##修改环境变量
===以root身份进行==
修改环境变量的方案有几种，其中要注意的是/etc/profile是系统环境变量，~/.bash_profile是用户环境变量。这里采用在系统环境变量中定义然后在用户环境变量中引用的方式：

```css
vim /etc/profile
```

加入：

```css
export ORACLE_BASE=/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/12.1.0/dbhome_1
export ORACLE_SID=oral
export LD_LIBRARY_PATH=$ORACLE_HOME/lib:/lib:usr/lib
export LANG=en_US.UTF-8
export NLS_LANG_FORMAT='yyyy-mm-dd hh24:mi:ss'
export umask=022
export PATH=$ORACLE_HOME/bin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/X11R6/bin
```

在/home/oracle/.bash_profile中PATH变量后增加$ORACLE_HOME/bin

```css
vim /home/oracle/.bash_profile

PATH=$ORACLE_HOME/bin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/X11R6/bin
```

以root身份修改自己环境变量，PATH后面也增加$ORACLE_HOME/bin

```css
vim ~/.bash_profile
PATH=$ORACLE_HOME/bin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/X11R6/bin
```

重新加载环境变量source ~/.bash_profile
##修改用户shell限制
==以root身份进行==

```css
vi /etc/security/limits.conf
#加入以下内容，根据硬件环境的不同，可能在oracle安装的时候还会需要回来调整相关参数大小
oracle  hard  nofile  65536
oracle  hard  nproc  16384
oracle  soft  nproc   2047
oracle  soft  nofile  1024
oracle  hard  stack   10240
```

##修改linux内核

```css
vim /etc/sysctl.conf
#加入入以下内容
fs.aio-max-nr = 1048576
fs.suid_dumpable=1
fs.file-max=6815744
kernel.shmall=1220107
kernel.shmmax=956768256
kernel.shmmni=4096
kernel.sem=250 32000 100 128
net.ipv4.ip_local_port_range=9000 65500
net.core.rmem_default=262144
net.core.rmem_max=4194304
net.core.wmem_default=262144
net.core.wmem_max=1048586
```

使内核修改生效：
==sysctl -p==

## 编辑login文件

目的是使limits.conf文件生效，其中session required /lib/security/pam_limits.so这一行在加入之前要先查看系统里是否有这个文件，没有则不需要加

```css
vim  /etc/pam.d/login
#加入：
session required /lib/security/pam_limits.so
session required pam_limits.so
```

##编辑profile文件

出于系统性能考虑（具体参数参考件附录1）

```css
vim /etc/profile
#加入：
if[$USER="oracle"];then
if[SSHELL="/bin/ksh"];then
ulimit -p 16384
ulimit -n 65536
else
ulimit -u 16384 -n 65536
fi
fi
```

# Oracle安装

==在进行oracle和windchill安装之前，要先关闭防火墙。==

```css
#查看状态
systemctl status firewalld 
#临时关闭
systemctl stop firewalld
#永久禁用
systemctl disable firewalld
#启用防火墙（一般情况下建议禁用防火墙）
systemctl start firewalld
systemctl enable firewalld
```

在安装过程中可能会出现频繁的用户切换，明智的做法是多开几个控制台窗口，每个窗口的用户不同，而不是频繁去切换用户和目录。

==以下操作以root身份进行==

## 依赖程序安装

1.配置好yum源（具体步骤见附录2）
2.执行以下安装

```css
yum install gcc gcc-c++ compat-libstdc++-33 elfutils-libelf-devel libaio-devel libstdc++-devel unixODBC unixODBC-devel xterm
```

3.执行下面两个命令，目的是允许其他用户的图形界面也显示在本地窗口上

```css
 export  DISPLAY=:0.0
 xhost +SI:localuser:oracle//或者xhost +
```

##oracle安装
==以oracle身份进行==

1.在安装之前确认配置的环境变量是否生效，这样方便在安装过程中程序能自动去识别。

#附1 命令参数
#useradd参数

```css
   -c：加上备注文字，备注文字保存在passwd的备注栏中。
　　-d：指定用户登入时的主目录，替换系统默认值/home/<用户名>
　　-D：变更预设值。
　　-e：指定账号的失效日期，日期格式为MM/DD/YY，例如06/30/12。缺省表示永久有效。
　　-f：指定在密码过期后多少天即关闭该账号。如果为0账号立即被停用；如果为-1则账号一直可用。默认值为-1.
　　-g：指定用户所属的群组。值可以使组名也可以是GID。用户组必须已经存在的，期默认值为100，即users。
　　-G：指定用户所属的附加群组。
　　-m：自动建立用户的登入目录。
　　-M：不要自动建立用户的登入目录。
　　-n：取消建立以用户名称为名的群组。
　　-r：建立系统账号。
　　-s：指定用户登入后所使用的shell。默认值为/bin/bash。
　　-u：指定用户ID号。该值在系统中必须是唯一的。0~499默认是保留给系统用户账号使用的，所以该值必须大于499。
```

##chmod -R 777

```css
	第一个数字表示文件所有者的权限
	第二个数字表示与文件所有者同属一个用户组的其他用户的权限
	第三个数字表示其它用户组的权限。
	可读 w=4 
	可写 r=2 
	可执行 x=1
```

##ulimit参数说明

![image-20200815134029510](F:\weBride\typora图片\image-20200815134029510.png)
#附2 命令模式删除oracle实例和监听

以下步骤出现在windchill安装失败后需要删除数据库实例的情况下。

先通过dbca命令去删除实例，假如再次安装时还是会出现检测出已存在wind实例的话执行以下步骤：

1.删除实例：

```java
步骤一：关闭数据库
1. sqlplus / as sysdba
2. shutdown immediate
步骤二：删除实例相关文件
1. find $ORACLE_BASE/ -name $ORACLE_SID
2. 用命令删除查询后的文件
find $ORACLE_BASE/ -name $ORACLE_SID -exec rm -rf {} \;
```

```java
步骤三：删除配置文件，假设我们删除的实例是wind
1. find $ORACLE_BASE/* -name '*[Ww][Ii][Nn][Dd]*' | grep -v admin | grep -v oradata
2. 用命令删除查询的文件
find $ORACLE_BASE/* -name '*[Ww][Ii][Nn][Dd]*' | grep -v admin | grep -v oradata | xargs rm -rf
```

```java
步骤四：删除实例配置文件中的信息
1. vim /etc/oratab
2. 找到wind:/opt/oracle/db/product/11g:N
3. 将该行信息删除，并保存文件
经过以上步骤可以实现命令行干净的删除实例 
```

2.删除现有监听

```css
步骤一：
oracle用户执行netca命令启动监听配置工具，删除监听
步骤二:
删除$ORACLE_HOME/network/admin下的listener.ora
cd $ORACLE_HOME/network/admin
ls
rm -f listener.ora
```

#附3 配置VNC远程桌面连接
基于已经安装桌面环境的前提下，如若没有安装桌面环境，需要先选择安装桌面环境。
1.==安装VNC==

```css
# yum install tigervnc-server tigervnc
```

2.==启动VNC，需要先启动才会在家目录生成配置文件==

```css
# /etc/init.d/vncserver restart
注：有时候上面的命令启动会报错，直接运行就可以：
# vncserver
注：关闭具体的vncserver命令:vncserver -kill :1 vncserver -kill :2
```

3.==设置远程登陆到gnome桌面的配置：==

```css
# vim /etc/sysconfig/vncservers（SUSE企业版不用配置此文件）
再最后面加入如下两行：

VNCSERVERS="1:root"
VNCSERVERARGS[1]="-geometry 1024x768 -alwaysshared -depth 24"
```

*说明*

```css
1、-alwaysshared表示同一个显示端口允许多用户同时登录 -depth代为色深，参数有8、16、	24、32；
2、这里的“用户名”是指linux系统用户的名称；
3、上面三行中第一行是设定可以使用VNC服务器的帐号，可以设定多个，但中间要用空格隔开。注意前面的数字“1”或是“2”，当你要从其它电脑来VNC服务器时，就需要用IP:1这种方法，而不能直接用IP。如假定你的VNC服务器IP是192.168.1.100，那想进入VNC服务器，并以peter用户登录时，需要在vncviewer里输入IP的地方输入：192.168.1.100:1,如果是root,那就是192.168.1.100:2；
4、下面两行[1][2]最好与上面那个相对应，后面的800X600可以换成你电脑支持的分辨率。注意中间的”x”不是“*”，而是小写字母”x”。
```

4.==设置vnc访问密码：==

```css
# vncpasswd
```

说明:这里是为上面的root远程用户配密码，所以在root账户下配；依次类推，为别的账户配密码，就要在别的账户下设密码。
5.==修改远程桌面显示配置文件：==

```css
# vim /root/.vnc/xstartup

#!/bin/sh
# Uncomment the following two lines for normal desktop:
unset SESSION_MANAGER
exec /etc/X11/xinit/xinitrc
[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey
vncconfig -iconic &
xterm -geometry 80x24+10+10 -ls -title "$VNCDESKTOP Desktop" &
gnome-session & #set starting GNOME desktop
#startkde & #kde desktop
#twm & #Text interface
#/usr/bin/startxfce4
#exec /usr/bin/fluxbox
```

说明:
不修改此文件你看到的远程桌面很简单，相当于命令行操作，为了远程操作如同本地操作一样，务必参考以上方式进行修改。
6.==vnc客户端登陆：==
在vnc客户端中输入：服务器端IP：1 或 服务器端IP：2
7.==防火墙设置:==
iptables防火墙默认会阻止vnc远程桌面，所以需要在iptables允许通过。当你启动vnc服务后，你可以用netstat –tunlp命令来查看vnc服务所使用的端口，可以发现有5801，5901，6001等。
使用下面命令开启这些端口:

```css
# vim /etc/sysconfig/iptables
添加:
-A RH-Firewall-l-INPUT -p tcp -m tcp –dport 5801 -j ACCEPT
-A RH-Firewall-l-INPUT -p tcp -m tcp –dport 5901 -j ACCEPT
-A RH-Firewall-l-INPUT -p tcp -m tcp –dport 6001 -j ACCEPT
重启防火墙:
# /etc/init.d/iptables restart
或者直接关闭防火墙：
# /etc/init.d/iptables stop
```

8.==开机自启动vncserver服务：==

```css
# chkconfig vncserver on
```

9.==可能会遇到的问题：黑屏==

```css
在Linux里安装配置完VNC服务端，发现多用户登陆会出现黑屏的情况，具体的现象为：
客户端可以通过IP与会话号登陆进入系统，但登陆进去是漆黑一片，除了一个叉形的鼠标以外，伸手不见五指。

原因：用户的VNC的启动文件权限未设置正确。
解决方法：将黑屏用户的xstartup（一般为：/用户目录/.vnc/xstartup）文件的属性修改为755（rwxr-xr-x）。
完后杀掉所有已经启动的VNC客户端：
vncserver -kill :1
vncserver -kill :2 （注意：-kill与:1或:2中间有一空格）
最后重启vncserver服务即可！ # /etc/init.d/vncserver restart
```

10.==配置完成后假如在vnc客户端需要执行带图形界面的程序，先在root身份下执行命令 xhsot +==

**注意：vncserver只能由启动它的用户来关闭，即时是root也不能关闭其它用户开启的vncserver，
 除非用kill命令暴力杀死进程。**
