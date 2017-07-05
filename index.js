/**
 * @author famanoder
 * ErrorInspector.js
 * support IE7+ && other browsers
 * https://famanoder.com/?boke=5867eea54aee37201fb4d1cc
 */

;(function(win){
	
	win.util=function(){
		var getArgType=function(arg){
			return Object.prototype.toString.call(arg).match(/\s(\w+)/)[1].toLowerCase();
		}
		var extend=function(){
			// extend(target,{},{},...)
			var objs=arguments;
			if (objs.length<=1) return objs[0];
			
			var _extend=function(a,b){
				if (getArgType(b)=='object') {
					for(var j in b){
						if(getArgType(b[j])=='object'){
							a[j]=_extend(a[j]||{},b[j]);
						}else{
							a[j]=b[j];
						}
					}
				};
				return a;
			}
			var res=_extend({},objs[0]);//原对象不可更改
			for(var i=1;i<objs.length;i++) _extend(res,objs[i]);
			return res;
		}
		var Browser=function(ua){
			var isChrome=ua.match(/chrome\/(\d+\.\d+)/i);
			if (isChrome) return 'Chrome/'+isChrome[1];
			var isFirefox=ua.match(/firefox\/(\d+\.\d+)/i);
			if (isFirefox) return 'Firefox/'+isFirefox[1];
			var isSafari=ua.match(/\w+\/(\d+(?:\.\d*)?)\ssafari/i);
			if (isSafari) return 'Safari/'+isSafari[1];
			var isIE=ua.match(/msie\s(\d+)/i);
			if (isIE) return 'IE/'+isIE[1];
			var isIE11=ua.match(/rv:(\d+\.\d+)\)\slike\sgecko/i);
			if(isIE11) return 'IE/11.0';
			var isOpera=ua.match(/opera\/\d+.+\w+\/(\d+\.\d+)$/i);
			if (isOpera) return 'Opera/'+isOpera[1];
			return '非主流哇！';
		}(navigator.userAgent);
		var stringifyQuery=function(){
			// stringifyQuery({},{},{}...)
			var agrs=arguments,
				_stringify=function(o){
					var q=[];
					for(var a in o) q.push(a+'='+encodeURIComponent(JSON?JSON.stringify(o[a]):o[a]));
					return q.join('&');
				};
			if (agrs) {
				if (agrs.length==1) {
					if(getArgType(agrs[0])!='object') return null;
					return _stringify(agrs[0]);
				}else{
					var _obj={};
					for(var i=0;i<agrs.length;i++){
						if (getArgType(agrs[i])=='object') _obj=extend(_obj,agrs[i]);
					}
					return _stringify(_obj);
				}
			}
			return null;
		}
		var fmtTime=function(){
			var date=new Date(),
				fill0=function(x){return x<10?'0'+x:x;};
			return fill0(date.getFullYear())+'-'+fill0(date.getMonth()+1)+'-'+fill0(date.getDate())+' '+fill0(date.getHours())+':'+fill0(date.getMinutes());
		}
		var load=function(url,fn) {
	        var head = document.getElementsByTagName('head')[0];          
	        var js = document.createElement('script');          
	        js.type='text/javascript';           
	        js.src=url;           
	        head.appendChild(js);          
	        if (document.all) {       
	            js.onreadystatechange = function () {     
	                if (js.readyState == 'loaded' || js.readyState == 'complete') fn&&fn(0);
	            }          
	        } else {                 
	            js.onload = function () {
	                fn&&fn(0);
	            }           
	        }
	        js.onerror=function(err){
	            fn&&fn(1);
	        }
	    }
		return {
			getArgType:getArgType,
			extend:extend,
			Browser:Browser,
			stringifyQuery:stringifyQuery,
			fmtTime:fmtTime,
			loadScript:load
		}
	}();
	win.ErrorInspector={
		defConfs:{
			url:'http://www.famanoder.com/error/common',
			qs:{
				id:location.host,
				page:location.host+location.pathname,
				browser:util.Browser,
				time:util.fmtTime()
			},
			$:{
				timeout:60000
			},
			IgnoreFromJSPattern:null,
			IgnoreMsgPattern:null,
			IgnoreBrowserError:false
		},
		Config:{},
		getConfs:function(){
			return util.extend(this.defConfs,this.Config);
		},
		getQuery:function(){
			var datas=this.getConfs();
			if (datas.url!='') {
				var isToMysite=datas.url.match(/\w+:\/\/www\.famanoder\.com\/error\/(\w+)$/i);
				//wether to my site
				if(isToMysite) datas.qs.name=isToMysite[1];
			};
			return datas;
		},
		parseErrorStack:function(err){
			if (err.stack) {
				var _err=err.stack.match(/at\s+(.+):(\d+):(\d+)\n*/);
				if (_err) return {
					msg:err.name+':'+err.message,
					from:_err[1],
					row:_err[2],
					col:_err[3]
				};
			};
			return {
				msg:err.message
			}
		},
		IsIgnoreTars:function(qs){
			var conf=this.getConfs();
			if (qs.from&&util.getArgType(conf.IgnoreFromJSPattern)=='regexp'&&conf.IgnoreFromJSPattern.test(qs.from)) return 1;
			return 0;
		},
		IsIgnoreMsgs:function(qs){
			var conf=this.getConfs();
			if (qs.msg&&util.getArgType(conf.IgnoreMsgPattern)=='regexp'&&conf.IgnoreMsgPattern.test(qs.msg)) return 1;
			return 0;
		},
		log:function(){//log或充当统计代码
				var agrs=[].slice.call(arguments,0),
					logs={inspector:'user_log'};
				if (!agrs.length) return false;
				var strs=function(json){
					var str=[];
					for(var i=0;i<agrs.length;i++) str.push(json.stringify(agrs[i]));
					return str.join('\n');
				};
				logs.msg=JSON?strs(JSON):agrs.join('');
				this.report(logs);
		},
		report:function(qs){
			var conf=this.getConfs();
			//防止url被置为空，
			//由于entend对原对象不可更改，所以默认值依然存在，而不是一起被置为空！！！！！
			if (conf.url=='') conf.url=this.Config.url=this.defConfs.url;
			var q=util.extend(this.getQuery().qs,qs);
			if (this.IsIgnoreTars(qs)) return false;
			if (this.IsIgnoreMsgs(qs)) return false;
			var qs=util.stringifyQuery(q);
			// if (qs&&window.console) console.error('ErrorInspector report：'+qs);
			if (conf.submit&&util.getArgType(conf.submit)=='function') {
				conf.submit(qs);
				return false;
			};
			new Image().src=conf.url+(/.+\/\w+\?.*/i.test(conf.url)?'&':'?')+qs;
		},
		tryit:function(fn){
			try{
				fn&&fn.call(ErrorInspector);
			}catch(e){
				if (!this.defConfs.IgnoreBrowserError&&window.console) console.error(e);
				this.report(util.extend(this.parseErrorStack(e),{inspector:'user_try'}));
			}
		}
	};
	win.onerror=function(err,url,row,col,error){
		var cfs={
			msg:err,
			from:url,
			inspector:'window'
		};
		row&&(cfs.row=row);
		col&&(cfs.col=col);
		ErrorInspector.report(cfs);
		var confs=ErrorInspector.getConfs();
		if (!confs.IgnoreBrowserError&&window.console) console.error(error);
		return confs.IgnoreBrowserError;
	}
	win.Tryit=function(fn){
        ErrorInspector.tryit(fn);
    }
    if(window.$){
        $(function(){
            var setajax=ErrorInspector.getConfs();
            if(setajax.$) {
                $.ajaxSetup({
                    timeout:setajax.$.timeout,
                    error: function(jqXHR){
                        setTimeout(function () {
                            util.getArgType(setajax.$.onError)=='function'?setajax.$.onError(jqXHR):alert(jqXHR.status+'，'+jqXHR.statusText);
                        }, 1);					
                    },
                    beforeSend: function(jqXHR){
                    	if (window.navigator.onLine!=undefined&&window.navigator.onLine==false) {
                    		jqXHR.abort();
                    		alert('net::ERR_INTERNET_DISCONNECTED');
                    		if (window.console&&window.console.error) console.error('net::ERR_INTERNET_DISCONNECTED');
                    	}
					}
                });
            }
        });
    }

		//友情提示
		window.onload=function(){
			var conf=ErrorInspector.getConfs();
			if (window.console&&window.console.warn) {
				if(conf.IgnoreBrowserError) console.warn('"IgnoreBrowserError:true" will hide all error in console (IE no error alert)');
				if(util.getArgType(conf.IgnoreMsgPattern)=='regexp') console.warn('IgnoreMsgPattern:'+conf.IgnoreMsgPattern+' will ignore some error match this pattern');
				if(util.getArgType(conf.IgnoreFromJSPattern)=='regexp') console.warn('IgnoreFromJSPattern:'+conf.IgnoreFromJSPattern+' will ignore some error match this pattern');
			};
			
		}




}(window));

/**
 * start inspect
 * @type {Object}
 */
// ErrorInspector.Config={
//     url:'//host/errors'
// }
