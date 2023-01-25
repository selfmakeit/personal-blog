---
title: windchill 常用api整理
date: '2020-10-08'
tags: ['windchill', 'java']
draft: false
summary: windchill 常用api整理
---

# api整理

## 获取新建文档时下一个生成的编号

```java
//获取新建文档时下一个生成的编号
number = PersistenceHelper.manager.getNextSequence(WTDocumentIDSeq.class);
```

## 数字传化为十位有效数字（编号）

```java
{	//187转化为0000000187   
	NumberFormat numFormat = NumberFormat.getInstance();
	numFormat.setMinimumIntegerDigits(10);
	numFormat.setMaximumIntegerDigits(10);
	numFormat.setGroupingUsed(false);
	number = numFormat.format(Integer.parseInt(number));
}
```

##刷新页面

```java
// 以下代码可以实现，刷新父页面 
localFormResult.setJavascript("window.opener.location.href = window.opener.location.href;window.close();window.opener.location.reload(true);");
localFormResult.setNextAction(FormResultAction.JAVASCRIPT);
```

## 查找最新part

```java
    public static WTPart getLatestPartByNumber (String partNumber) throws WTException {
		WTPart part = null;
		if (partNumber != null) {
			QuerySpec qs = new QuerySpec(WTPart.class);
			SearchCondition sc = new SearchCondition(WTPart.class,WTPart.NUMBER,SearchCondition.EQUAL,partNumber.toUpperCase());
//			logger.debug("part number = "+partNumber.toUpperCase());
			qs.appendWhere(sc,new int[]{});
			QueryResult qr = PersistenceHelper.manager.find(qs);
			LatestConfigSpec configSpec = new LatestConfigSpec();
			qr = configSpec.process(qr);
			if (qr.hasMoreElements()) {
				part = (WTPart)qr.nextElement();
//				logger.debug("find part = "+part.getNumber());
			}
		}
		return part;
	}
```

## 根据part找到子part(api方式)

```java
 QueryResult childqr = WTPartHelper.service.getUsesWTPartMasters(part);
        while (childqr.hasMoreElements()) {
            //获取每个BOM
            WTPartUsageLink usageLink = (WTPartUsageLink) childqr.nextElement();
            WTPartMaster childMaster = usageLink.getUses();
            //根据master获取最新的part
            WTPart childPart = PartUtil.getLatestPart(childMaster);
            //作用：用于收集所有的子部件（递归的时候：必须传递回去）
            childParts.add(childPart);
            //递归循环每个子BOM，并传入储存子part的变量
            getAllChild(childPart, childParts);
        }
```

## 创建part

```java
public static void createPart(PartBean p){
     try {
         WTPart part = WTPart.newWTPart(p.getPartNumber(),p.getPartName());
         WTContainer wtContainer = Helper.getConatinerByName(p.getContainer());
         WTContainerRef containerRef = WTContainerRef.newWTContainerRef(wtContainer);
            Folder folder1 = FolderHelper.service.getFolder(p.getFolder(), containerRef);

            FolderHelper.assignLocation((FolderEntry)part, folder1);
            part = (WTPart) PersistenceHelper.manager.save(part);
            part= (WTPart) PersistenceHelper.manager.refresh(part);
        } catch (WTException e) {
            e.printStackTrace();
        }
    }
```

## 删除part

```java
public static void deletePart(PartBean p){
            WTPart part=getLatestPartByNumber(p.getPartNumber());
            PersistenceHelper.manager.delete(part);
            part= (WTPart) PersistenceHelper.manager.refresh(part);
      
    }
```

## 创建BOM

```java
public static void createBOM(String parentNumber,String childNumber){
        try {
            WTPart parentPart=getLatestPartByNumber(parentNumber);
            WTPart childPart=getLatestPartByNumber(childNumber);
            if(null==parentPart){
                System.out.println("parentNumber 不存在！");
            } if( null==childPart){
                System.out.println("childNumber 不存在！");
            }
            else{
                WTPartUsageLink newLink = WTPartUsageLink.newWTPartUsageLink(parentPart, childPart.getMaster());
                PersistenceServerHelper.manager.insert(newLink);
            }
        } catch (WTException e) {
            e.printStackTrace();
        }
    }
```

## 获取Excel单元格数据

```java
public static String getCellValueByCell(Cell cell) {
        //判断是否为null或空串
        if (cell==null || cell.toString().trim().equals("")) {
            return "";
        }
        String cellValue = "";
        int cellType=cell.getCellType();
        switch (cellType) {
            case Cell.CELL_TYPE_STRING: //字符串类型
                cellValue= cell.getStringCellValue().trim();
                cellValue= StringUtils.isEmpty(cellValue) ? "" : cellValue;
                break;
            case Cell.CELL_TYPE_BOOLEAN:  //布尔类型
                cellValue = String.valueOf(cell.getBooleanCellValue());
                break;
            case Cell.CELL_TYPE_NUMERIC: //数值类型
                cellValue = new DecimalFormat("#.######").format(cell.getNumericCellValue());
                break;
            default: //其它类型，取空串吧
                cellValue = "";
                break;
        }

        return cellValue;
    }
```

## 从Excel导入数据步骤

```java
{
	File file= new File("D:\\xxxxx.xls");
	Workbook wb = WorkbookFactory.create(new FileInputStream(file));
    //读取excel文件
    Sheet sheet = wb.getSheetAt(0);//读取excel中第1页信息
    for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
        Row row = sheet.getRow(j); // 从excel中的第二行开始读取数据
        if (row == null) {
            break;
        }
        Cell cell = row.getCell(0);
        String cellValue = getCellValueByCell(cell);
        if ("#EOF".equalsIgnoreCase(cellValue)) {
            break;
        }
		//接收读取到的数据
        String action = getCellValueByCell(row.getCell(0));
        String partNumber = getCellValueByCell(row.getCell(1));
        String partName = getCellValueByCell(row.getCell(2));
        String container = getCellValueByCell(row.getCell(3));
        String folder = getCellValueByCell(row.getCell(4));
        String bac_code = getCellValueByCell(row.getCell(5));
        String description = getCellValueByCell(row.getCell(6));

}
```

## 导出数据到Excel步骤

```java
public static void exportToExcel(List<PartMsgEntity> partlist,
                                     String filename,String sheetname){
        //1.创建一个workbook，对应一个excel文件
        HSSFWorkbook workbook = new HSSFWorkbook();
        //2.在excel中创建一个sheet
        HSSFSheet sheet =workbook.createSheet(sheetname);
        //3.在sheet表中创建表头第0行
        HSSFRow row =sheet.createRow(0);
        //4.在第0行中创建第一个单元格
        HSSFCell cell =row.createCell(0);
        cell.setCellValue("父类");
        //第二个单元格
        cell=row.createCell(1);
        cell.setCellValue("子类");
        cell=row.createCell(2);
        cell.setCellValue("行号");
        //5.写入实体数据到excel表格中，实际应用中这些数据来自于数据库，对象封装数据，集合包含对象。
        //每一个对象对应一行数据，对象的每个属性对应表格的每一列。
        //List<PartMsgEntity> orderListByNumber =
        for (int i=0;i<partlist.size();i++){
            HSSFRow row1=sheet.createRow(i+1);
            row1.createCell(0).setCellValue(partlist.get(i).getParentName());
            row1.createCell(1).setCellValue(partlist.get(i).getSonName());
            long linenumber=partlist.get(i).getLineNumber();
            if(0!=linenumber){
                row1.createCell(2).setCellValue(linenumber);
            }
        }
        File file =new File(filename);
        try {
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            workbook.write(fileOutputStream);
            System.out.println("写入成功！");
            fileOutputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
```

## 跳过权限

```java
{
	boolean flag = SessionServerHelper.manager.setAccessEnforced(false);//跳过权限
            try {
                	//do something
                }
            }catch (Exception e){
                throw new WTException(e,e.getLocalizedMessage());
            }finally {
                SessionServerHelper.manager.setAccessEnforced(flag);
            }
}
```

## 根据名字获取组

