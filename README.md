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

每一个属性（被观察者）有一个 dep，watcher 是观察者，属性变化后通知观察者更新

1. 观察者模式实现依赖收集
   - 给组件中的属性增加收集器 dep
   - 页面渲染的时候，将渲染逻辑封（vm.\_update(vm.\_render())）装到 watcher 中
     - 一个组件对应一个 watcher 实例
     - 一个组件有 N 个属性，每个属性都有一个 dep
     - 可能不同组件之间共享同一个属性，那这时候这一个属性就会对应多个 watcher 实例
   - dep 记住这个 watcher，属性变化的时候可以找到对应的 dep 中存放的 watcher 进行重新渲染
2. 异步更新策略
   - 利用 eventLoop 和队列实现一次性更新，而不是多次更新
   - 实现 nextTick 函数，为了统一内部和使用者的执行时机，保证执行顺序（Vue 内部采用降级处理的方法实现，promise->mutationObserver->setImmediate->setTimeout）
3. mixin 的实现原理(TODO)
