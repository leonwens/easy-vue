# Vue 实现思路

示例代码（后面都是基于这个 html 模板说明）

```html
<!DOCTYPE html>
<html>
  <head>
    <mate charest="utf-8" />
  </head>
  <body>
    <div id="app">
      <div>{{name}}：{{age}}</div>
      <div>{{address.city}}</div>
    </div>
  </body>
</html>
```

## step1: 实现数据和视图的绑定

```javascript
const app = new Vue({
  data() {
    return {
      name: 'wens',
      age: 18,
      address: {
        city: 'tj'
      }
    };
  }
});
app.$mount('#app');
```

1. 实现$mount 方法
   - 处理各种挂载方法（挂载到根节点）
   - 根节点下面的内容如何解析以及渲染参见下面内容
2. 通过 initState 方法将数据处理成响应式
   - 处理 data 的两种写法（data(){return {}}以及{}）
   - 数组类型重写 7 种方法 Object.create(Array.prototype)，给这 7 种类型增加数据劫持
   - 给对象类型新增数据劫持功能
   - 利用数据劫持实现变量使用更直观（直接调用 name 相当于 app.name)
3. 将模板转换成 ast，将 ast 装换成 render 方法
   - 利用各种正则将根节点的内容生成 ast
   - 根据 ast 生成代码字符串（内置\_c \_v \_s 等方法）
   - 使用 new Function('with(this){return ${code}')生成 render 方法
4. 调用 render 方法进行取值操作，产生对应的 vdom

## step2: 通过手动调用的方式实现更新

```javascript
const app = new Vue({
  data() {
    return {
      name: 'wens',
      age: 18,
      address: {
        city: 'tj'
      }
    };
  }
});
app.$mount('#app');
setTimeout(() => {
  app.age = 30;
  app.name = 'wensnb';
  app.address.city = 'hz';
  app._update(app._render()); // 手动调用update方法更新
}, 3000);
```

1. 调用\_update 方法把 vdom 转换成真实 dom 渲染
   - 初始化阶段
   - 更新阶段

## step3: 自动更新

1. 观察者模式实现依赖收集
2. 异步更新策略
3. mixin 的实现原理