```java
public static WTGroup getGroupByName (String groupName) throws WTException {
		QuerySpec qs = new QuerySpec(WTGroup.class);
		SearchCondition sc = new SearchCondition(WTGroup.class, WTGroup.NAME, SearchCondition.EQUAL, groupName);
		qs.appendWhere(sc, new int[]{});
		ClassAttribute ca = new ClassAttribute(WTGroup.class,"thePersistInfo.updateStamp");
		OrderBy orderBy = new OrderBy(ca, true);
		qs.appendOrderBy(orderBy, new int[1]);
		qs.setAdvancedQueryEnabled(true);
		QueryResult qr = PersistenceHelper.manager.find(qs);
		WTGroup group = null;
		if (qr.hasMoreElements()) {
			group = (WTGroup) qr.nextElement();
		}
		return group;
	}
```

## 获取组内所有成员

```java
public static List<WTUser> searchGroupMember(WTGroup group){
		List<WTUser> users = new ArrayList<WTUser>();
		try {
			Enumeration member = group.members();
			while(member.hasMoreElements()){
				WTPrincipal principal = (WTPrincipal) member.nextElement();
				if(principal instanceof WTUser){
					users.add((WTUser)principal);
				}else if(principal instanceof WTGroup){
					List<WTUser> userss = searchGroupMember((WTGroup)principal);
					users.addAll(userss);
				}
			}
		} catch (WTException e) {
			e.printStackTrace();
		}
		return users;
	}
```

## 根据名字获取用户

```java
public static WTUser getWTUserByUserName(String userName) throws WTException{
		WTUser user = null;
		QuerySpec qs;

		qs = new QuerySpec(WTUser.class);
		SearchCondition sr = new SearchCondition(WTUser.class,WTUser.NAME,
				SearchCondition.EQUAL,userName);
		qs.appendWhere(sr,new int[]{});
		QueryResult qr;

		qr = PersistenceHelper.manager.find(qs);
		if(qr.hasMoreElements()){
			user = (WTUser)qr.nextElement();
		}
		return user;
	 }
```

## 获取当前用户

```java
WTPrincipalReference principalReference = SessionHelper.manager.getPrincipalReference();
WTUser loginUser =(WTUser) principalReference.getPrincipal();
//或者直接
WTUser loginUser = (WTUser)SessionHelper.manager.getPrincipalReference().getPrincipal();
```

假如是在validator里获取：

```java
WTPrincipalReference principalReference = validationCriteria.getUser();
WTUser loginUser = (WTUser) principalReference.getPrincipal();
```

##获取对象OID

```java
public static String getOID(WTObject primaryBusinessObject){
    	long objectOID = PersistenceHelper.getObjectIdentifier(primaryBusinessObject).getId();
    	return String.valueOf(objectOID);
    }
```

##获取容器

```java
 public static WTContainer getConatinerByName(String containerName) throws WTException {
        WTContainer wtc = null;
        QuerySpec qs = new QuerySpec(PDMLinkProduct.class);
        SearchCondition sc = new SearchCondition(PDMLinkProduct.class,
                PDMLinkProduct.NAME, SearchCondition.EQUAL, containerName);
        qs.appendWhere(sc);
        QueryResult qr = PersistenceHelper.manager.find(qs);
        while(qr.hasMoreElements()){
            wtc = (WTContainer)qr.nextElement();
        }
        return wtc;
    }
```

##在validator中校验当前登录用户是否是管理员或者是否为产品库中的某个角色

下面代码是文件夹拷贝功能的角色验证：

```java
public class RoleValidator extends DefaultSimpleValidationFilter {

    private static Logger logger = LogR.getLogger(StartDocWorkflowActionValidator.class.getName());

    @Override
    public UIValidationStatus preValidateAction(UIValidationKey paramUIValidationKey, UIValidationCriteria params){
        WTReference contextObject = params.getContextObject();

        Persistable p = params.getPageObject().getObject();
        if(params.isContainerAdmin()){
            return UIValidationStatus.ENABLED;
        }else{
            if (p instanceof Cabinet) {
                Cabinet cabinet = (Cabinet)params.getPageObject().getObject();

               WTContainer container = cabinet.getContainer();
                WTPrincipalReference principalReference = params.getUser();
                try {
                    WTUser loginUser = (WTUser) principalReference.getPrincipal();
                    WTContainerRef wtContainerRef = params.getParentContainer();
                    Vector<Role> roles = new Vector<Role>();
                    ContainerTeam productTeam = ContainerTeamHelper.service.getContainerTeam((ContainerTeamManaged)container);
                    Enumeration enum1 = ContainerTeamHelper.service.findContainerTeamGroups(productTeam, ContainerTeamHelper.ROLE_GROUPS);
                    while (enum1.hasMoreElements()){
                        WTGroup group = (WTGroup)enum1.nextElement();
                        if (group.isMember(loginUser)){
                            Role role = Role.toRole(group.getName());
                            System.out.println(group.getName());
                            if (role.toString().equalsIgnoreCase("PM")){
                                return UIValidationStatus.ENABLED;
                            }
                        }
                    }
                } catch (WTException e) {
                    e.printStackTrace();
                }
                }
        }
        logger.debug("context object  = "+p);

        return UIValidationStatus.HIDDEN;
    }
}

```

##获取容器里的文件夹

```java
WTContainer wtContainer = Helper.getConatinerByName(containerName);
WTContainerRef containerRef = WTContainerRef.newWTContainerRef(wtContainer);
//folderName:"/Default/folder_01"
Folder folder1 = FolderHelper.service.getFolder(folderNme,containerRef);
```

## 创建文件夹

```java
public static void createFolder() throws WTException {
        WTContainer wtContainer = Helper.getConatinerByName("practice");
        WTContainerRef containerRef = WTContainerRef.newWTContainerRef(wtContainer);
        Folder parentFolder = FolderHelper.service.getFolder("/Default/codeCreated", containerRef);
        //Folder parentFolder = wtContainer.getDefaultCabinet();//设置父文件夹为/Default
        wtContainer.getDefaultCabinet();
        SubFolder newFolder = SubFolder.newSubFolder("codeCreated");
        boolean originalForce = SessionServerHelper.manager.isAccessEnforced();
        try {
            newFolder.setContainerReference(parentFolder.getContainerReference());
            SessionServerHelper.manager.setAccessEnforced(false);
            FolderHelper.assignLocation(newFolder, parentFolder);
            //获取父文件夹的域
            AdminDomainRef df=((DomainAdministered)parentFolder).getDomainRef();
            //获取默认域
            // AdminDomainRef df = wtContainer.getDefaultDomainReference();
            ((DomainAdministered) newFolder).setDomainRef(df);
        } catch (WTPropertyVetoException e) {
            e.printStackTrace();
        } finally {
            SessionServerHelper.manager.setAccessEnforced(originalForce);
        }
        newFolder = (SubFolder) PersistenceHelper.manager.save(newFolder);
    }
```

或者

```java
FolderHelper.service.createSubFolder(String s,AdminDomainRef adminDomainRefWTContainerRef wtContainerRef);
```

##列出文件夹里的内容

```java
wt.projmgmt.admin.Project2 porject=null;  // type of wtcontainer
wt.folder.Cabinet cabinet = porject.getDefaultCabinet();
 wt.fc.QueryResult query =  wt.folder.FolderHelper.service.findSubFolders(cabinet);
     java.util.Enumeration <wt.folder.SubFolder>enums =query.getEnumeration();
        while(enums.hasMoreElements()){
              wt.folder.SubFolder folder =    enums.nextElement(); 
      		  wt.fc.QueryResult query2= wt.folder.FolderHelper.service.findFolderContents(folder);  //get data
              java.util.Enumeration enums2=query2.getEnumeration();
         while(enums2.hasMoreElements()){
               Object obj=enums2.nextElement();
                if(obj instanceof wt.doc.WTDocument ){
                         wt.doc.WTDocument doc= (wt.doc.WTDocument)obj;

                         out.println(    " doc "+ doc.getName()  );
            }    
        }
```

##查询某个容器里的指定名称的文件夹（可能在不同层级存在多个同名文件夹）

```java
 public static List<Folder> findTargetFolder(String targetFolderName,WTContainer container) throws WTException {
        Cabinet cabinet = container.getDefaultCabinet();
        List<Folder> targets =new ArrayList<>();
        class FindUtil{
            public void doFind(Folder folder) throws WTException {
                QueryResult query = FolderHelper.service.findSubFolders(folder);
                Enumeration<SubFolder> enums = query.getEnumeration();
                while (enums.hasMoreElements()){
                    SubFolder sub = enums.nextElement();
                    if(sub.getName().equals(targetFolderName)){  
                        targets.add(sub);
                    }
                    doFind(sub);
                }
            }
        }
        FindUtil f =new FindUtil();
        f.doFind(cabinet);
        return targets;
    }
```

