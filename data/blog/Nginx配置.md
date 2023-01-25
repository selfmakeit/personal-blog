---
title: nginx基本配置
date: '2022-10-08'
tags: ['nginx', 'config']
draft: false
summary: nginx基本配置,包含静态项目配置、前后端分离项目配置、https配置
---

# Nginx配置

## 目录结构

nginx文件安装完成之后的文件位置：

- /usr/sbin/nginx：主程序
- /etc/nginx：存放配置文件
- /usr/share/nginx：存放静态文件
- /var/log/nginx：存放日志

/etc/nginx/nginx.conf是主配置文件，一般情况下不在这个文件去配置，而采取在别的文件夹里面配置后引入到这个主配置文件。

打开主配置文件我们可以看到其中有两行

```bash
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/*;
```

我们可以在这两个文件夹下面去新建自己的配置文件，一般情况下一个服务对应一个配置文件

nginx的基本配置为：

1. 新建配置文件，并进行配置
2. 使用nginx -s reload重新加载配置文件

**注意事项：**

1. 对于有些端口配置过后要检查防火墙是否放行了该端口。
2. 在主配置文件中顶部有一个user配置项，对于有些文件要看该user是否有访问权限，一般情况下直接将该user配置成root
3. vue中假如路由模式是history的话在nginx的server配置时要注意加上try_files $uri $uri/ /index.html;否则会出现在浏览器直接输入路径访问时报404。

**常犯错误：**

在配置域名时，容易犯一个很低级的错误，配置如下
![image-20230103225843681](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230103225843681.png)

这样当在浏览器输入docs.cryptogang.vip时响应的却是nginx的默认页面，但端口改为80后又能正常跳转，造成一种只有80端口能响应的假象，因为其他端口防火墙也是开放的。

这其实是当你只输入域名时恰好访问的就是80端口，域名是不带端口的，在浏览器输入域名的默认端口就是80端口。假如你想要的正确访问的话需要在域名后带上端口号。

