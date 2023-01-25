---
title: Linux下的常用软件配置
date: '2022-10-013'
tags: ['linux', 'software']
draft: false
summary: Linux下的常用软件配置(基于Linuxmint)
---

# Linux下的常用软件配置

## 配置Ubuntu下clash翻墙

- **一、下载安装clash包**

网址：https://github.com/Dreamacro/clash/releases

```text
#打开终端进入下载的文件夹（我的在此文件夹，username为用户文件夹） 
cd /home/username/下载
# 解压
gunzip clash-linux-amd64-v1.7.1.gz
# 改名 
mv clash-linux-amd64-v1.7.1 clash
# 创建文件夹 
mkdir Clash
# 移动clash 到文件夹 
mv clash ./Clash
```

- **二、进入新建的这个Clash文件夹，下载config.yaml和Country.mmdb**

```text
#下载clash 配置文件config.yaml 在代理商那里复制订阅链接，替代 [订阅链接]
wget -O config.yaml [订阅链接]
#下载Country.mmdb 
wget -O Country.mmdb https://www.sub-speeder.com/client-download/Country.mmdb
```

- **三、启动clash（使用当前目录下的配置文件）以下两个操作同步**

（1）

```text
#授权可执行权限 
chmod +x clash 
#可启动 Clash，同时启动 HTTP 代理和 Socks5 代理 ./clash -d . 出现如下（保持此终端打开）： 
INFO[0000] Start initial compatible provider Domestic  
INFO[0000] Start initial compatible provider AsianTV   
INFO[0000] Start initial compatible provider GlobalTV  
INFO[0000] Start initial compatible provider Others    
INFO[0000] Start initial compatible provider Proxy
```