##创建文档并设置主内容或者次要内容

```java
void createAndUpload(String name, String number, WTContainerRef product, Folder folder) 
		throws WTInvalidParameterException, WTException, PropertyVetoException, IOException {
	Transaction tx = new Transaction();
	try{
		WTDocument doc = WTDocument.newWTDocument(name, number, DocumentType.getDocumentTypeDefault());
		doc.setContainerReference(product);
		doc.setDomainRef(((WTContainer) product.getObject()).getDefaultDomainReference());
		FolderHelper.assignLocation((FolderEntry)doc, (Folder)folder);
		// WTDoc needs to be stored before content may be added
		doc = (WTDocument)PersistenceHelper.manager.store(doc);
	
		ApplicationData theContent = ApplicationData.newApplicationData(doc);
		String filename = "test.txt";
		File theFile = new File("C:\\test.txt");
		theContent.setFileName(filename);
        //if it’s secondary, use “SECONDARY”
		theContent.setRole(ContentRoleType.PRIMARY); 
		theContent.setFileSize(theFile.length());
		FileInputStream fis = new FileInputStream(theFile);
	
		tx.start();
		theContent = ContentServerHelper.service.updateContent(doc, theContent, fis);
		ContentServerHelper.service.updateHolderFormat(doc);
		tx.commit();
	
		doc = (WTDocument) PersistenceHelper.manager.refresh((Persistable) doc, true, true);
		fis.close();
	}catch(Exception e) {
		e.printStackTrace();
		tx.rollback();
	}
}
```

## 获取文档里的主内容并且保存

```java
{
	 String basePath="D:\\signature\\";
	 WTDocument document = (WTDocument) pbo;

     ContentHolder contentHolder = ContentHelper.service.getContents(document);
     ApplicationData applicationData = (ApplicationData)ContentHelper.getPrimary((FormatContentHolder)contentHolder);
     String fileName = applicationData.getFileName();//文档名称
     String filePath = basePath+fileName;
     System.out.println("filtpath+filename:"+filePath);
     ContentServerHelper.service.writeContentStream(applicationData,filePath);
}
```

##获取文档相关对象里参考文档
 官方支持API为WTDocumentHelper.service.getDependsOnWTDocuments(WTDocument document boolean onlyOtherSides)
    示例代码如下：

```java
QueryResult qr = WTDocumentHelper.service.getDependsOnWTDocuments(doc1, false);
while (qr.hasMoreElements()) {

WTDocumentDependencyLink link = (WTDocumentDependencyLink)qr.nextElement();

WTDocument dependsOnDoc = (WTDocument)link.getDependsOn();

System.out.println("dependsOnDoc name is: " + dependsOnDoc.getName());
}
```

其他相关api：

```java
    通过部件获取相关说明方文档的API：

QueryResult qr = WTPartHelper.service.getDescribedByWTDocuments(WTPart part)

    通过文档获取相关说明部件的API：

QueryResult qr = WTPartHelper.service.getDescribesWTParts(WTDocument doc)

    通过部件获取相关参考文档的API：

QueryResult qr = WTPartHelper.service.getReferencesWTDocumentMasters(WTPart part)

    通过文档获取相关参考方部件的API：

QueryResult qr = StructHelper.service.navigateReferencedBy(WTDocumentMaster master, WTPartReferenceLink.class, true)

    通过部件获取相关子件的API：

QueryResult qr = WTPartHelper.service.getUsesWTPartMasters(WTPart part)
```

##创建EPM文档并设置主内容（不推荐通过代码创建）
不推荐原因：

* Creating CAD / Dynamic document using Windchill Java API is a very tedious task and requires a lot of internal knowledge.
* EPM objects are supposed to be created or updated from their Authoring Tools
* Note that a Workgroup Manager Client Toolkit (C++ APIs for the 3rd party WGM) is available in Windchill 10.0.

```java
private static void createEPMDocument(String productName, String EPMName, String CADName) {
  try {
   // Set owner application
   EPMContextHelper.setApplication(EPMApplicationType.toEPMApplicationType("EPM"));
   // Set Authoring Application (required in EPMAuthoringAppType.rbInfo)
   EPMAuthoringAppType at = EPMAuthoringAppType.toEPMAuthoringAppType("COCRDRAFT");
   // Set EPMDocumentType (required in EPMDocumentType.rbInfo)
   EPMDocumentType dt = EPMDocumentType.toEPMDocumentType("CADCOMPONENT");
   EPMDocument epmDoc = EPMDocument.newEPMDocument(null, name, at, dt, cadName);
   epmDoc.setDescription("Created by TPWCreateEPMDocument.java");
   // epmDoc.setInstance(true); //need family table

   QueryResult qr = new QueryResult();
   QuerySpec qs = new QuerySpec(wt.pdmlink.PDMLinkProduct.class);
   SearchCondition sc = new SearchCondition(wt.pdmlink.PDMLinkProduct.class, wt.pdmlink.PDMLinkProduct.NAME,
     SearchCondition.EQUAL, s, false);
   qs.appendSearchCondition(sc);
   qr = wt.fc.PersistenceHelper.manager.find(qs);
   FolderHelper.assignLocation(epmDoc, "/Default",
     WTContainerRef.newWTContainerRef((PDMLinkProduct) qr.nextElement()));
   PersistenceHelper.manager.save(epmDoc);
  } catch (WTException | WTPropertyVetoException e) {
   e.printStackTrace();
  }
 }
```

##清除和添加文档、EPM文档主内容
==Below is some code to update a WTDocument.==
==in fact this code does more thatn you need as it replaces the primary content, you can get rid of the cleanup part.
It's the same code for an EPMdocument, as it is a primary content holder.==
But this not so easy and not recommanded at all

```java

Transaction trx = new Transaction();
WTDocument aDocument;
File fic;
try {
    trx.start();

    ContentHolder holderDocument = ContentHelper.service.getContents(aDocument);
    ContentItem primaryContent = ContentHelper.getPrimary((FormatContentHolder) holderDocument);
    ApplicationData newAppData = ApplicationData.newApplicationData((ContentHolder) aDocument);
    newAppData.setFileName(fic.getName());

    // Cleanup
    TransactionContainer transactionContainer = BatchContainerFactory.instantiateTransactionContainer();
    BatchContainer contentBatchContainer = BatchContainerFactory.instantiateGeneralBatchContainer(transactionContainer, "contents");
    transactionContainer.clearAll();

    if (PersistenceHelper.isPersistent(aDocument)) {
        aDocument = (WTDocument) ContentHelper.service.getContents(aDocument);

        java.util.Vector vector = ContentHelper.getContentList(aDocument);

        if (vector != null) {
            contentBatchContainer.populate(vector.elements());
        }

        Enumeration enumContents = vector.elements();

        while (enumContents.hasMoreElements())
            contentBatchContainer.remove(enumContents.nextElement());
    }

    aDocument = (WTDocument) ContentHelper.service.contentUpdateUpload(aDocument, transactionContainer);
    ContentServerHelper.service.updatePrimary((FormatContentHolder) aDocument, newAppData, new FileInputStream(fic));
    trx.commit();
    trx = null;
} catch (Exception u) {
    throw new WTException(u.getMessage());
} finally {
    if (trx != null) {
        trx.rollback();
    }
}
```

## 获取工作流里面人工节点的审批信息

