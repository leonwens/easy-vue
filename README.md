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
3. mixin 的实现原理
   - 提供 Vue.mixin 全局方法，让用户传入的配置和 Vue.options 进行合并
   - 根据不同的类型提供不同的合并策略
4. 实现数组本身的改动更新
   - 在之前只是实现了数组方法的劫持，手动更新可以实现识图同步更新
   - 现在需要对数据本身每一项进行依赖劫持

## step4: 计算属性和 watch

计算属性本身具有缓存效果，即：依赖的 data 不变化，多次取值只会走一次 get 方法

1. 计算属性
   - 本质就是一个 defineProperty
   - 每一个计算属性维护一个 dirty 变量，默认为 true，首次执行完之后会设置为 false（只有 true 的时候才会执行取值，从而实现缓存功能）
   - 计算属性不会立刻执行
   - 计算属性也有一个 watcher（不是组件的 watcher 实例）
2. watch 方法
   - 底层调用的都是实例上面的$watch 方法
   - 也是用过 new Watcher 来实现的

## step5: diff 算法

比较前后两次的虚拟节点，只更新差异部分，从而提升更新性能

1. diff 过程
   原则上都是同级比较

   - 不是相同节点（div -> span）删除旧节点，使用新的节点进行更新
   - 相同节点（标签和 key 都要相同）

     - 比较属性是否有差异，复用旧节点，将差异化的属性更新到旧节点（先把旧节点上有新节点上没有的属性全部删掉，然后再把新的节点属性全部赋值到复用的节点上）
     - 比较子节点
       - 有子节点 vs 无子节点（依次 append 或者全部置空）
       - 都有子节点（新旧子节点分别有头尾指针，遍历结束的条件是有一方的头指针 index>尾指针 index）
         - 新旧头节点比较是否相同（新旧头节点 index++）
         - 新旧尾节点比较是否相同（新旧尾节点 index--）
         - 新头节点和旧尾节点比较是否相同（新头节点 index++，旧尾节点 index--）
         - 旧头节点和新尾节点比较是否相同（旧头节点 index++，新尾节点 index--）
         - 先建立旧节点的 key 和 index 的 mapping 映射关系，新节点从头开始看是否存在于旧节点，
           - 如果存在，把旧节点复用，同时把该旧节点 insertBefore 到旧头节点，同时把原旧节点置为 undefined，更新新头节点
           - 如果不存在，创建新节点后 insertBefore 到旧头节点，更新新头节点

   - 跳出循环后
     - 新节点还有，则插入到尾部
     - 旧节点还有，删除

## step6: Vue.extend 以及 Vue.component

1. Vue.component
   只是记录了对应的组件名和 definitaion, 以 key-value 的形式放到了 Vue.options.components 上
2. Vue.extend
   返回一个子类，并在子类上记录自己的选项