（2）访问 [http://clash.razord.top/](https://link.zhihu.com/?target=http%3A//clash.razord.top/) 可以进行切换节点、测延迟等操作。

打开配置文件config.yaml ，给它设置一个密码： # RESTful API 的口令 secret: '123456'

 这个页面要求提供，Host,Port,Secret 三个输入：

> Host: 127.0.0.1
> Port: 9090
> Secret: 123456

打开系统设置，选择网络，点击网络代理右边的 ⚙ 按钮，选择手动，填写 HTTP 和 HTTPS 代理为 127.0.0.1:7890，填写 Socks 主机为 127.0.0.1:7891，即可启用系统代理。（注意：冒号后的数字写后面）

![image-20221022182155307](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221022182155307.png)

注意：要访问谷歌，就要时刻打开那个终端

- **四、配置开机自启动**

```text
#打开终端，获取权限 
su 
#输入密码
#创建service文件
touch /etc/systemd/system/clash.service
#编辑service文件 
vi /etc/systemd/system/clash.service 
#编辑如下文本： 
[Unit] 
Description=clash daemon  
[Service] 
Type=simple 
User=root 
ExecStart=/home/username/下载/Clash/clash -d /home/username/下载/Clash/ 
Restart=on-failure  
[Install] 
WantedBy=multi-user.target
```

操作命令介绍：

```text
使用vi进入文本后，按i开始编辑文本 
退出编辑模式  　　
按ESC键，然后： 　　　　
退出vi 　　　
:q!  不保存文件，强制退出vi命令 　　　 
:w   保存文件，不退出vi命令 　　　 
:wq  保存文件，退出vi命令 
删除当前行 删除  dd
```

**设置 Clash 的开机启动项，检查状态，服务启动成功之后，根据信息设置自己客户端的代理协议类型及端口（依次输入）**：

```text
sudo systemctl daemon-reload 
sudo systemctl enable clash 
sudo systemctl start clash 
sudo systemctl status clash
#成功为如下： 
clash.service - clash daemon    
  Loaded: loaded (/etc/systemd/system/clash.service; enabled; vendor preset: enabled)    
  Active: active (running) since Sat 2021-11-06 00:16:45 CST; 5s ago  
 Main PID: 6848 (clash)     
  Tasks: 8 (limit: 14171)    
  Memory: 3.2M    
  CGroup: /system.slice/clash.service            
      └─6848 /home/username/下载/Clash/clash -d /home/username/下载/Clash/  
11月 06 00:16:45 ym-X550JX systemd[1]: Started clash daemon. 
11月 06 00:16:45 ym-X550JX clash[6848]: time="2021-11-06T00:16:45+08:00" level=info msg="Start > 11月 06 00:16:45 ym-X550JX clash[6848]: time="2021-11-06T00:16:45+08:00" level=info msg="Start > 
11月 06 00:16:45 ym-X550JX clash[6848]: time="2021-11-06T00:16:45+08:00" level=info msg="Start > 
11月 06 00:16:45 ym-X550JX clash[6848]: time="2021-11-06T00:16:45+08:00" level=info msg="Start > 
11月 06 00:16:45 ym-X550JX clash[6848]: time="2021-11-06T00:16:45+08:00" lev
```

## ubuntu配置macO主题

### 步骤

 **Install McMojave theme in 18.04 and later**

1. Download the McMojave theme package from [McMojave - Gnome.look.org](https://www.gnome-look.org/p/1275087/) to your `~/Downloads` directory. Click the download button and choose one of the following four McMojave theme packages.

   - Mojave-light: light version
   - Mojave-light-solid: light version without transparence
   - Mojave-dark: dark version
   - Mojave-dark-solid: dark version without transparence
2. Run the following commands

   ```
   sudo apt update
   sudo apt install gnome-tweak-tool gtk2-engines-murrine gtk2-engines-pixbuf plank  
   cd ~/Downloads/
   tar xf Mojave-light.tar.xz # replace Mojave-light.tar.xz with the theme that you downloaded
   mkdir ~/.themes
   mv Mojave-light ~/.themes/
   ```
3. Launch Tweaks from the Dash and change to Applications theme appearance to *Mojave-light*.
4. Download the macOS [Mojave CT icons](https://www.gnome-look.org/p/1210856/). Once again pick any icon style and save the package into your `~/Downloads` directory.
5. Run these commands to install the macOS Mojave CT icons:

   ```
   tar xf Mojave-CT-light.tar.xz
   mkdir ~/.icons
   mv Mojave-CT-light ~/.icons/
   ```
6. Change the icons to macOS Mojave theme in the Tweaks application.
7. Download the [macOS cursor set](https://www.gnome-look.org/p/1148748/) package. Pick any cursor style and save the package into your `~/Downloads` directory.
8. Run these commands to install it:

   ```
   unzip -qq macOS\ Cursor\ Set.zip
   mv macOS\ Cursor\ Set ~/.icons/
   ```
9. Change the cursor to *macOS Cursor Set* in the Tweaks application.
10. Download the [Mojave wallpaper](https://www.reddit.com/r/wallpapers/comments/e4fz6s/a_more_purpleish_version_of_the_mac_os_mojave/). Change  the wallpaper from *Settings* → *Background* → *Picture* tab → select a picture → press *Select* button (in 18.04) or *Settings* → *Background* → *Add Picture* (in 20.04).
11. Open Plank from the Dash. At this point you should see the macOS panel at the bottom of your desktop. Press the left Ctrlkey, and right-click the bottom macOS panel to open up *Preferences*. Customize the macOS panel to fit your desired look and feel. If you  wish to take yet another step further install the optional [macOS Plank theme](https://www.gnome-look.org/p/1248226/).
12. Remove the default GNOME dock panel.

    ```
    sudo apt remove gnome-shell-extension-ubuntu-dock
    ```
13. Configure the Plank application to start automatically after reboot.

    [![Add Plank to Startup Applications](https://i.stack.imgur.com/NjnFM.png)](https://i.stack.imgur.com/NjnFM.png)

**Source:** revised from [How to install macOS theme on Ubuntu 20.04 Focal](https://web.archive.org/web/20200512204317/https://linuxconfig.org/how-to-install-macos-theme-on-ubuntu-20-04-focal-fossa-linux)

---

MacBuntu has been discontinued, and it has been replaced by the [MBuntu Transformation Pack](http://www.noobslab.com/2014/11/mbuntu-macbuntu-1410-transformation.html) for Ubuntu 14.04-17.04. The MBuntu Transformation Pack transforms the  default Unity or GNOME desktop environment into a desktop environment  theme which resembles Mac OS X Yosemite.

---

The [Themes Collection by NoobsLab](https://launchpad.net/~noobslab/+archive/ubuntu/themes?field.series_filter=utopic) PPA has an interesting selection of themes for Ubuntu, including  MBuntu. The same PPA has a selection of theme packages resembling MAC OS X Lion for Ubuntu 12.04-18.04. To add this PPA to your software  sources, open the terminal and run the following commands:

```
sudo add-apt-repository ppa:noobslab/themes
sudo apt-get update
```

Then you can install any of five different MBuntu packages or any of  nine different Mac OS X theme packages for Ubuntu 12.04 from the Ubuntu  Software Center.

**Features**

- Themes are shiny, smooth, fast, and look like the latest Mac
- Mac Boot Splash auto configuration
- Mac theme for LightDM-webkit auto configuration
- Separate GTK themes for each desktop (Unity, Gnome Classic, Linux Mint)
- Latest icon set
- Auto set themes and icons script

### 出现的问题

#### 运行Plank时出现ubuntu Only X11 environments are supported.

解决：

edit `/etc/gdm3/custom.conf` and uncomment the line:

```
#WaylandEnable=false
```

by removing the `#` in front of it.

#### ubuntu不能隐藏自带的dock图标栏

解决：

1. Install the Gnome Extensions plugin:

```
sudo apt install gnome-shell-extensions
```

2.程序里找到刚安装的extension，运行

![image-20221022182100484](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221022182100484.png)

## Linux Mint下的MacOS风格配置

同在ubuntu下类似，只需要将应用图标、主题 两个文件夹拷贝到对应路径然后再执行一些配置

### 主题

```
cp -r Mojave-Dark ~/.themes/
```

### 应用程序图标

```
cp -r Mojave-CT-Night /usr/share/icons/
```

### 在系统主题设置中配置

![image-20221023162626532](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221023162626532.png)

### 将任务栏挪到顶部，设置自动隐藏

![image-20221023162843286](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221023162843286.png)

- ba固定在任务栏的图标全部取消
- 图标全部设置成最小号
- 注意它分为左中右三栏设置

### 安装模仿 MAC 效果的底部居中的 dock 栏。

```
sudo apt update && sudo apt install plank
```

启动plank后在上面按住ctrl鼠标右键进入配置。

### 将plank添加到开机启动

linux mint有专门的开机启动项管理软件，在里面去添加即可

## flameshot截图软件安装

安装命令：

```shell
sudo apt-get install flameshot
```

设置快捷键：

![image-20221022184609866](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20221022184609866.png)

## deepin-wine安装微信等程序

### 安装

1. 更新软件源

```
sudo apt-get update  
```

2. 添加仓库

首次使用时，需要运行如下一条命令将移植仓库添加到系统中。

```
wget -O- https://deepin-wine.i-m.dev/setup.sh | sh
```

3. 安装应用

执行完上面的命令，就可以正常地通过apt-get命令进行应用安装、更新和卸载清理了。

比如安装微信只需要运行下面的命令，

```
sudo apt-get install com.qq.weixin.deepin
```

其他应用安装包名

微信	com.qq.weixin.deepin
QQ	com.qq.im.deepin
TIM	com.qq.office.deepin
钉钉	com.dingtalk.deepin
阿里旺旺	com.taobao.wangwang.deepin
QQ音乐	com.qq.music.deepin
QQ视频	com.qq.video.deepin
爱奇艺	com.iqiyi.deepin

更丰富的应用参见https://deepin-wine.i-m.dev

4. 运行程序

先查看是否已经安装了程序

```shell
cd /opt/apps
ls
```

若存在com.qq.weixin.deepin文件夹，说明安装成功，接来下运行程序

```shell
cd com.qq.weixin.deepin
cd files
./run.sh
```

### 问题

* 没有应用图标

登出-登入用户即可，可注销或重启。

* 无法查看或者发送图片

因为deepin包是32位的用的是i386架构

```bash
sudo apt-get install libjpeg62-dev:i386
```

### 卸载清理

卸载与清理按照层次从浅到深可以分为如下四个层级。
 如果只是想清除APP账户配置啥的那么请按照1清理；如果你发现程序奔溃之类的，请按照1-2清理；如果需要卸载APP，按照1-2-3清理；如果你想把一切回到最初的起点，执行1-2-3-4清理。

1. 清理应用运行时目录
   例如QQ/TIM会把帐号配置、聊天文件等保存~/Documents/Tencent Files目录下，而微信是~/Documents/WeChat Files，删除这些文件夹以移除帐号配置等数据。
2. 清理wine容器
   deepin-wine应用第一次启动后会在~/.deepinwine/目录下生成一个文件夹（名字各不相同）用于存储wine容器（可以理解我一个“Windows虚拟机”），如果使用出了问题，可以试试删除这个目录下对应的子文件夹。
3. 卸载软件包
   执行 `sudo apt-get purge --autoremove <包名>`命令把你安装过的包给移除。
4. 移除软件仓库

```bash
sudo rm /etc/apt/preferences.d/deepin-wine.i-m.dev.pref \
        /etc/apt/sources.list.d/deepin-wine.i-m.dev.list \
        /etc/profile.d/deepin-wine.i-m.dev.sh
sudo apt-get update
```

## vscode设置成IDEA的快捷键

扩展里搜索IntelliJ IDEA Keybindings安装

## 安装mysql

### 一、删除之前安装的mysql

---

没有安装可以跳过

```shell
sudo apt-get remove --purge *mysql*
sudo rm -rf /etc/mysql /var/lib/mysql
sudo apt-get remove --purge *mariadb*
```

### 二、更新源

---

```shell
sudo apt update
sudo apt upgrade
```

### 三、安装mysql服务器

```shell
sudo apt install mysql-server
```

### 四、查看启动情况

```javascript
 sudo service mysql status
 sudo service mysql stop
 sudo service mysql start
```

### 五、设置用户名和密码（如果安装过程中设置，则下面可以跳过）

---

看下系统默认给的账户和密码，使用其登录mysql

```shell
sudo cat /etc/mysql/debian.cnf
```

```shell
mysql -u默认用户名 -p默认密码
```

### 六、重置用户名和密码

```shell
use mysql;  
update mysql.user set authentication_string=password('123456') where user='root' and Host ='localhost'; 
update user set  plugin="mysql_native_password";   
flush privileges;    
quit;   

```

**注：mysql80设置密码用下面的代码**

```shell
use mysql;  
alter user 'root'@'localhost' identified with mysql_native_password by '123456';   
flush privileges; 

```

### 七、创建用户并授权

```sql
>create user 'username'@'host' identified by 'password';
#其中username为自定义的用户名；host为登录域名，host为'%'时表示为 任意IP，为localhost时表示本机，或者填写指定的IP地址；paasword为密码
>grant all privileges on *.* to 'username'@'%' with grant option; 
#其中*.*第一个*表示所有数据库，第二个*表示所有数据表，如果不想授权全部那就把对应的*写成相应数据库或者数据表；username为指定的用户；%为该用户登录的域名
>flush privileges; 
```

**撤销授权**

```sql
#收回权限(不包含赋权权限)
REVOKE ALL PRIVILEGES ON *.* FROM user_name;
REVOKE ALL PRIVILEGES ON user_name.* FROM user_name;
#收回赋权权限
REVOKE GRANT OPTION ON *.* FROM user_name;

#操作完后重新刷新权限
flush privileges;
```

## 错误记录

### 在Digital Ocean配置用户时修改密码后无法登录，出现ERROR 1045 (28000): Access denied for user 'debian-sys-maint'@'localhost' (using password: YES)

**解决：重新修改密码：**

1.先设置为允许无密码登陆：L9@Digitalocean

sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

打开该文件之后在其中加入一条语句，保存并退出：

    skip-grant-tables

2.重启mysql，以root身份进入mysql(输入下面的第二条语句之后直接按回车即可)：

    service mysql restart
    mysql -u root -p

3.先将密码设置为空，刷新之后再将密码修改为准备好的密码(依次输入下列语句)：

    mysql> use mysql;
    mysql> flush privileges;
    mysql> UPDATE user SET authentication_string='' WHERE user='root';
    mysql> flush privileges;
    mysql> ALTER user 'root'@'localhost' IDENTIFIED BY 'the pwd you want';
    mysql> quit;

4. 再仿照第一步，将mysqld.cnf中加入的 那条语句删掉。
5. 重启mysql，并尝试用你设置的密码登录root账户:

`service mysql restart`

`mysql -u root -p`

### show databases;时报ERROR 1449 (HY000): The user specified as a definer does not exist

原因：mysql[数据库](https://cloud.tencent.com/solution/database?from=10680)在初始化时会创建四个保留帐号，在mysql.user中查询如下

![img](https://raw.githubusercontent.com/selfmakeit/resource/main/1620.png)

在这边需要重新创建缺失的用户，并赋予正确的权限；

创建三个用户

```
create user 'mysql.sys'@localhost identified by '666666';
create user 'mysql.infoschema'@localhost identified by '666666';
create user 'mysql.session'@localhost identified by '666666';
flush privileges;
```

授权，不太了解该用户的正确权限，故全给；

```
grant all privileges on *.* to 'mysql.infoschema'@localhost
grant all privileges on *.* to 'mysql.session'@localhost;
grant all privileges on *.* to 'mysql.sys'@localhost;
flush privileges;
```

验证

```
use sakila;
```

`show tables;` #恢复正常

### You are not allowed to create a user with GRANT;

mysql >  grant all privileges on test.* to root@'%'
 提示的错误信息如下：You are not allowed to create a user with GRANT;
 产生用户不能授权的原因是mysql 数据库中user 表中的特定用户(root) 的host 的属性值为localhost.

解决办法如下：

\# 使用mysql 数据库
 mysql > use mysql;
 \# 特定用户的host 修改
 mysql > update user set host='%' where user='root';
 \# 指定用户的授权
 mysql > grant all privileges on test.* to root@'%'

### 无法连接远程数据库ERROR 2003 (HY000): Can't connect to MySQL server on '24.199.108.221:3306' (111)

```sql
netstat -nat |grep :3306
```

正确应该是下面的样子

```sql
 tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN 
```

解决：找到带有bind-address的配置文件，将其注释掉，然后sudo service mysql restart重启服务

### 配置文件找不到bind-address

```shell
执行下面命令可以看到哪个文件有
sudo grep -rnw 'bind-address' /etc/mysql

```

## 安装GCC

ubuntu和LinuxMint一致

build-essential 指的是编译程序必须的软件包。
 查看该软件包的依赖关系，可以看到以下内容：

```
$ apt-cache depends build-essential
```

 build-essential
 |依赖: libc6-dev
 依赖: libc6-dev
 依赖: gcc
 依赖: g++
 依赖: make
 make:i386
 依赖: dpkg-dev
 冲突: build-essential:i386
 darkmi@ubuntu:/usr/local/httpd/bin$

也就是说，安装了该软件包，编译c/c++所需要的软件包也都会被安装。因此如果想在Ubuntu中编译c/c++程序，只需要安装该软件包就可以了。
 安装方法如下：

```
$sudo apt-get install build-essential
```

## 安装go

**1.若系统之前存在旧版本的go，无则跳过此步骤**

```abap
1、sudo rm -rf /usr/local/go
2、sudo apt-get remove golang
3、sudo apt-get remove golang-go
4、sudo apt-get autoremove
```

### **2. 获取安装包**

```text
#wget 后面的下载链接请去golang官网(https://go.dev/dl/)获取你想下载的对应go版本
sudo wget https://golang.google.cn/dl/go1.18.5.linux-amd64.tar.gz
# 解压文件
sudo tar xfz go1.18.5.linux-amd64.tar.gz -C /usr/local
```

**3.设置环境变量**

打开：

```text
sudo vim /etc/profile
```

将以下内容追加到文件末尾

```text
export GOROOT=/usr/local/go
export GOPATH=$HOME/gowork
export GOBIN=$GOPATH/bin
export PATH=$GOPATH:$GOBIN:$GOROOT/bin:$PATH
```

输入以下命令保存

```text
:wq
```

**4. 使环境变量生效**

```text
 source /etc/profile
```

如果只是这样做，在关闭终端后，重新打开环境变量又会失效，除了重新启动系统之外，可以在用户根目录的.bashrc

```text
cd ~
sudo vim .bashrc
```

在文件末尾加入如下命令

```text
source /etc/profile
```

### 5. 查看环境是否搭建成功

```text
go env
```

**6.开启GO111MOUDLE和更改GOPROXY**

```text
go env -w GOPROXY="https://goproxy.cn"
go env -w GO111MODULE=on
```

## 安装Node.js

**1.以具有sudo特权的用户身份运行以下命令，以下载并执行NodeSource安装脚本**

```text
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

**2.启用NodeSource存储库后，安装Node.js和npm**

```text
sudo apt-get install -y nodejs
```

**3.通过打印它们的版本来验证Node.js和npm是否已成功安装**

```text
node --version  # v18.4.0
npm --version  # v8.12.1
```

如果安装不了可以手动进行安装

**1. 如果存在旧的PPA先移除**

```text
# add-apt-repository may not be present on some Ubuntu releases:
# sudo apt-get install python-software-properties
sudo add-apt-repository -y -r ppa:chris-lea/node.js
sudo rm -f /etc/apt/sources.list.d/chris-lea-node_js-*.list
sudo rm -f /etc/apt/sources.list.d/chris-lea-node_js-*.list.save
```

**2. 添加 NodeSource 包签名密钥**

```text
KEYRING=/usr/share/keyrings/nodesource.gpg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null
# 使用 wget:
# wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null
gpg --no-default-keyring --keyring "$KEYRING" --list-keys
```

key：`9FD3B784BC1C6FC31A8A0A1C1655A0AB68576280`.

**3. 添加所需的 NodeSource 配置**

```text
# Replace with the branch of Node.js or io.js you want to install: node_6.x, node_8.x, etc...
VERSION=node_8.x
# Replace with the keyring above, if different
KEYRING=/usr/share/keyrings/nodesource.gpg
# The below command will set this correctly, but if lsb_release isn't available, you can set it manually:
# - For Debian distributions: jessie, sid, etc...
# - For Ubuntu distributions: xenial, bionic, etc...
# - For Debian or Ubuntu derived distributions your best option is to use the codename corresponding to the upstream release your distribution is based off. This is an advanced scenario and unsupported if your distribution is not listed as supported per earlier in this README.
DISTRO="$(lsb_release -s -c)"
echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list
```

**4. 更新软件包列表并安装 Node.js**

```text
sudo apt-get update
sudo apt-get install nodejs
```

## ganache安装

```bash
npm install -g ganache-cli
```

注意才nodejs版本大于16时运行ganache-cli会报错

解决办法：

降级nodejs版本

**5.升级、降级nodejs版本（降级需要指定降级的版本号）**

node有一个模块叫n，是专门用来管理node.js的版本。

升级步骤
　　1 、安装n模块

npm install -g n

　　2、 升级node.js到最新稳定版

　n stable

　  Ps: n后面也可以跟随版本号（用于升级或降级）比如：　　　

　n v8.8.1

    如果没有安装n模块也可以直接使用命令安装指定版本
    npm install npm@5.8.0 -g

列出所有已下载的版本

`n ls`

## solc安装

```
sudo npm install solc -g
```

将智能合约erc20.sol文件编译为JSON ABI

```
solcjs --abi erc20.sol
```

## abigen安装

```bash
go get -u github.com/ethereum/go-ethereum
cd $GOPATH/pkg/github.com/ethereum/go-ethereum(版本号)/
make
make devtools
```

使用 `abigen`从ABI创建Go包。

```
abigen --abi=erc20_sol_ERC20.abi --pkg=token --out=erc20.go
```

## 安装网易云

- 官网选择ubuntu版本下载，linux mint版本是基于debain和ubuntu的，所以ubuntu版本的软件LinuxMint也能兼容

### 错误解决

/opt/netease/netease-cloud-music/netease-cloud-music:  /opt/netease/netease-cloud-music/libs/libselinux.so.1: no version  information available (required by  /lib/x86_64-linux-gnu/libgio-2.0.so.0)

### 解决办法：

```shell
rm /opt/netease/netease-cloud-music/libs/libselinux.so.1 #删除
```

## 终端美化 zsh shell安装

Linux/Unix 提供了很多种 Shell，我么可以使用以下命令来查看当前命令所支持的 Shell：

```ps1con
cat /etc/shells
```

**什么是zsh**

和bash一样，zsh也是终端内的一个命令行解释器，简称：shell。顾名思义就是机器外面的一层壳，用于人机交互。接收用户或其他程序的命令，把这些命令转化成内核能理解的语言。

具体表现为其作用是用户输入一条命令，shell 就立即解释执行一条。不局限于系统、语言等概念、操作方式和表现方式等。比如：我们使用的 `cd`、`wget`、`curl`和 `mount`等命令。

**zsh的好处**

- 更丰富的命令提示
- 更鲜明的演示标记
- 更强大的插件支持

### 安装 zsh

如果你的Linux是基于**Debian/Ubuntu**，使用**apt-get**作为Linux软件包管理器，终端输入：

```text
apt-get install zsh
```

如果你的Linux是基于**Centos/Redhat**，使用**yum**作为Linux软件包管理器，终端输入：

```text
yum install zsh
```

安装后，重新使用 `cat /etc/shells`命令查看可发现多两个shell选择。

之后，将zsh设置为默认 `shell`：

```text
chsh -s   /bin/zsh
```

由于**zsh**设置过于复杂，但是我们可以使用**Oh-my-zsh**来快速配置，可以看后文**Oh-my-zsh**的配置方法。

### **配置并使用Oh-my-zsh**

**什么是Oh-my-zsh**

zsh的功能极其强大，只是配置过于复杂，起初只有极客才在用。后来，一些极客为了让更多人受益，开发了**Oh-my-zsh**这个插件，用来简化**zsh**的配置，让**zsh**更加容易上手。

#### 安装

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
```

安装过程中假如系统还没安装git会提示让你先安装git。

#### **zsh 配置主题**

oh-my-zsh 支持很多的主题，默认的主题文件在 `. oh-my-zsh/themes`目录下，通过 `ls`命令可以看到主题目录下的所有文件。

接着打开用户目录下的 `.zshrc`，并配置主题，默认主题被设置为 `robbyrussell`

**找到ZSH_THEME="robbyrussell"这一行，将后面的主题名字替换为想要更换的主题名**

更多的主题预览可以在[Themes · ohmyzsh/ohmyzsh Wiki (github.com)](https://link.zhihu.com/?target=https%3A//github.com/ohmyzsh/ohmyzsh/wiki/Themes)看到。

重启系统之后打开终端可发现配置已经生效。

## linuxMint配置右键在vscode打开文件夹

1. 进入~/.local/share/nemo/actions

```shell
$cd ~/.local/share/nemo/actions
$vim vscode.nemo_action
```

2. 粘贴以下内容

```bash
[Nemo Action]
Name=Open in VS Code
Comment=Open in VS Code
Exec=code %F
Icon-Name=com.visualstudio.code
Selection=Any
Extensions=dir;
```

## ubuntu安装Nginx

```shell
#sudo apt install nginx
#service nginx status/start/stop
```

nginx文件安装完成之后的文件位置：

- /usr/sbin/nginx：主程序
- /etc/nginx：存放配置文件
- /usr/share/nginx：存放静态文件
- /var/log/nginx：存放日志

在 /etc/nginx/conf.d/下去创建配置文件：

vim cg-dosc.conf:

![image-20230103143538126](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230103143538126.png)

```
nginx -s reload
```

## ubuntu开放端口

列出linux开放端口号命令

```shell
$ sudo netstat -lntu
$或者 netstat -aptn
```

在上述命令中，不同选项的含义如下：

l – 列出所有正在监听的端口

n – 显示端口号

t – 包括 tcp 端口

u – 包括 udp 端口

也可以使用ss命令获得相同的输出：

```shell
$ sudo ss -lntu
```

开放端口：

1、首先安装iptables（一般情况，ubuntu默认是安装好的）

```bash
sudo apt-get update

sudo apt-get install iptables
```

2、安装完成后，开放指定端口，如8080，使用一下命令

```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
```

3、sudo iptables-save

这样可以开放指定的端口，但是如果服务器重启，不会保存，所以我们需要对上述规则进行一下持续化操作

4、永久保存

```shell
sudo apt-get install iptables-persistent
```

保存命令

```shell
sudo netfilter-persistent save

sudo netfilter-persistent reload
```

## typora配置粘贴图片自动上传到github

1. 首先你得有一个github账号，然后建立一个仓库放图片，以后；
2. 在typora上设置

   ```rust
   文件->偏好设置->图片
   ```

   ![img](https://raw.githubusercontent.com/lsyhahaha/Mytypora/master/img/image-20220402213614185.png)

### 配置文件

```json
{
  "picBed": {
    "github": {
      "repo": "lsyhahaha/MyTypora",#格式 ： github用户名/仓库
      "token": "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",#你的github token
      "path": "img/",
      "customUrl": "",
      "branch": "master"
    },
    "current": "github",
    "uploader": "github"
  },
  "picgoPlugins": {}
}

// repo:用户名/仓库名
// token: 自己百度，懒得写了，相当于你的仓库的钥匙，你得有这个钥匙才能放图片在里面
```