```java
//工作流里的表达式调用这个方法，并且把工作流里的self变量传进来。
public static void getReviewMsgAndPboData(WTObject pbo,Object self) throws WTException, PropertyVetoException, IOException {
        if (pbo instanceof WTDocument) {

		//下面这段代码是从文档pbo中获取主内容
			String basePath="D:\\signature\\";
            WTDocument document = (WTDocument) pbo;
            ContentHolder contentHolder = ContentHelper.service.getContents(document);
            ApplicationData applicationData = (ApplicationData)ContentHelper.getPrimary((FormatContentHolder)contentHolder);
            String fileName = applicationData.getFileName();//文档名称
            String filePath = basePath+fileName;
            System.out.println("filtpath+filename:"+filePath);
            ContentServerHelper.service.writeContentStream(applicationData,filePath);

          
            // get workflow process
            WfProcess pro = WorkflowUtil.getProcess(self);
            // get review info
            List<WfVotingEventAudit> veaList = WorkflowUtil.getVotingEvents(pro);

			//一个工作流一般有多个审批节点，每个审批节点里的信息也是用集合接收
            List<List<String>> lists = new ArrayList<List<String>>();
            for (WfVotingEventAudit vea : veaList) {
                List<String> list = new ArrayList<String>();
                WorkItem item = vea.getWorkItem();
				//获取审批意见
                String comment = item.getContext().getTaskComments();
				//审批人
                String name = vea.getUserRef().getFullName();
                String roleType = item.getRole().getFullDisplay();
                System.out.println("userRef:" + name);
                System.out.println("role:" + roleType);

                list.add(name);
                list.add(roleType);
                list.add(comment);
                lists.add(list);
                signature(filePath,list);
            }
		}
}
```

##启动工作流

```java
public static WfProcess startWorkFlow(String workFlowName, WTObject pbo, HashMap<String, Object> variables){
        long WORKFLOW_PRIORITY = 1L;
        boolean enforce = SessionServerHelper.manager.setAccessEnforced(false);
        try{
            WTContainerRef containerRef = WTContainerHelper.service.getExchangeRef();
            if ((pbo instanceof WTContained)) {
                WTContained contained = (WTContained)pbo;
                containerRef = contained.getContainerReference();
            }
            WTProperties wtproperties = WTProperties.getLocalProperties();
            WORKFLOW_PRIORITY = Long.parseLong(wtproperties.getProperty("wt.lifecycle.defaultWfProcessPriority", "1"));
            WfProcessDefinition wfprocessdefinition = WfDefinerHelper.service.getProcessDefinition(workFlowName, containerRef);
            if(wfprocessdefinition == null){
                LOGGER.error("Error to getWrokFlowTemplate," + workFlowName + " is null");
                return null;
            }
            String type = wt.type.TypedUtilityServiceHelper.service.getExternalTypeIdentifier(pbo);
            System.out.println("====>type:" + type);
          
            WfProcess wfprocess = WfEngineHelper.service.createProcess(wfprocessdefinition, pbo, containerRef);
            ProcessData processData = wfprocess.getContext();
            processData.setValue("primaryBusinessObject", pbo);
          
            if ((variables != null) && (!variables.isEmpty())) {
                Set<String> keys = variables.keySet();
                for (String key : keys) {
                    processData.setValue(key, variables.get(key));
                }
            }
            wfprocess = WfEngineHelper.service.startProcessImmediate(wfprocess, processData, WORKFLOW_PRIORITY);
            return wfprocess;
        } catch (WTException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        finally {
            SessionServerHelper.manager.setAccessEnforced(enforce);
        }
        return null;
    }
```

## 上传文件到ftp

网上下载commons-net的jar包。

```java
public static void upload(){
    	//创建客户端对象
    	        FTPClient ftp = new FTPClient();
    	        InputStream local=null;
    	        try {
    	            //连接ftp服务器
    	            ftp.connect("192.168.99.105", 21);
    	            //登录
    	            ftp.login("ftpuser", "ftpuser");
    	            //设置上传路径
    	            String path="/worker";
    	            //检查上传路径是否存在 如果不存在返回false
    	            boolean flag = ftp.changeWorkingDirectory(path);
    	            if(!flag){
    	                //创建上传的路径  该方法只能创建一级目录，在这里如果/home/ftpuser存在则可创建image
    	                ftp.makeDirectory(path);
    	            }
    	            //指定上传路径
    	            ftp.changeWorkingDirectory(path);
    	            //指定上传文件的类型  二进制文件
    	            ftp.setFileType(FTP.BINARY_FILE_TYPE);
    	            //读取本地文件
    	            File file = new File("D:\\1.xls");
    	            local = new FileInputStream(file);
    	            //第一个参数是文件名
    	            ftp.storeFile(file.getName(), local);
    	        } catch (SocketException e) {
    	            e.printStackTrace();
    	        } catch (IOException e) {
    	            e.printStackTrace();
    	        }finally {
    	            try {
    	                //关闭文件流
    	                local.close();
    	                //退出
    	                ftp.logout();
    	                //断开连接
    	                ftp.disconnect();
    	            } catch (IOException e) {
    	                e.printStackTrace();
    	            }
    	        }
    	    }
```

##新建Baseline并在其中加入Baseline Object

```java
{

        // 创建基线
        ManagedBaseline mb = ManagedBaseline.newManagedBaseline();
        mb.setName("baseLine0002");
        WTContainer wtc = null;
        QuerySpec qs = new QuerySpec(PDMLinkProduct.class);
        SearchCondition sc = new SearchCondition(PDMLinkProduct.class,
                PDMLinkProduct.NAME, SearchCondition.EQUAL, "practice");
        qs.appendWhere(sc);
        QueryResult qr = PersistenceHelper.manager.find(qs);
        while (qr.hasMoreElements()) {
            wtc = (WTContainer) qr.nextElement();
        }
        //设置容器
        mb.setContainer(wtc);
        WTContainerRef containerRef = WTContainerRef.newWTContainerRef(wtc);
        Folder parentFolder = FolderHelper.service.getFolder("/Default/codeCreated", containerRef);
        //设置文件夹
        mb.setFolderingInfo(FolderingInfo.newFolderingInfo(parentFolder));

        //设置域
        AdminDomainRef df = null;
        df = wtc.getDefaultDomainReference();
        mb.setDomainRef(df);
        mb = (ManagedBaseline) PersistenceHelper.manager.save(mb);

        //将part加入基线
        WTSet collection =new WTHashSet();
        WTPart part = getLatestPartByNumber("0000000141");
        collection.add(part);
        BaselineHelper.service.addToBaseline(collection, mb);
}
```

## 创建升级请求

```java
Transaction trx = new Transaction();

wt.part.WTPart part = ...
wt.inf.container.WTContainer container = ...
wt.inf.container.WTContainerRef containerRef = wt.inf.container.WTContainerRef.newWTContainerRef(container); 

try {
    trx.start();

	wt.maturity.MaturityBaseline maturityBaseline = wt.maturity.MaturityBaseline.newMaturityBaseline(); 
	maturityBaseline.setContainerReference(containerRef); 
	maturityBaseline = (wt.maturity.MaturityBaseline)wt.fc.PersistenceHelper.manager.save(maturityBaseline); 
	wt.maturity.PromotionNotice pn = wt.maturity.PromotionNotice.newPromotionNotice("Custom_Promotion_Request"); 
	pn.setPromotionDate(new java.sql.Timestamp(System.currentTimeMillis())); 
	pn.setContainer(container); 
	pn.setContainerReference(containerRef); 
	pn.setMaturityState(wt.lifecycle.State.toState("RELEASED")); 
	pn.setDescription("theDescription"); 
  
	pn.setConfiguration(maturityBaseline); 
  
	wt.fc.collections.WTSet set = new wt.fc.collections.WTHashSet(); 
	set.add(part); 
	wt.vc.baseline.BaselineHelper.service.addToBaseline(set, pn.getConfiguration()); 
	pn = wt.maturity.MaturityHelper.service.savePromotionNotice(pn); 
	wt.maturity.MaturityHelper.service.savePromotionTargets(pn, set);
  
    trx.commit();
    trx = null;
   
} finally {
    if(trx != null){
        trx.rollback();
    }
}
```

==1.the Creation of the MaturityBaseline and the PromotionNotice must be in the same transaction==
==2.transaction is server-side API.==
##获取用户在某个产品库中有哪些角色

```java
public List getTeamRoles (ContainerTeam team, WTUser user) throws WTException {
Vector<Role> roles = new Vector<Role>();
Enumeration enum1 = ContainerTeamHelper.service.findContainerTeamGroups(team, ContainerTeamHelper.ROLE_GROUPS);
while (enum1.hasMoreElements()){
      WTGroup group = (WTGroup)enum1.nextElement();
      if (group.isMember(user)){
             Role role = Role.toRole(group.getName());
             if (!roles.contains(role)){
                    roles.addElement(role);
             }
      }
}
return roles;
}
```

##获取产品库中的所有角色里的所有用户，将用户加入到角色。