而在这种情况下常规的做法是在服务器配置nginx转发，比如：
![微信图片_20230103230456](https://raw.githubusercontent.com/selfmakeit/resource/main/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20230103230456.png)

这样我们在访问时就可以直接输入域名，再由80端口转发到其他端口。

## 多服务配置

参考：[Configure a second web using a hostname in Nginx](https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnetcore/practice-troubleshoot-linux/2-7-configure-second-nginx-site-hostname)

配置案例：有一个前后端分离的项目，以及项目的文档网站。

1. 先去域名网站设置域名解析

![image-20230125184535099](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230125184535099.png)

2. 在/etc/nginx/sites-enabled/文件夹下新建xxx.cnf,其实文名和后缀起什么都可以，因为我们在主配置文件里可以看到其引入方式是：include /etc/nginx/sites-enabled/*;
3. 完整配置文件如下：（无https）

```shell
  #操作手册
  server {
    listen 80;
    server_name docs.cryptogang.vip;

   location / {
        charset utf-8;
        root  /usr/local/cryptogang/_book/;
        index index.html index.htm;
        autoindex on;
        try_files $uri $uri/ =404;
    }
}

#服务
server {
    listen 80;
    listen  [::]:80;
    server_name cryptogang.vip;
    #前端
   location / {
       charset utf-8;
        root  /home/spike/dist;
        index index.html index.htm;
        autoindex on;
        try_files $uri $uri/ =404;
    }
    #转发接口
    location /api {
        #第一行是因为我后端接口路径没有'/api'
         rewrite ^/api/(.*)$ /$1 break;
         proxy_pass http://localhost:4728;

         proxy_http_version 1.1;
         proxy_set_header Connection "";
         proxy_connect_timeout 300s;
         proxy_send_timeout 900;
         proxy_read_timeout 900;
         proxy_buffer_size 32k;
         proxy_buffers 4 64k;
         proxy_busy_buffers_size 128k;
         proxy_redirect off;
         proxy_hide_header Vary;
         proxy_set_header Accept-Encoding '';
         proxy_set_header Referer $http_referer;
         proxy_set_header Cookie $http_cookie;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
    }
    #websocket需要单独配置
    location /system/ws {
         proxy_pass   http://127.0.0.1:4728/system/ws;
         proxy_http_version 1.1;
         #解决client is not using the websocket protocol错误
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection upgrade;
 }
}
```

## https配置

1. 先去域名网站申请ssl证书

> 注意子域名也需要单独申请
>
> 比如你有cryptogang.vip的一级域名用于你的主网站，另外有一个docs.cryptogang用于网站文档。假如两个都需要https的话则两个都要单独申请证书。

2. 将两个证书分别上传到服务器
3. 在/etc/nginx/sites-enabled/下新建配置文件，注意如果有以前配置同样网站的'无https'版本则需要先将其删除，因为同域名同样监听80端口的话有一个会被忽略
4. 配置逻辑：

   > 两个域名都暴露出80端口和443端口，对于80端口接收到的请求转发到https（443端口），
   >
   > 此时前端项目中的接口请求和websocket也会被转发到443，在443里去分配路径，有另一种方式就是先在80里面分配路径，然后根据请求路径的不同按情况处理，这里使用的第一种方式，先全部转发到443，在443里处理。
   >
   > 然后前端项目另使用一个端口。（这里的前端项目采用的build之后将文件放在服务器，而不是直接在服务器npm run dev/server的方式）
   >
5. 完整配置如下

```shell
server {
    listen 80;
    server_name cryptogang.vip;
    #将请求转成https
    rewrite ^(.*)$ https://$host$1 permanent;
}
server {
  #监听443端口
    listen 443 ssl;
    #你的域名
    server_name cryptogang.vip;
    #ssl证书的pem文件路径
    ssl_certificate  /usr/local/cryptogang/server/config/httpsCrt/server/cryptogang.vip.pem;
    #ssl证书的key文件路径
    ssl_certificate_key /usr/local/cryptogang/server/config/httpsCrt/server/cryptogang.vip.key;

    location / {
     proxy_pass  http://localhost:6666;
    }

    location /api {
    	 #第一行是因为我后端接口路径没有'/api',这里是'/api'前缀
         rewrite ^/api/(.*)$ /$1 break;
         proxy_pass http://localhost:4728;

         proxy_http_version 1.1;
         proxy_set_header Connection "";
         proxy_connect_timeout 300s;
         proxy_send_timeout 900;
         proxy_read_timeout 900;
         proxy_buffer_size 32k;
         proxy_buffers 4 64k;
         proxy_busy_buffers_size 128k;
         proxy_redirect off;
         proxy_hide_header Vary;
         proxy_set_header Accept-Encoding '';
         proxy_set_header Referer $http_referer;
         proxy_set_header Cookie $http_cookie;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /system/ws {
         proxy_pass   http://127.0.0.1:4728/system/ws;
         proxy_http_version 1.1;
         #解决client is not using the websocket protocol错误
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection upgrade;
 }
}
server {
    listen 6666;
    server_name localhost;
    location / {
       charset utf-8;
       #前端项目文件夹
        root  /home/spike/dist;
        index index.html index.htm;
        autoindex on;
        try_files $uri $uri/ =404;
        #vue假如路由模式是history或者使用的createWebHistory()的话，在vite.config.ts里base要写成"https://cryptogang.vip/"
    }
}
#操作手册gitbook
server {
    listen 80;
    server_name docs.cryptogang.vip;
    #将请求转成https
    rewrite ^(.*)$ https://$host$1 permanent;
}

server {
    listen 443 ssl;
    #域名
    server_name docs.cryptogang.vip;
    #ssl证书的pem文件路径
    ssl_certificate  /usr/local/cryptogang/server/config/httpsCrt/doc/docs.cryptogang.vip.pem;
    #ssl证书的key文件路径
    ssl_certificate_key /usr/local/cryptogang/server/config/httpsCrt/doc/docs.cryptogang.vip.key;

    location / {
     #注意这里在最后要加上'/'不然会报'Your connection is not private',但是在上面的前端项目却不需要
     proxy_pass  http://localhost:7777/;
    }
}

server {
    listen 7777;
    server_name localhost;

   location / {
        charset utf-8;
        root  /usr/local/cryptogang/_book/;
        index index.html index.htm;
        autoindex on;
        try_files $uri $uri/ =404;
    }
}

```

## 错误记录一

vue3路由 createWebHashHistory模式，服务器nginx配置了try_files $uri $uri/ /index.html;后直接输入路径时还是无法访问，报错：

Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.

解决：

> 在vite.config.ts中 `base`属性，在开发环境下可以是 `./`，但在生产环境下需要为**具体路径**或 `/`。因此需要针对不同的模式配置不同的 `base`属性值。
>
> ![image-20230125184420519](https://raw.githubusercontent.com/selfmakeit/resource/main/image-20230125184420519.png)

基于此，把base设置成'https://cryptogang.vip/'后就可以了

## 错误记录二 （后端）

也是第一次使用nginx，连学都没学过。在这次使用中遇到了一个问题，我在后端代码中设置了HTTPS：

```go
//中间件：
/**
*添加对https的支持
 用https把这个中间件在router里面use一下就好
 */
func TlsHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		secureMiddleware := secure.New(secure.Options{
			SSLRedirect: true,
			SSLHost:     global.GD_CONFIG.SslConfig.Domain,
		})
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			// 如果出现错误，请不要继续
			fmt.Println(err)
			return
		}
		// 继续往下处理
		c.Next()
	}
}
```

```go
//router初始化文件中：
if global.GD_CONFIG.SslConfig.Enable {
		Router.Use(middleware.TlsHandler()) 
	}
```

```go
//服务启动文件中：
if global.GD_CONFIG.SslConfig.Enable {
			if err := srv.ListenAndServeTLS(global.GD_CONFIG.SslConfig.Pem, global.GD_CONFIG.SslConfig.KeyStr); err != nil && err != http.ErrServerClosed {
				log.Fatal("listen: ", err)
			}
		} else {
			if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				log.Fatal("listen: ", err)
			}
		}
```

那么在上面nginx的https配置中：

```shell
location /api {
		 #第一行是因为我后端接口路径没有'/api',这里是'/api'前缀
         rewrite ^/api/(.*)$ /$1 break;
         proxy_pass http://localhost:4728;
```

这一段是否就不用转发到http：//localhost:4728;而是只用去除前缀就可以了？没有试过，不想搞了
