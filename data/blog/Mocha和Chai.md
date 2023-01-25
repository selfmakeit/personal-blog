---
title: JavaScript单元测试的“抹茶”组合：Mocha和Chai
date: '2022-12-08'
tags: ['js', 'Mocha','Chai']
draft: false
summary: JavaScript单元测试的“抹茶”组合：Mocha和Chai
---

# JavaScript单元测试的“抹茶”组合：Mocha和Chai

**简介：**

mocha是一个javascript的测试框架，chai是一个断言库，两者搭配使用更佳，所以合称“抹茶”（其实mocha是咖啡）。“抹茶”特点是： 简单，node和浏览器都可运行。

`mocha`是一个javascript的测试框架，`chai`是一个断言库，两者搭配使用更佳，所以合称“抹茶”（其实 `mocha`是咖啡）。“抹茶”特点是： 简单，`node`和浏览器都可运行。

- `BDD`：Behavior Driven Development，行为驱动开发，注重测试逻辑
- `TDD`：Test-Driven Development，测试驱动开发，注重输出结果

## Mocha

`Mocha`是一个功能丰富的JavaScript测试框架，可以运行在 node 和浏览器上，使异步测试变得简单而有趣。`Mocha`在运行测试用例过程中，当捕获到错误时，依旧能够灵活地运行精确的报告。`mocha` 默认的模式是 `BDD`。

官网：[mochajs.org/](https://link.juejin.cn?target=https%3A%2F%2Fmochajs.org%2F)

在 `Node.js` 中，目前比较流行的单元测试组合是 `mocha + chai`。`mocha` 是一个测试框架，`chai` 是一个断言库，所以合称”抹茶”。

#### 安装

```
npm install --g mocha
```

### 运行

```
//mocha [debug] [options] [files]
mocha --recursive test
```

### 基本方法

Mocha 有三个基本方法：

- describe(moduleName, function)

describe 是可嵌套的，描述测试用例是否正确。

```
describe('测试模块的描述', function() {
  // ....
});
```

- it(info, function)

info为描述性说明。一个it对应一个单元测试用例。

```
describe('单元测试的描述，一般写明用途和返回值', function() {
  // ....
});
```

- assert.equal(exp1, exp2)

`mocha` 的断言语句，判断 `exp1` 是否等于 `exp2`。

### 异步代码测试

- done

一个 `it` 里面只有一个 `done`。

`done` 标识回调的最深处，也是嵌套回调函数的末端。

```
describe('User', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User('Luna');
      user.save(done);
    });
  });
});
```

### Test Hooks方法

`before()`、`after()`、`beforeEach()`、`afterEach()` 是基于 `BDD` 风格提出的，用于预处理和 `test` 后的处理。

`Test Hooks` 方法的几个注意点：

- `beforeEach` 会对当前 `describe` 下的所有子 `case` 生效；
- `before` 和 `after` 的代码没有特殊顺序要求；
- 同一个 `describe` 下的执行顺序为 `before`、`beforeEach`、`afterEach`、`after`；
- 当一个 `it` 有多个 `before` 的时候，执行顺序是从最外围的 `describe` 的 `before` 开始，其他同理。

```
describe('hooks', function() {
  before(function() {
    // runs before all tests in this block
  });
  after(function() {
    // runs after all tests in this block
  });
  beforeEach(function() {
    // runs before each test in this block
  });
  afterEach(function() {
    // runs after each test in this block
  });
  // test cases
});
```

`Hooks` 的三种写法：

```
beforeEach(function() {
});
beforeEach(function nameFun() {
});
beforeEach("some description", function() {
});
```

### only()、skip()函数

`describe` 块和 `it` 块都允许调用 `only()` 和 `skip()` 方法。

`only()` 方法表示在当前的父 `describe` 块下，只执行该单元的测试。

`skip()` 方法表示在当前的父 `describe` 块下，跳过不执行该单元的测试。

当在一个 `describe` 块下，同时存在 `only()` 和 `skip()` 方法，则只执行 `.only()` 方法。

```
describe('Array', function() {
  describe.only('父describe块下只执行该测试单元', () => {
    it.skip('跳过的测试单元', () => { //... });
  });
  describe('不执行', () => { //... });
});
```

### 常用命令参数

`--recursive` 遍历子目录下的全部文件

Mocha 默认运行 `/test` 子目录里面的测试脚本。

Mocha默认只执行 `/test` 子目录下第一层的测试用例。

所以，应加上– `recursive` 参数，使全部子目录下的测试用例都能被执行。

```
mocha --recursive
```

`-u tdd` 执行 `TDD` 模式

mocha默认的模式是 `BDD` ，要想执行 `TDD` 的 `test` 时需要加上参数，如：

```
mocha -u tdd test.js
```

`--watch, -w` 监听脚本变化

`--watch` 参数用来监视指定的测试脚本。当脚本发生变化，就会自动运行mocha。

```
mocha --watch
```

`--bail, -b` 参数指定只要有一个测试用例没有通过，就停止执行后面的测试用例。这对持续集成很有用。

```
mocha --bail
```

`-timeout, -t` 指定超时门槛

Mocha默认每个测试用例最多执行2000毫秒。如果2000毫秒后还没有执行完成，则报错。`-t`可执行超时门槛。

```
mocha -t 5000 test.js
```

## Chai断言库

`Chai`是一个 `BDD/TDD`模式的大而全的断言库，可以在node和浏览器环境运行，可以高效的和任何js测试框架搭配使用。

官网：[www.chaijs.com/](https://link.juejin.cn?target=https%3A%2F%2Fwww.chaijs.com%2F)

### 安装

```
npm install -g chai
```

### 覆盖率

既然是给功能代码写单元测试，那就应该有个指标去衡量单元测试覆盖了哪些功能代码，这就是接下来要介绍的测试覆盖率。

在 `Node.js` 中，我们使用 `istanbul` 作为覆盖率统计的工具，`istanbul` 可以帮助我们统计到代码的语句覆盖率、分支覆盖率、函数覆盖率以及行覆盖率，生成的报告如下：

```
istanbul cover error.js
```

![image.png](https://raw.githubusercontent.com/selfmakeit/resource/main/fa5b2c21700e45c8b42541a2d303e443.png)