```java
WTContainer wtc=???//获取容器
 ContainerTeam productTeam = ContainerTeamHelper.service.getContainerTeam((ContainerTeamManaged)wtc);
        HashMap map = productTeam.getAllMembers();//返回的map用户名作为key角色作为value。
        Set keys = map.keySet();
        Iterator itr = keys.iterator();
        WTPrincipalReference UserName;
        Object Role1;
        Role ppeRole = null;
        while (itr.hasNext()) {
            UserName = (WTPrincipalReference) itr.next();
            Role1 = map.get(UserName);
            // (custom role where the users are retrieved)
            //getDisplayName()获取的是显示名称，getName()获取的是登录时用的内部名称,getFullName()和getDisplayName()的结果一样。
            System.out.println(UserName.getDisplayName() + "-----------------" + Role1);
            if (Role1.toString().contains("PD_MANAGER"))
            {
                System.out.println(UserName.getName() + "-----------------" + Role1);
                //将PD_MANAGER角色里的用户加入到本产品库的PE角色里
                ContainerTeamHelper.service.addMember(productTeam, ppeRole.toRole("PE"), UserName.getPrincipal());
            }


        }
```

## 获取组内用户

```java
public static List<WTUser> searchGroupMember(WTGroup group){
        List<WTUser> users = new ArrayList<WTUser>();
        try {
            Enumeration member = group.members();
            while(member.hasMoreElements()){
                WTPrincipal principal = (WTPrincipal) member.nextElement();
                if(principal instanceof WTUser){
                    users.add((WTUser)principal);
                }else if(principal instanceof WTGroup){
                    List<WTUser> userss = searchGroupMember((WTGroup)principal);
                    users.addAll(userss);
                }
            }
        } catch (WTException e) {
            e.printStackTrace();
        }
        return users;
    }
```

## 获取容器中指定角色下的用户(调用了获取组内用户的方法)

```java
        public static List<WTUser> searchRoleMemberByContainer(WTContainer container, String roleName){
                List<WTUser> users = new ArrayList<WTUser>();
                boolean enforce = SessionServerHelper.manager.setAccessEnforced(false);
                Role role = Role.toRole(roleName);
                try {
                        if(container instanceof ContainerTeamManaged){
                                ContainerTeamManaged containerTeamManaged = (ContainerTeamManaged)container;
                                ContainerTeam containerTeam = ContainerTeamHelper.service.getContainerTeam(containerTeamManaged);      
                                List<WTPrincipalReference> principals = containerTeam.getAllPrincipalsForTarget(role);
                                if (principals != null && principals.size() > 0){
                                        for(int i = 0;i < principals.size(); i++){
                                                logger.debug("principal ="+principals.get(i));
                                                WTPrincipalReference principalRef = principals.get(i);
                                                WTPrincipal principal = principalRef.getPrincipal();
                                                if(principal instanceof WTUser){
                                                        users.add((WTUser)principal);
                                                }else if(principal instanceof WTGroup){
                                                        List<WTUser> userss = searchGroupMember((WTGroup)principal);
                                                        users.addAll(userss);
                                                }
                                        }
                                }
                        }
                } catch (WTException e) {
                        e.printStackTrace();
                }
                return users;
        }
```

## 判断用户是否是某个产品库团队中的成员

```java
ObjectIdentifier oid = ObjectIdentifier.newObjectIdentifier("wt.pdmlink.PDMLinkProduct:xxxx");
PDMLinkProduct prod = (PDMLinkProduct) PersistenceHelper.manager.refresh(oid);
ContainerTeam team = ContainerTeamHelper.service.getContainerTeam(prod);
          
HashMap test= team.getAllMembers();
WTUser user = (WTUser)SessionHelper.manager.getPrincipal();
if(test.containsKey(user)){
   //the user is in the Container team
}else{
   //the user is not in the Container team
}
```

##方法自动机中获取上一个人工节点的参与者

```java
wt.team.Team team = (wt.team.Team) ((wt.workflow.engine.WfProcess) self.getObject()).getTeamId().getObject();
java.util.Enumeration principals = team.getPrincipalTarget(wt.project.Role.toRole("REVIEWER"));
while (principals.hasMoreElements())
{
    wt.org.WTPrincipal wtprincipal = ((wt.org.WTPrincipalReference) principals.nextElement()).getPrincipal();
    System.out.println("principal = " + wtprincipal.getPrincipalDisplayIdentifier());
}
```

==To get the team from within the Complete transition of the Set Up Participants task:==

```java
wt.team.Team team = (wt.team.Team) ((wt.workflow.engine.WfActivity)self.getObject()).getParentProcess().getTeamId().getObject();
```

##获取升级请求里的升级对象
1.QueryResult queryResult =  MaturityHelper.service.getPromotionTargets(promotionNotice);

2.MaturityBaseline baseLine = promotionNotice.getConfiguration();

完整方法：

```java
public static List<Object> getPromotionObjects (PromotionNotice pn) throws MaturityException, WTException {
		List<Object> objs = new ArrayList<Object>();
		QueryResult qr = MaturityHelper.service.getPromotionTargets(pn);
		while (qr.hasMoreElements()) {
			Object obj = qr.nextElement();
			logger.debug("obj is "+obj);
			objs.add(obj);
		}
		return objs;
	}
```

##设置升级请求目标对象的状态

```java
public static void setPromotionTargetState(Object pbo, Object self,String state) throws WTException, WTPropertyVetoException {
        if(pbo instanceof PromotionNotice){
            /*Get PromotionNotice*/
            PromotionNotice pn = (PromotionNotice)pbo;
            /*Query for PromotionTarget links (Promotion Notice, false)*/
            QueryResult targets = MaturityHelper.service.getPromotionTargets(pn);
            while(targets.hasMoreElements()){
                Object obj =targets.nextElement();
                if(obj instanceof LifeCycleManaged){
                    LifeCycleManaged cad = (LifeCycleManaged)obj;
                    LifeCycleHelper.service.setLifeCycleState( cad, State.toState(state));
                }
            }
            try {
                // Refresh Promotion Notice with latest iterations of promotion objects
                com.ptc.windchill.enterprise.maturity.PromotionNoticeWorkflowHelper.refresh(pn);
                wt.maturity.MaturityServerHelper.service.lockTargets(pn);
            } catch (Exception wte){
                wte.printStackTrace();
            }
        }
        }

```

## 获取升级请求目标对象的初始状态

For example, if an object is submitted for promotion from the "INWORK" state to the "RELEASED" state, I want to retrieve the "INWORK" state value.

Here is the code I am using to get the promotion targets and some of the code for processing them:

```java
wt.maturity.PromotionNotice pn = (wt.maturity.PromotionNotice)primaryBusinessObject;

wt.maturity.StandardMaturityService p = new wt.maturity.StandardMaturityService();

wt.fc.QueryResult pn_targets = (wt.fc.QueryResult) p.getPromotionTargets(pn);

while (pn_targets.hasMoreElements()) {

   Object myObject = pn_targets.nextElement();
   typeName = 		wt.type.TypedUtilityServiceHelper.service.getExternalTypeIdentifier((wt.type.Typed)myObject);   // store object type

}
```

解决方案

```java
/*Get PromotionNotice*/
wt.maturity.PromotionNotice pn = (wt.maturity.PromotionNotice)primaryBusinessObject;  
/*Query for PromotionTarget links (Promotion Notice, false)*/
wt.fc.QueryResult promotionObjectLinks = wt.maturity.MaturityHelper.service.getPromotionTargets(pn, false);
while(promotionObjectLinks.hasMoreElements()){
  try{
   wt.maturity.PromotionTarget pt = (wt.maturity.PromotionTarget)promotionObjectLinks.nextElement();
   /*Get Promoted from State from PromotionTarget*/
   wt.lifecycle.State promotedFromState = pt.getCreateState();   
   
   /*Get Promotion Targets persistable and check for latest iteration of EPMDocument*/   
   wt.epm.EPMDocument epmDoc = (wt.epm.EPMDocument)pt.getRoleBObject();
   if (!epmDoc.isLatestIteration())
   {
    wt.epm.EPMDocument latestEPMDoc = (wt.epm.EPMDocument)wt.vc.VersionControlHelper.service.getLatestIteration(epmDoc, false);
    //Set latest EPMDocument to promotedFromState  
    wt.lifecycle.LifeCycleHelper.service.setLifeCycleState((wt.lifecycle.LifeCycleManaged)latestEPMDoc, promotedFromState);
   }  
   } catch(Exception wte) {
    wte.printStackTrace();    
    }  
  }

try {
 // Refresh Promotion Notice with latest iterations of promotion objects
 com.ptc.windchill.enterprise.maturity.PromotionNoticeWorkflowHelper.refresh(pn);  
 wt.maturity.MaturityServerHelper.service.lockTargets(pn);
} catch (Exception wte){
 wte.printStackTrace();
}
```

