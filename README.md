## 一、后台
### 1、多版本（VersionsCtrl）:
* Webpack配置：

  原本的`webapck.config.js`改为`VersionsCtrl`需要的导出`function`的方式，参数为`version`；
  
```javascript
  module.exports = function(version){
    return webackConfig;
  }
```
* VersionsCtrl下的webpack启动与创建：
		
     
