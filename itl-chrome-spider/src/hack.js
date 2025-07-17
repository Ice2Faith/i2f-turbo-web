function injectObject(){
	var $hk={
		dom:function(sel){
			return document.querySelectorAll(sel);
		},
		each:function(elem,callback){
			if(!callback){
				return;
			}
			for(let key in elem){
				callback(elem[key],key);
			}
		},
		json:{
			to:function(elem){
				return JSON.stringify(elem);
			},
			from:function(str){
				return JSON.parse(str);
			}
		},
		base64:{
			to:function(elem){
				return btoa(elem);
			},
			from:function(str){
				return atob(str);
			}
		},
		url:{
			to:function(elem){
				return encodeURI(elem);
			},
			from:function(str){
				return decodeURI(str);
			}
		},
		urlCom:{
			to:function(elem){
				return encodeURIComponent(elem);
			},
			from:function(str){
				return decodeURIComponent(str);
			}
		},
		local:{
			set:function (key, val) {
				return localStorage.setItem(key, val);
			},
			get:function (key) {
				return localStorage.getItem(key);
			},
			clean:function (key) {
				return localStorage.removeItem(key);
			},
			setAsJson:function (key, obj) {
				return $hk.local.set(key, $hk.json.to(obj));
			},
			getWithJson:function (key) {
				return $hk.json.from($hk.local.get(key));
			},
		},
		session:{
			set:function (key, val) {
				return sessionStorage.setItem(key, val);
			},
			get:function (key) {
				return sessionStorage.getItem(key);
			},
			clean:function (key) {
				return sessionStorage.removeItem(key);
			},
			setAsJson:function (key, obj) {
				return $hk.session.set(key, $hk.json.to(obj));
			},
			getWithJson:function (key) {
				return $hk.json.from($hk.session.get(key));
			},
		},
		str:{
			replaceAll:function (str, reg, rep) {
				let ret = '';
				let arr = str.split(reg);
				for (let i = 0; i < arr.length; i++) {
					if (i != 0) {
						ret += rep;
					}
					ret += arr[i];
				}

				return ret;
			},
			paddingString:function (str, len, pad, isLeftPad) {
				if(isLeftPad==undefined){
					isLeftPad=true;
				}
				str = str + '';
				pad = pad + '';
				len = parseInt(len);
				if (str.length >= len) {
					return str;
				}
				if (pad == '') {
					pad = ' ';
				}
				let diffLen = len - str.length;
				let padStr = '';
				let padLen = pad.length;
				let times = Math.floor(diffLen / padLen);
				for (let i = 0; i < times; i++) {
					padStr = padStr + pad;
				}
				let moreLen = diffLen - padStr.length;
				padStr = padStr + pad.substring(0, moreLen);
				if (isLeftPad) {
					return padStr + str;
				} else {
					return str + padStr;
				}
			},
		},
		date:{
			formatDate:function (date, patten) {
				if (!date) {
					date = new Date();
				} else {
					date = new Date(date);
				}
				if (!patten || patten == '') {
					patten = 'yyyy-MM-dd HH:mm:ss SSS';
				}
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
				let hour = date.getHours();
				let min = date.getMinutes();
				let sec = date.getSeconds();
				let msec = date.getMilliseconds();

				let hour12 = hour > 12 ? (hour - 12) : hour;
				let isAm = hour < 12;

				let ret = patten;
				ret = $hk.str.replaceAll(ret, 'yyyy', $hk.str.paddingString(year, 4, '0'));
				ret = $hk.str.replaceAll(ret, 'MM', $hk.str.paddingString(month, 2, '0'));
				ret = $hk.str.replaceAll(ret, 'dd', $hk.str.paddingString(day, 2, '0'));
				ret = $hk.str.replaceAll(ret, 'HH', $hk.str.paddingString(hour, 2, '0'));
				ret = $hk.str.replaceAll(ret, 'mm', $hk.str.paddingString(min, 2, '0'));
				ret = $hk.str.replaceAll(ret, 'ss', $hk.str.paddingString(sec, 2, '0'));
				ret = $hk.str.replaceAll(ret, 'SSS', $hk.str.paddingString(msec, 3, '0'));
				ret = $hk.str.replaceAll(ret, 'hh', $hk.str.paddingString(hour12, 2, '0'));

				ret = $hk.str.replaceAll(ret, 'y', $hk.str.paddingString(year, 0));
				ret = $hk.str.replaceAll(ret, 'M', $hk.str.paddingString(month, 0));
				ret = $hk.str.replaceAll(ret, 'd', $hk.str.paddingString(day, 0));
				ret = $hk.str.replaceAll(ret, 'H', $hk.str.paddingString(hour, 0));
				ret = $hk.str.replaceAll(ret, 'm', $hk.str.paddingString(min, 0));
				ret = $hk.str.replaceAll(ret, 's', $hk.str.paddingString(sec, 0));
				ret = $hk.str.replaceAll(ret, 'S', $hk.str.paddingString(msec, 0));
				ret = $hk.str.replaceAll(ret, 'h', $hk.str.paddingString(hour12, 0));

				return ret;

			},
			parseDate:function (str, patten) {
				str = str + '';
				if (!patten) {
					patten = 'yyyy-MM-dd HH:mm:ss SSS';
				}
				let idxYear4 = patten.indexOf('yyyy');
				let idxMonth2 = patten.indexOf('MM');
				let idxDay2 = patten.indexOf('dd');
				let idxHour2 = patten.indexOf('HH');
				let idxMin2 = patten.indexOf('mm');
				let idxSec2 = patten.indexOf('ss');
				let idxMsec3 = patten.indexOf('SSS');
				let idxHour122 = patten.indexOf('hh');

				let year = 1980;
				let month = 1;
				let day = 1;
				let hour = 0;
				let min = 0;
				let sec = 0;
				let msec = 0;

				if (idxYear4 >= 0) {
					year = parseInt(str.substring(idxYear4, idxYear4 + 4));
				}
				if (idxMonth2 >= 0) {
					month = parseInt(str.substring(idxMonth2, idxMonth2 + 2));
				}
				if (idxDay2 >= 0) {
					day = parseInt(str.substring(idxDay2, idxDay2 + 2));
				}
				if (idxHour2 >= 0) {
					hour = parseInt(str.substring(idxHour2, idxHour2 + 2));
				}
				if (idxMin2 >= 0) {
					min = parseInt(str.substring(idxMin2, idxMin2 + 2));
				}
				if (idxSec2 >= 0) {
					sec = parseInt(str.substring(idxSec2, idxSec2 + 2));
				}
				if (idxMsec3 >= 0) {
					msec = parseInt(str.substring(idxMsec3, idxMsec3 + 3));
				}
				return new Date(year, month - 1, day, hour, min, sec, msec);
			},
		}


	}
	;
	window.$hk=$hk;
	document.$hk=$hk;
}