##获取升级请求的目标状态

```java
Following method from wt.maturity.PromotionNotice can be used,
public State getMaturityState()
```

## 获取子类型内部名称

```java
public static String getTypeInternalName (WTObject obj) throws WTException {
     if (obj == null) return "";
     String internalName = "";
     String typeIdentifier = TypedUtilityServiceHelper.service.getTypeIdentifier(obj).getTypename();
     logger.debug("typeIdentifier = "+typeIdentifier);
     if (typeIdentifier != null && !"".equals(typeIdentifier)) {
      if (typeIdentifier.indexOf("|") > 0) {
       logger.debug("typeIdentifier include | ");
       internalName = typeIdentifier.substring(typeIdentifier.lastIndexOf("|")+1);
       logger.debug("internalName = "+internalName);
      } else {
       logger.debug("typeIdentifier has no |");
       internalName = typeIdentifier;
      }
     }
     return internalName;
    }
```

##Is there any API to fetch the internal names of all the soft attributes available on a type say "wt.part.WTPart"?类型的属性的内部名称

I have used the following code to get the IBA internal names.

```java
ArrayList<String> result = new ArrayList<String>();
TypeIdentifier identifier = TypedUtility.getTypeIdentifier(typeDef);
TypeDefinitionReadView typeDefView = TypeDefinitionServiceHelper.service.getTypeDefView(identifier);
for (AttributeDefinitionReadView attDef : typeDefView.getAllAttributes()) {
AttributeDefDefaultView ibaRefView = attDef.getIBARefView();
if(ibaRefView != null) {
result.add(ibaRefView.getLogicalIdentifier());

}
```

##在processor中成功执行后弹出提示框

```java
{
  FormResult result=super.doOperation(nmCommandBean, list);
  FeedbackMessage returnMsg = new FeedbackMessage(FeedbackType.SUCCESS,
                SessionHelper.getLocale(),null,null,"Start WorkFlow Success!");
  result.addFeedbackMessage(returnMsg);//添加反馈信息
        result.setStatus(FormProcessingStatus.SUCCESS);
        ImportBomAssistant.clearBomLoadBeanList();
        return result;
}
```

另一种情况：return super.doOperation(cmdBean, objectBeans);可写成下面这样：

```java
FeedbackMessage returnMsg = new FeedbackMessage(FeedbackType.SUCCESS,
                SessionHelper.getLocale(),null,null,"Start WorkFlow Success!");
        FormResult result = super.doOperation(cmdBean, objectBeans);
        result.addFeedbackMessage(returnMsg);
        result.setStatus(FormProcessingStatus.SUCCESS);
        return result;
```

## 判断某个对象是否已经处在工作流中

```java
/**
* 检测同一个对象,是否正在运行某个工作流
 */
    public static boolean isRunningWorkflow(Persistable pbo , String workFlowName) throws WTException {
      boolean processok = false;
      NmOid nmOid = NmOid.newNmOid(PersistenceHelper.getObjectIdentifier(pbo));
      QueryResult qr = NmWorkflowHelper.service.getRoutingHistoryData(nmOid);
      while (qr.hasMoreElements()) {
                WfProcess process = (WfProcess)qr.nextElement();

                String templateName = process.getTemplate().getName();
                if ((process.getState().equals(WfState.OPEN_RUNNING)) && (templateName.contains(workFlowName))) {
                        processok = true;
                        break;
                }
      }
      LOGGER.debug("is running workflow = "+processok);
      return processok;
    }
```

另一种方式：

```java
public static WfProcess getRunningProcessByPBO (Persistable p, String templateName) throws WTException {
                WfProcess process = null;
                QueryResult qr = (QueryResult) WfEngineHelper.service.getAssociatedProcesses(p, WfState.OPEN_RUNNING,null);
                while (qr.hasMoreElements()) {
                        process = (WfProcess) qr.nextElement();
                        LOGGER.debug("process template name = "+process.getTemplate().getName());
                }
                return process;
        }
```

##获取工作流中指定的所有角色和用户

```java
public static Map<Role, List<WTPrincipalReference>> getRoleAndUser(WfProcess process) throws WTException {
        if (process == null) {
            return null;
        }
        List<Role> roleUsreArray = new ArrayList<Role>();
        Team team = (Team) process.getTeamId().getObject();
        Map<Role, List<WTPrincipalReference>> roleUserMap = team.getRolePrincipalMap();
        LOGGER.debug("roleUser map is "+roleUserMap);
        LOGGER.debug("process is "+process.getName());
        Set<Role> keySet = roleUserMap.keySet();
        Iterator<Role> it = keySet.iterator();
        while (it.hasNext()) {
            Role key = it.next();
            roleUsreArray.add(key);
            List<WTPrincipalReference> wtprincipalReference = roleUserMap.get(key);

            LOGGER.debug("Role is a value == " + key);
            LOGGER.debug("role is " + key.getDisplay(Locale.CHINA));
        }
        return roleUserMap;
    }
```

##获取团队模板中的角色

```java
WTContainerRef containerRef = WTContainerHelper.service .getByPath("/");//属于站点下的团队模板
    TeamTemplate ecrTeam = TeamHelper.service.getTeamTemplate(containerRef, "Change Request Team");
    TeamTemplate ecnTeam = TeamHelper.service.getTeamTemplate(containerRef, "Change Notice Team");
    TeamTemplate ecaTeam = TeamHelper.service.getTeamTemplate(containerRef, "Change Activity Team");

    Map ecrMap = TeamHelper.service.populateRolePrincipalHash(ecrTeam);
    Map ecnMap = TeamHelper.service.populateRolePrincipalHash(ecnTeam);
    Map ecaMap = TeamHelper.service.populateRolePrincipalHash(ecaTeam);
    Map teamCollection = new HashMap();

    teamCollection.putAll(ecrMap);
    teamCollection.putAll(ecnMap);
    teamCollection.putAll(ecaMap);
    Set<Map.Entry<Role, List<WTPrincipalReference>>> roles = teamCollection.entrySet();
    List<String> roleList=new ArrayList<>();
    for (Map.Entry<Role, List<WTPrincipalReference>> entry : roles) {
        Role role = entry.getKey();
        System.out.println("oooooooooooooooo : "+role.toString());
        roleList.add(role.toString());

    }
```

##创建指定版本的WTPart或者WTDocument

```java
{
	String name = "TSTest";//name
String number = "TSTest";//number
String lifeCycleName = "Basic";//lifecycle name
String container_path = "/wt.inf.container.OrgContainer=demo organization/wt.pdmlink.PDMLinkProduct=Product-Test";//the container where the document will be created/located
String folder_path = "/Default";//folder path
WTDocument doc = WTDocument. newWTDocument();
doc.setName(name);
doc.setNumber(number);

WTContainerRef containerRef = WTContainerHelper.service .getByPath(container_path);
doc.setContainerReference(containerRef);

Folder folder = FolderHelper.service .getFolder(folder_path,containerRef);
FolderHelper. assignLocation(doc, folder);

LifeCycleTemplate lct = LifeCycleHelper.service .getLifeCycleTemplate(lifeCycleName , doc.getContainerReference());
doc = (WTDocument) LifeCycleHelper. setLifeCycle(doc, lct);
          
// set revision as "B"
VersionIdentifier vc = VersionIdentifier.newVersionIdentifier(MultilevelSeries.newMultilevelSeries("wt.series.HarvardSeries", "B"));
doc.getMaster().setSeries("wt.series.HarvardSeries");
VersionControlHelper.setVersionIdentifier(doc, vc);
//set iteration as "3"
Series ser = Series.newSeries("wt.vc.IterationIdentifier", "3");
IterationIdentifier iid = IterationIdentifier.newIterationIdentifier(ser);
VersionControlHelper.setIterationIdentifier(doc, iid);
doc = (WTDocument) wt.fc.PersistenceHelper.manager .store(doc);
}
```

