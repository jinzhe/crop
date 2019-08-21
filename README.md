# crop
=============

无依赖的图片裁剪库

![demo.gif](https://i.loli.net/2019/08/21/rapFDu5UVs2By3M.gif)

## 安装

```sh
npm install --save @zee.kim/crop
```

## 使用

```javascript
new crop({
    width: 300,
    height: 300,
    //url:"", //默认显示图片
    success: function (data) {
        console.log(data);//这是个base64 图片字符串
    }
});
```
 