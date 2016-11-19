var url=require('url');
var path=require('path');
var fs=require('fs');
var config= {
    fileMatch: /^(html|htm)$/ig,
    maxAge: 0
};
var zlib=require('zlib');

module.exports=function(req,res,next,_path){
	console.log(req.url)
	var pathname=url.parse(req.url).pathname;
	var realpath='./public/a.html';
	
	var type='text/html';
	var extname='html';
	fs.exists(realpath,function(exist){
		if(!exist){
			res.writeHead(404,{
				'content-type':'text/plain'
			});
			res.write('The Resourse '+pathname+' was Not Found!');
			res.end();
		}else{
			fs.readFile(realpath,'binary',function(err,file){
				console.log(11);
				if(err){
					res.writeHead(500,{
						'content-type':'text/plain'
					});
					res.end();
				}
				if(extname.match(config.fileMatch)){
					var expires=new Date();
					expires.setTime(expires.getTime()+config.maxAge*1000);
					res.setHeader('Expires',expires.toUTCString());
					res.setHeader('cache-control','max-age='+config.maxAge);
				}
				fs.stat(realpath,function(err,stat){
					var lastModified=stat.mtime.toUTCString();
					res.setHeader('Last-Modified',lastModified);
					
					if(req.headers['if-modified-since']&&lastModified==req.headers['if-modified-since']){
						console.log(0);
						res.writeHead(304,{
							'content-type':type
						});
						res.end();
					}else{
						var raw=fs.createReadStream(realpath);
						var acceptEncoding='';
						for(var hd in req.headers){
							if (/(-encoding)/ig.test(hd)) {
								acceptEncoding=req.headers[hd];
							};
						}
						
						var matched=extname.match(/css|js|html/ig);

						if(matched&&acceptEncoding.match(/\bgzip\b/)){
							console.log(1);
							res.writeHead(200,{
								'content-type':type,
								'Content-Encoding':'gzip'
							});
							raw.pipe(zlib.createGzip()).pipe(res);
						}else if(matched&&acceptEncoding.match(/\bdeflate\b/)){
							console.log(2);
							res.writeHead(200,{
								'content-type':type,
								'Content-Encoding':'deflate'
							});
							raw.pipe(zlib.createDeflate()).pipe(res);
						}else{
							console.log(3);
							res.writeHead(200,{
								'content-type':type
							});
							raw.pipe(res);
						}
					}
				});
			});
		}
	});
};