获取生命周期：

```java
LifeCycleTemplate lct = LifeCycleHelper.service .getLifeCycleTemplate(lifeCycleName , doc.getContainerReference());
doc = (WTDocument) LifeCycleHelper. setLifeCycle(doc, lct);
```

##根据名字获取工作流模板

```java
WfProcessDefinition wfprocessdefinition = WfDefinerHelper.service.getProcessDefinition(workFlowName, containerRef);
if(wfprocessdefinition == null){
   LOGGER.error("Error to getWrokFlowTemplate," + workFlowName + " is null");
   return null;
    }
```

## 手动设置工作流审批节点已完成

```java
WorkflowHelper.service.workComplete(workItem, workItem.getOwnership().getOwner(), events);
//或者
WorkflowHelper.service.completeActivity((ObjectReference) self,"doNothing");
//或者
orkflowHelper.service.workComplete(workItem, workItem.getOwnership().getOwner(), events);
//不管使用哪种，最后都要把用下面的api去设置状态已完成。
wfAssignedActivity.setState(WfState.CLOSED_COMPLETED_EXECUTED);
```

```
Vector<String> v = new Vector<>();
//v.addElement("doNothing"); // route with same name is required to be defined in the task
System.out.println(wfAssignedActivity.getRouterType().getStringValue());
//wt.workflow.engine.WfEngineHelper.service.complete(wfAssignedActivity, v);
WorkflowHelper.service.workComplete(workItem, workItem.getOwnership().getOwner(), null);
wfAssignedActivity.setState(WfState.CLOSED_COMPLETED_EXECUTED);
wfAssignedActivity.doCompleteTransition();
PersistenceHelper.manager.save(wfAssignedActivity);
PersistenceHelper.manager.refresh(wfAssignedActivity);
```

一个完整的例子

```java
 public static void completeAssignedActivity(wt.fc.ObjectReference self
            , String activityPartialName) {
      
        wt.workflow.engine.WfProcess wfProcess = (wt.workflow.engine.WfProcess) self.getObject();
        wt.fc.QueryResult queryResult = new wt.fc.QueryResult();
        try {
            queryResult = wfProcess.getContainerNodes();
        } catch (wt.util.WTException ex) {
            System.out.println(ex);
        }
        while (queryResult.hasMoreElements()) {
            java.lang.Object obj = queryResult.nextElement();
            if (obj instanceof wt.workflow.work.WfAssignedActivity) {
                wt.workflow.work.WfAssignedActivity wfAssignedActivity
                    = (wt.workflow.work.WfAssignedActivity) obj;
                try {
                    if (!wfAssignedActivity.isComplete()) {
                        java.lang.String currentActivityName = wfAssignedActivity.getName();
                        if (currentActivityName.contains(activityPartialName)) {
                            @SuppressWarnings("UseOfObsoleteCollectionType")
                            java.util.Vector<String> v = new java.util.Vector<>();
                            v.addElement("<vote_name>"); // route with same name is required to be defined in the task
                            wt.workflow.engine.WfEngineHelper.service.complete(wfAssignedActivity, v);
                            wfAssignedActivity.setState(WfState.CLOSED_COMPLETED_EXECUTED);
                            System.out.println("Completed activity name: " + currentActivityName);
                        }
                    }
                } catch (wt.util.WTException ex) {
                    System.out.println(ex);
                }
              
            }
          
        }
      
    }
```

## 产生流程超链接

```java
{
    wt.workflow.engine.WfProcess process ;
    java.util.Properties properties = new java.util.Properties();
    properties.put("oid", process );
    properties.put("action", "ProcessManager");
    java.util.HashMap hashmap = new  java.util.HashMap(properties);
    wt.httpgw.URLFactory urlfactory = new wt.httpgw.URLFactory();
    String URL= String.valueOf(      wt.httpgw.GatewayServletHelper.buildAuthenticatedHREF(urlfactory,   "wt.enterprise.URLProcessor", "URLTemplateAction"null, hashmap) );
 }
```

## 工作流中重新分配任务

```java
ObjectIdentifier oid = ObjectIdentifier.newObjectIdentifier("wt.workflow.work.WorkItem:319469");
WorkItem wi = (WorkItem) PersistenceHelper.manager.refresh(oid);
System.out.println("WorkItem Name: " + wi.getIdentity());
	
System.out.println(" Workitem Owner (Before delegate): " + wi.getOwnership().getOwner().getIdentity());
	
WTUser user = wt.org.OrganizationServicesHelper.manager.getAuthenticatedUser("shirish");
WTPrincipal principal = (WTPrincipal) user;
wt.workflow.work.WorkflowHelper.service.delegate(wi, principal); 

System.out.println(" Workitem Owner (After delegate): " + wi.getOwnership().getOwner().getIdentity());
```

## 通过api发送邮件

```java
wt.fc.ObjectIdentifier oid = wt.fc.ObjectIdentifier.newObjectIdentifier("wt.part.WTPart:xxxxx");
wt.part.WTPart wtpart = (wt.part.WTPart)PersistenceHelper.manager.refresh(oid);
EMailMessage localEMailMessage=EMailMessage.newEMailMessage();
localEMailMessage.setOriginator(wtpart.getModifier());
localEMailMessage.addRecipient(wtpart.getModifier()); localEMailMessage.setSubject("ext.customization.CustomResource","EMAIL_SUBJECT",new String[]{wtpart.getName()}); localEMailMessage.addPart("ext.customization.CustomResource","EMAIL_SUBJECT",new String[]{retMsg},"text/plain");
localEMailMessage.send(true);
```

## 代码启动工作流

```java
wt.fc.ReferenceFactory rf = new wt.fc.ReferenceFactory();
// getObjectID from URL/HTTP Request 
wt.fc.WTReference ref = rf.getReference(request.getParameter("oid"));
wt.part.WTPart part = (wt.part.WTPart) ref.getObject();
out.println(wt.workflow.definer.WfDefinerHelper.service.getProcessDefinition("My WorkflowProcess",part.getContainerReference(),true));
wt.workflow.engine.WfProcess aWfProcess = wt.workflow.engine.WfEngineHelper.service.createProcess(wt.workflow.definer.WfDefinerHelper.service.getProcessDefinition("Order More Parts",part.getContainerReference(),true),  null);
aWfProcess.setName("My Process");
aWfProcess.setTeamTemplateId(part.getTeamTemplateId());
wt.workflow.engine.ProcessData aProcessData = aWfProcess.getContext();
aProcessData.setValue("primaryBusinessObject", part);
out.println("-------" + aProcessData.getNames().length);
aWfProcess = (wt.workflow.engine.WfProcess) wt.fc.PersistenceHelper.manager.save(aWfProcess);
aWfProcess = wt.workflow.engine.WfEngineHelper.service.startProcess(aWfProcess,aProcessData, 3);
```

## 检出对象

```java
WTPart workingcopyPart = null;

  if(!WorkInProgressHelper.isWorkingCopy(partObj))

  {System.out.println("Not a working copy"+docmaster.getName());

  workingcopyPart =(WTPart) WorkInProgressHelper.service.checkout((WTPart)partObj,WorkInProgressHelper.service.getCheckoutFolder(),null).getWorkingCopy();

  }
```

## 给part设置描述文档

```java
WTPart workingcopyPart = null;

  if(!WorkInProgressHelper.isWorkingCopy(partObj))

  {System.out.println("Not a working copy"+docmaster.getName());

  workingcopyPart =(WTPart) WorkInProgressHelper.service.checkout((WTPart)partObj,WorkInProgressHelper.service.getCheckoutFolder(),null).getWorkingCopy();

  }
```

##设置文档关系
==ReferencedBy==

```java
WTDocument workable = (WTDocument)WorkInProgressHelper.service.workingCopyOf(doc);
wt.doc.WTDocumentDependencyLink  dependlnk= wt.doc.WTDocumentDependencyLink.newWTDocumentDependencyLink(workable,referenceddoc);
PersistenceServerHelper.manager.save(dependlnk);
```

==UsedBy==

```java
WTDocumentUsageLink usage_link = WTDocumentUsageLink.newWTDocumentUsageLink(parent_document,(WTDocumentMaster)child_document.getMaster());
usage_link.setStructureOrder(0);
PersistenceServerHelper.manager.save(usage_link);
```

##移动对象所在文件夹