function forceHackInit() {
	if ($(".hackArea").length > 0) {
		return;
	}
	injectObject()
	console.log('hacking');

	console.log('eval inject script');
	var hackHtml =
		'<div class="hackArea">' +
		'' +
		'<span class="hackBtn">可编辑<input id="hackEditable" type="checkbox"/></span>' +
		'<span class="hackBtn" id="hackGiteeDoc">Gitee文档</span>'+
		'<span class="hackBtn" id="hackGithubDoc">Github文档</span>'+
		'<span class="hackBtn" id="hackGitlabDoc">Gitlab文档</span>'+
		'<span class="hackBtn" id="hackHrefs">打印链接</span>' +
		'<span class="hackBtn" id="hackImgs">打印图片</span>' +
		'<span class="hackBtn" id="hackVideos">打印视频</span>' +
		'<span class="hackBtn" id="hackAudios">打印音频</span>' +
		'<span class="hackBtn" id="hackMergeImages">聚合图片</span>' +
		'<span class="hackBtn" id="hackMergeVideos">聚合视频</span>' +
		'<span class="hackBtn" id="hackMergeAudios">聚合音频</span>' +
		'<span class="hackBtn" id="hackMergeTables">聚合表格</span>' +
		'<span class="hackBtn" id="hackConsole">控制台</span>' +
		'<span class="hackBtn" id="hackObj">挂载</span>' +
		'' +
		'</div>' +
		'<style>' +
		'.hackArea{' +
		'position:fixed;' +
		'top:0;' +
		'left:0;' +
		'right:0;' +
		'z-index:9999;' +
		'border:solid 1px orangered;' +
		'border-radius:5px;' +
		'background-color:#ffeeeeff;' +
		'height: 2px;' +
		'overflow: hidden;' +
		'padding: 0px;' +
		'text-align: center;' +
		'}' +
		'.hackArea:hover{' +
		'padding:5px;' +
		'height: auto;' +
		'overflow: auto;' +
		'}' +
		'.hackBtn{' +
		'padding: 3px;' +
		'margin: 3px 3px;' +
		'border: solid 1px red;' +
		'border-radius: 3px;' +
		'}' +
		'</style>';
	$(document.body).append(hackHtml);

	$("#hackEditable").click(function () {
		if ($(this).prop('checked')) {
			document.body.contentEditable = true;
			let doms=document.querySelectorAll('*');
			for(let i=0;i<doms.length;i++){
				let element=doms[i];let clone = element.cloneNode(true);
				element.parentNode.replaceChild(clone, element);
			}
			console.log('content editable!');
		} else {
			document.body.contentEditable = 'inherit';
			console.log('content inherit!');
		}
	});


	$("#hackGiteeDoc").click(function () {
		showOnlyGiteeFileContent();
	});

	$("#hackGithubDoc").click(function () {
		showOnlyGithubFileContent();
	});

	$("#hackGitlabDoc").click(function () {
		showOnlyGitlabFileContent();
	});

	$("#hackHrefs").click(function () {
		printfAllHrefs();
	});

	$("#hackImgs").click(function () {
		printfAllImgs();
	});

	$("#hackVideos").click(function () {
		printfAllVideos();
	});

	$("#hackAudios").click(function () {
		printfAllAudios();
	});


	$("#hackObj").click(function () {
		console.log('mount $hk', $hk);
		document.$hk = $hk;
		console.log('mount document.$hk', document.$hk);
		$('body').$hk = $hk;
		window.$hk=$hk;
		console.log('mount document.$hk', document.$hk);
	});

	$("#hackConsole").click(function () {
		let injectConsoleHtml = '<script id="hackConsoleScript" src="//cdn.jsdelivr.net/npm/eruda"></script>';
		$(document.body).append(injectConsoleHtml);
		console.log('open console inject: eruda.init();');
		setTimeout(function () {
			window.eruda.init();
		}, 5000);
	});


	$("#hackMergeImages").click(function () {
		mergeAllImages();
	});

	$("#hackMergeVideos").click(function () {
		mergeAllVideos();
	});

	$("#hackMergeAudios").click(function () {
		mergeAllAudios();
	});

	$("#hackMergeTables").click(function () {
		mergeAllTables();
	});
}

