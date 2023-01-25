---
title: Creo与windchill集成中，Creo端检入模型实现自动关联
date: '2022-12-08'
tags: ['windchill', 'java']
draft: false
summary: JCreo与windchill集成中，Creo端检入模型实现自动关联
---
# Creo与windchill集成中，Creo端检入模型实现自动关联

# 前提

Creo能与windchill连接

#实现步骤：

## 登录windchill在首选项下进行如下设置：

### 首选项设置

站点—》程序--》首选项管理--》操作--》自动关联：Custom Class for Auto Associate Part项设置成自己编写的类

Create Associate New Part项根据需求设置，默认是假如模型为创建者检入并且找不到相应的part与其关联时会自动创建一个新part与其关联。

检入操作--》Auto Associate upon Check In项设置成“是”

### 编写查询代码

自定义类并且继承DefaultAutoAssociatePartFinderCreator类，注意编译后的类文件路径和名字要和首选项中设置的一致。

例子：

```java
public class AutoAssociatePart extends DefaultAutoAssociatePartFinderCreator
        implements AutoAssociatePartFinderCreator {

    private static Logger logger = LogR.getLogger(AutoAssociatePart.class.getName());
    private static String INITIAL_VERSION = "1";

    public boolean isIsNewPart() {
        return super.isIsNewPart();
    }

    public void setIsNewPart(boolean a_IsNewPart) throws WTPropertyVetoException {
        super.setIsNewPart(a_IsNewPart);
    }
    @Override
    public WTPart findOrCreateWTPart (EPMDocument epmDoc, EPMWorkspace workspace) throws UniquenessException, WTPropertyVetoException, VersionControlException, WTException {
        logger.debug("find or create part coming");

        // 只针对数模，所以应先排除图纸对象
        if (!CADDocUtil.isDrawing(epmDoc)) {
            String epmNumber = epmDoc.getName();
            String epmNumbe2 = epmDoc.getCADName();
            WTPart part = CADDocUtil.getAssociatePart(epmDoc);
            if (part != null) {
                logger.debug("associate part has found");
                System.out.println("ffffffffffffound!");
                //当关联的part找到时，应该进行判断检入的CAD对象是一个装配还是一个CAD part
                //检查输入的是否是个Assembly，Assembly检入时number会自动加上后缀:.ASM
                if (epmNumber.indexOf(".") > 0 && ".ASM".equalsIgnoreCase(epmNumber.substring(epmNumber.lastIndexOf(".")))) {
                    //代表检入的EPM对象是个装配，需要检测其下面各个子EPM对象是否有对应的 part 对象,并且有相同的结构
                    /**
                     * 注释次段代码,看part结构和CAD结构不一致时,OOTB的表现
                     StringBuffer message = compareBOM(part , epmDoc);
                     if (message.length() > 0) {
                     throw new WTException("错误信息："+message.toString());
                     }
                     */
                }
                //找到之后应该先判断此part下是否存在所有者关系的CAD，如果没有，则返回此part，windchill会自动将返回的此part与检入的CAD对象关联
                // 如果有，则不返回此part，此时也可以检入成功，但是不会建立与part的关联
                List<EPMDocument> epmDocs = CADDocUtil.getLinkCADDoc(part);
                if (epmDocs == null || epmDocs.size() == 0) {
                    System.out.println("dddddddddddddd");
                    return part;
                }
                else{
                    throw new WTException("部件 "+part.getNumber() +" 已经存在关联！");
                }
            } else {
				/*
				 * 注释此段代码,CAD在检入时,如果找不到对应的part也可以检入
				 *
				throw new WTException("相应的part "+ epmDoc.getNumber() +",不存在! ");
				 * */
            }
        }

        return super.findOrCreateWTPart(epmDoc, workspace);
    }
}

```

# 其他问题

* windchill下创建auth.properties文件内容为：auth = wcadmin:wcadmin（与creo端的连接用户一致）。但是这个操作的必要性未知，也许不去创建这个文件也行，只是当时实现过程中报了这个文件缺失错误，也有可能不是这个需求导致的这个错误。
* 首选项设置的部分在组织里面设置无效，在站点下才行。不确定，可能是之前有过设置导致冲突问题。