```java
public static void myCustomMover(String docNumber)

{

    try {
        WTDocument doc=getWTDoc(docNumber);
        WTContainer cont=doc.getContainer();//you give different container also
        WTContainerRef containerRef = WTContainerRef.newWTContainerRef(cont);
        String location="MyFolder/Documents/";
        Folder folder = FolderHelper.service.getFolder("/Default/"+location, containerRef);
        WTValuedHashMap map = new WTValuedHashMap();
        map.put(doc,folder);
        ContainerMoveHelper.service.moveAllVersions(map);
    }catch (WTException e) {
        e.printStackTrace();
    }

}
```

##给现有对象重新设置编号（number）,以变更请求ECR为例

```java
public static WTChangeRequest2 resetNumberForRequest (WTChangeRequest2 cr) throws WTException {
        SessionServerHelper.manager.setAccessEnforced(false);
        SessionHelper.manager.setAdministrator();
        String requestNumber = GenerateNumber.GenerateCRNumber(cr);
        WTChangeRequest2Master requestMaster = (WTChangeRequest2Master)cr.getMaster();
        requestMaster = (WTChangeRequest2Master) PersistenceHelper.manager.refresh(requestMaster);
        WTChangeRequest2MasterIdentity requestMasterIdentity = (WTChangeRequest2MasterIdentity)requestMaster.getIdentificationObject();
        try {
            requestMasterIdentity.setNumber(requestNumber);
        } catch (WTPropertyVetoException e) {
            throw new WTException("set number for ECR master error ");
        }
        requestMaster = (WTChangeRequest2Master) IdentityHelper.service.changeIdentity(requestMaster, requestMasterIdentity);
        cr = (WTChangeRequest2) PersistenceHelper.manager.refresh(cr);
        SessionServerHelper.manager.setAccessEnforced(true);
        return cr;
    }
```

## 在版本变化事件监听中如何判断对象是被检出（check out）还是被修订（revise）

- There are no separate events generated for the **new Iteration** or **new Revision** action. Both actions generate the event: **VersionControlServiceEvent.NEW_VERSION**
- To differentiate between the two do the following:

1. Capture the event: **VersionControlServiceEvent.NEW_VERSION**
2. Check if the object associated with the event has been checked out using the API: **wt.vc.wip.WorkInProgressHelper.isCheckedOut(Workable Object)**
3. If **true** then the object has gone through an iteration because it requires a checkout-checkin operation.
4. If **false** then the object has gone through a revision which doesn't require a checkout-checkin operation.

- Example

```
// Get the event (NEW_VERSION)
VersionControlServiceEvent pmEvent = (VersionControlServiceEvent) event;
Workable target = (Workable) pmEvent.getEventTarget();

if (wt.vc.wip.WorkInProgressHelper.isCheckedOut(target)) {
// do something because the event was triggered by a checkout
} else {
// if here it must be a revise action...

}
```

##获取变更请求（ECR）里的受影响对象

```java
QueryResult qr = ChangeHelper2.service.getChangeables(ecr, true);
```

##获取变更通知（ECN）里的改前数据

```java
QueryResult qr = ChangeHelper2.service.getChangeablesBefore(ecn, false);
```

##获取对象所处在的升级请求（ECR）

```java
QueryResult qrcr = wt.change2.ChangeHelper2.service.getRelevantChangeRequests( changeable, true /*onlyChangeRequests*/ );g
```

##获取文档中克制的软属性（IBA）的值

```java
public static String getIBAValueByIBAName(WTDocument document, String ibaName) throws WTException{
  Locale loc = SessionHelper.getLocale();
  PersistableAdapter obj = new PersistableAdapter(document,null,loc,null);
  obj.load(ibaName);
  String ibaValue = (String) obj.getAsString(ibaName);
        return ibaValue;
 }
```

## 获取当前登录用户Local

```java
java.util.Locale locale=wt.util.WTContext.getContext().getLocale();
```

##获取升级请求创建过程中选择的工作流进程

```java
public class ElePromotionRequestProcesser  extends CreatePromotionRequestFormProcessor {
    private static Logger logger = LogR.getLogger(ElePromotionRequestProcesser.class.getName());

    @Override
    public FormResult postProcess(NmCommandBean cmdBean, List<ObjectBean> objects) throws WTException {

        logger.debug(">>>>>>>>>>>>>>come in pn doOperation");
        FormResult result = super.postProcess(cmdBean, objects);
      
        String selectedProcess = cmdBean.getTextParameter("templateSelected");
        ReferenceFactory rf = new ReferenceFactory();
        WfProcessTemplate template = (WfProcessTemplate)rf.getReference(selectedProcess).getObject();
        String selectedProcessName = template.getName();
        logger.debug("升级请求选择的工作流为："+selectedProcessName);
        if(null!=selectedProcessName&&selectedProcessName.contains("BOM_Release")){
            for (Object obj : pnObjs) {
                if (!(obj instanceof WTPart)) {
                    throw new WTException("BOM_Release流程中只能发布Part，请重新选择数据!");
                }
            }
        }
        return result;
    }
```

## 在数据对象上给用户添加删除权限

```java
   /**
     * 赋予下载和读取权限
     * @param obj
     * @throws WTException
     */
    @SuppressWarnings("deprecation")
    public static void addPermission(Persistable obj,WTPrincipalReference wtprincipalreference) throws WTException {
            boolean flag = SessionServerHelper.manager.setAccessEnforced(false);
            Transaction transaction = new Transaction();
            transaction.start();
                    try {
                            Persistable persistable = PersistenceHelper.manager
                                            .refresh(obj);
                            AdHocControlled ahc = (AdHocControlled) persistable;
                            SessionHelper.manager.getAdministrator();
                            AccessControlHelper.manager.addPermission(ahc,
                                            wtprincipalreference, AccessPermission.READ,
                                            AdHocAccessKey.WNC_ACCESS_CONTROL);
                            AccessControlHelper.manager.addPermission(ahc,
                                            wtprincipalreference, AccessPermission.MODIFY,
                                            AdHocAccessKey.WNC_ACCESS_CONTROL);
                            AccessControlHelper.manager.addPermission(ahc,
                                    wtprincipalreference, AccessPermission.ALL,
                                    AdHocAccessKey.WNC_ACCESS_CONTROL);
                            PersistenceServerHelper.manager.update(ahc,false);
                            persistable = PersistenceHelper.manager.refresh(obj);
                            transaction.commit();
                            transaction = null;
                    } catch (WTException e) {
                            e.printStackTrace();
                    } finally {
                            if (transaction != null)
                                    transaction.rollback();
                            SessionServerHelper.manager.setAccessEnforced(flag);
                    }
    }
```

## 获取对象详情页里的成员信息，并修改提交者及相应权限

```java
 //删除原有所有角色下所有用户的权限，赋予新用户所有权限
public void getPrincipalAndChange(Persistable obj,Team team, WTUser wtPrincipal2) throws WTException {
  Map<Role, List<WTPrincipalReference>> roleUserMap = team.getRolePrincipalMap();
  Set<Role> keySet = roleUserMap.keySet();
  Iterator<Role> it = keySet.iterator();
  while (it.hasNext()) {
   Role key = it.next();
   if ("提交者".equals(key.getDisplay(Locale.CHINA))) {
    List<WTPrincipalReference> wtprincipalReference = roleUserMap.get(key);
    for (WTPrincipalReference principal : wtprincipalReference) {
     WTPrincipal wtPrincipal = principal.getPrincipal();
     WTUser user = (WTUser) wtPrincipal;
     WTPrincipalReference tempPrinRef = WTPrincipalReference.newWTPrincipalReference(wtPrincipal);
     WTPrincipalReference tempPrinRef2 = WTPrincipalReference.newWTPrincipalReference(wtPrincipal2);
     System.out.println("--------------297---生效---"+tempPrinRef+"---"+tempPrinRef2);
     deletePermission(obj, principal);
     addPermission(obj, tempPrinRef2);
     // 角色下的用户
     team.deletePrincipalTarget(key, wtPrincipal);
     team.addPrincipal(key, wtPrincipal2);
     PersistenceHelper.manager.refresh(team);
//     TeamHelper.service.deleteRolePrincipalMap(key, wtPrincipal,team);
//     TeamHelper.service.addRolePrincipalMap(key, wtPrincipal2,team);
    }
   }
  }
 }
```