forceHackInit();
setInterval(forceHackInit, 1000);

// gitee只显示文件内容，方便打印
function showOnlyGiteeFileContent(){
	let dom=document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder')
	if(!dom){
		return
	}
	try{document.querySelector('body.git-project').style.padding='0px';}catch(e){}
	try{document.querySelector('header.common-header').style.display='none';}catch(e){}
	try{document.querySelector('footer#git-footer-main').style.display='none';}catch(e){}
	try{document.querySelector('div.side-toolbar').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.git-project-header').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div#git-project-container').style.padding='0px';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.git-project-desc-wrapper').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.git-project-bread').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder').style.border='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder').style.padding='5px';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_title').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_catalog').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_line').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_content').style.padding='0px';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_content').style.borderLeft='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.project-right-side-contaner').remove()}catch(e){}
	try{document.querySelector('div.site-content div.container div.register-guide').style.display='none';}catch(e){}
	try{document.querySelector('div.site-content div.container div.git-project-content-wrapper div.project-left-side-contaner').style.display='none';}catch(e){}
	let imgs=document.querySelectorAll('div.site-content div.container div.git-project-content-wrapper div.git-project-content div.file_holder div.file_content img');
	for(let i=0;i<imgs.length;i++){
		imgs[i].style.width='100vw';
	}

}

// github只显示文件内容，方便打印
function showOnlyGithubFileContent(){
	let dom=document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned')
	if(!dom){
		return
	}

	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"]').style.width='100vw';}catch(e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"]').style.position='absolute';}catch(e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"]').style.left='0px';}catch(e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div#StickyHeader').style.display='none';}catch(e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.react-code-view-bottom-padding').style.display='none';}catch(e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div[data-testid="latest-commit"]').parentElement.style.display='none';}catch(e){}
	try {
		let banners = document.querySelectorAll('react-app div[data-selector="repos-split-pane-content"] div.react-code-size-details-banner');
		for (let i = 0; i < banners.length; i++) {
			banners[i].remove();
		}
	}catch(e){

	}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.react-blob-view-header-sticky').style.display='none';}catch (e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned').parentElement.style.margin='0px';}catch (e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned').style.padding='5px';}catch (e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned').parentElement.parentElement.style.borderStyle='none';}catch (e){}

	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned article').style.marginLeft='unset';}catch (e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned article').style.marginRight='unset';}catch (e){}
	try{document.querySelector('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned article').style.maxWidth='100vw';}catch (e){}

	try{document.querySelector('react-app div#repos-file-tree').style.display='none';}catch (e){}

	try {
		let imgs = document.querySelectorAll('react-app div[data-selector="repos-split-pane-content"] div.js-snippet-clipboard-copy-unpositioned article img')
		for (let i = 0; i < imgs.length; i++) {
			imgs[i].style.width = '100vw';
		}
	}catch (e){

	}
	try{document.querySelector('div[data-turbo-body] div.js-header-wrapper').style.display='none';}catch (e){}
}

