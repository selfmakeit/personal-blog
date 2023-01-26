---
title: java代码中执行系统命令
date: '2021-6-013'
tags: ['Java']
draft: false
summary:  java代码中执行系统命令
---
# Java代码中执行系统命令

在java中，RunTime.getRuntime().exec()实现了调用服务器命令脚本来执行功能需要。

如果我们想在500秒后使电脑关机，通过Runtime.getRuntime().exec()我们可以这样写:

```java
//添加一个60S后自动关闭计算机的计划。
Runtime.getRuntime().exec(shutdown -s -t 500);
```

**两个例子：**

1. 备份mysql数据库：

```java
/**数据库备份成sql文件
	 * mysqldump --opt --column-statistics=0 -h192.168.190.11 --user=root --			password=Root2021@ 
	 * --lock-all-tables=true --result-file=/home/hwadee/2021-08-24-databackup.sql 
	 * --default-character-set=utf8 cqlcb
	 *其中cqlcb为数据库名
	 */
	public  boolean backupDatabaseToSQL() {
	String url = PropsUtil.get(PropsKeys.JDBC_DEFAULT_URL);
	String cleanURI = url.substring(5);
	URI uri = URI.create(cleanURI);
	String hostIP=uri.getHost();
	String databaseName=uri.getPath().substring(1);
	String password = PropsUtil.get( PropsKeys.JDBC_DEFAULT_PASSWORD);
	String userName = PropsUtil.get(PropsKeys.JDBC_DEFAULT_USERNAME);

	String savePath =DataBackupConstant.DATABASE_BACKUP_PATH;
	String fileName = DataBackupConstant.getDatabaseBackupTargetPath();
	File saveFile = new File(savePath);

	if (!saveFile.exists()) {// 如果目录不存在
		saveFile.mkdirs();// 创建文件夹
	}
	if (!savePath.endsWith(File.separator)) {
		savePath = savePath + File.separator;
	}
	PrintWriter printWriter = null;
	BufferedReader bufferedReader = null;

	try {
		printWriter = new PrintWriter(new OutputStreamWriter(new FileOutputStream(savePath + fileName), "utf8"));
		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.append("mysqldump").append(" --opt").append(" -h").append(hostIP);
		stringBuilder.append(" --user=").append(userName).append(" --password=").append(password)
		.append(" --lock-tables=true");
		stringBuilder.append(" --result-file=").append(savePath + fileName).append(" --default-character-set=utf8 ")
		.append(databaseName);
		Process process = Runtime.getRuntime().exec(stringBuilder.toString());
		InputStreamReader inputStreamReader = new InputStreamReader(process.getInputStream(), "utf8");
		bufferedReader = new BufferedReader(inputStreamReader);
		String line;
		while ((line = bufferedReader.readLine()) != null) {
		printWriter.println(line);

		}
		printWriter.flush();

		if (process.waitFor() == 0) {// 0 表示线程正常终止。
			return true;
		}

	} catch (IOException | InterruptedException) {
		e.printStackTrace();
	} finally {
		try {
			if (bufferedReader != null) {
				bufferedReader.close();
			}
			if (printWriter != null) {
				printWriter.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	return false;

	}
```

2. 备份系统中的文件夹：

windows:

```java
public boolean backupFolder() {
		try {
			String location = "E:\\project\\"; //File path you are getting from file chooser
			String target = "F:\\backup\\";
			File locFile = new File(target);
			File tarFile = new File(target);
			copyDirectory(locFile, tarFile);
			return true;
		} catch (IOException ex) {
			ex.printStackTrace();
		}
		return false;
	
	}
	public void copy(File sourceLocation, File targetLocation) throws IOException {
        if (sourceLocation.isDirectory()) {
            copyDirectory(sourceLocation, targetLocation);
        } else {
            copyFile(sourceLocation, targetLocation);
        }
    }
    private void copyDirectory(File source, File target) throws IOException {
        if (!target.exists()) {
            target.mkdir();
        }

        for (String f : source.list()) {
            copy(new File(source, f), new File(target, f));
        }
    }

    private void copyFile(File source, File target) throws IOException {
        try (
                InputStream in = new FileInputStream(source);
                OutputStream out = new FileOutputStream(target)) {
            byte[] buf = new byte[1024];
            int length;
            while ((length = in.read(buf)) > 0) {
                out.write(buf, 0, length);
            }
        }
    }

```

linux:

```java
public boolean backupWebFolder() {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMDD");
            Date date=new Date();
            StringBuilder stringBuilder =new StringBuilder();
            String tempString = DataBackupConstant.WEB_BACKUP_TARGET_FOLDER.substring(0,DataBackupConstant.WEB_BACKUP_TARGET_FOLDER.length()-2);
            String partFileName = tempString.substring(tempString.lastIndexOf("/"));
            stringBuilder.append("tar -zcPvf ").append(DataBackupConstant.WEB_BACKUP_TARGET_FOLDER).append(partFileName)
            .append(sdf.format(date)).append(".tar  ")
            .append(DataBackupConstant.WEB_FOLDER_LOCATION);
            Process process = Runtime.getRuntime().exec(stringBuilder.toString());
            if (process.waitFor() == 0) {// 0 表示线程正常终止。
          
            	return true;
            }
        } catch (IOException | InterruptedException ex) {
            ex.printStackTrace();
        }
		return false;
      
    }
```
