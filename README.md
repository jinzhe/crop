# vue-swipe
=============

基于 Vue.js 的轮播组件

![](demo.gif)

## 安装

```sh
npm install --save @zee.kim/vue-swipe
```

## 使用
首先在项目的入口文件中引入, 调用 Vue.use 全局安装组件。

```javascript
import vueSwipe from '@zee.kim/vue-swipe'
Vue.use(vueSwipe)
```

```html
<div id="app">
    <swipe 
    :autoplay="autoplay" 
    :width="width" 
    :height="height" 
    :items="items"></swipe>
</div>
```

```javascript
export default {
    data() {
        return {
            autoplay:true,
            width: window.innerWidth,
            height: 200,
            items: [
                "http://domain/xxx.jpg",
                "http://domain/xxx.jpg"
            ]
        };
    }
}
```