## 一、后台
### 1、多版本（VersionsCtrl）:
* Webpack配置：

  原本的`webapck.config.js`改为`VersionsCtrl`需要的导出`function`的方式，参数为`version`；
  
```javascript
	// webapck.config.vs.js
  module.exports = function(version){
    return webackConfig;
  }
```
* `VersionsCtrl`下的`webpack`启动与创建：

	a. 启动与创建 => `node start init newVersion [from oldVersion]`
	
	b. 启动 => `node start version`
	
	c. 列出所有版本文件 => `node start [xxx]`