// gitlab只显示文件内容，方便打印
function showOnlyGitlabFileContent(){
	let dom=document.querySelector('div.tree-holder div.file-holder')
	if(!dom){
		return
	}
	try{document.querySelector('nav.super-sidebar').style.display='none';}catch (e){}
	try{document.querySelector('div.page-with-super-sidebar').style.paddingLeft='0px';}catch (e){}
	try{document.querySelector('div.content-wrapper').style.paddingTop='0px';}catch (e){}
	try{document.querySelector('div.content-wrapper').style.paddingBottom='0px';}catch (e){}
	try{document.querySelector('div.content-wrapper main#content-body').parentElement.style.margin='0px';}catch (e){}
	try{document.querySelector('div.content-wrapper main#content-body').parentElement.style.padding='5px';}catch (e){}
	try{document.querySelector('div.content-wrapper main#content-body').parentElement.style.maxWidth='100vw';}catch (e){}
	try{document.querySelector('div.content-wrapper div.top-bar-container').remove()}catch (e){}
	try{document.querySelector('div.tree-holder').style.paddingTop='0px';}catch (e){}
	try{document.querySelector('div.tree-holder div.blob-content-holder').style.marginTop='0px';}catch (e){}
	try{document.querySelector('div.tree-holder div.info-well').remove();}catch (e){}
	try{document.querySelector('div.tree-holder div.nav-block').remove();}catch (e){}
	try{document.querySelector('div.tree-holder div.file-holder').style.border='none';}catch (e){}
	try{document.querySelector('div.tree-holder div.file-holder div.js-file-title').remove();}catch (e){}

	let imgs=document.querySelectorAll('div.tree-holder div.file-holder div.blob-viewer img')
	for(let i=0;i<imgs.length;i++){
		imgs[i].style.width='100vw';
	}
}

// 获取所有超链接
function printfAllHrefs() {
	let hrefs = document.querySelectorAll('a');
	for (let i = 0; i < hrefs.length; i++) {
		console.log(hrefs[i].innerText, hrefs[i].href);
	}
}

// 获取所有图片资源
function printfAllImgs() {
	let imgs = document.querySelectorAll('img');
	for (let i = 0; i < imgs.length; i++) {
		console.log(imgs[i].title, imgs[i].alt, imgs[i].src);
	}
}

// 获取所有视频资源
function printfAllVideos() {
	let vdos = document.querySelectorAll('video source');
	for (let i = 0; i < vdos.length; i++) {
		console.log(vdos[i].src);
	}
}

// 获取所有音频资源
function printfAllAudios() {
	let ados = document.querySelectorAll('audio source');
	for (let i = 0; i < ados.length; i++) {
		console.log(ados[i].src);
	}
}

function showPurityBodyDoms(doms,sepHtml){
	let styles=document.querySelectorAll('body > style');
	let scripts=document.querySelectorAll('body > script');
	document.body.innerHTML='';
	for(let i=0;i<doms.length;i++){
		if(i>0 && sepHtml){
			document.body.innerHTML+=sepHtml;
		}
		document.body.append(doms[i]);
	}
	for(let i=0;i<styles.length;i++){
		document.body.append(styles[i]);
	}
	for(let i=0;i<styles.length;i++){
		document.body.append(scripts[i]);
	}
}

// 聚合所有图片
function mergeAllImages() {
	let elems = document.querySelectorAll('img');
		for (let i = 0; i < elems.length; i++) {
		elems[i].style = 'width:30%;max-height:100vh;';
		elems[i].className = 'none';
	}
	showPurityBodyDoms(elems);
	scrollTo(0, 0);
}

// 聚合所有视频
function mergeAllVideos() {
	let elems = document.querySelectorAll('video');
	for (let i = 0; i < elems.length; i++) {
		elems[i].style = 'width:100%;max-height:100vh;';
		elems[i].className = 'none';
		elems[i].controls = true;
	}
	showPurityBodyDoms(elems);
	scrollTo(0, 0);
}

// 聚合所有音频
function mergeAllAudios() {
	let elems = document.querySelectorAll('audio');
	for (let i = 0; i < elems.length; i++) {
		elems[i].style = 'width:50%;max-height:100vh;';
		elems[i].className = 'none';
		elems[i].controls = true;
	}
	showPurityBodyDoms(elems);
	scrollTo(0, 0);
}


// 聚合所有表格
function mergeAllTables() {
	let elems = document.querySelectorAll('table');
	showPurityBodyDoms(elems,'<hr/>');
	scrollTo(0, 0);
}
