// devtools 中不能使用console.log
const log = (...args) => chrome.devtools.inspectedWindow.eval(`
    console.log(...${JSON.stringify(args)});
`);

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise}
 */
function getBlob(url) {
    return new Promise(function (resolve) {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };

        xhr.send();
    });
}

/**
 * 保存
 * @param  {Blob} blob
 * @param  {String} filename 想要保存的文件名称
 */
function saveAs(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        const body = document.querySelector('body');

        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);

        link.click();
        body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
    }
}

function saveTextAs(text,filename){
    saveAs(new Blob([text], {
        type: 'text/plain'
    }),filename)
}

function saveObjJsonAs(obj,filename){
    let text=JSON.stringify(obj,null,4)
    saveAs(new Blob([text], {
        type: 'text/plain'
    }),filename)
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
function download(url, filename) {
    // 使用异步执行
    setTimeout(function () {
        getBlob(url).then(function (blob) {
            saveAs(blob, filename);
        });
    }, 300);

}

var contentList = [];

function refreshCount() {
    $("#catchCount").html(contentList.length + '');
}

function toViewAuthor(userId) {
    window.open('https://www.douyin.com/user/' + userId);
}

$("#clearContext").click(function () {
    $("#content").html('');
    contentList = [];
    refreshCount();
});

$("#downloadAll").click(function () {
    $.each(contentList, function (index, item) {
        download(item.url, item.name);
    });
});

$("#exportJson").click(function(){
   if(contentList.length>0){
       saveObjJsonAs(contentList,"export.json")
   }
});

$("#exportUrl").click(function(){
    let text='';
    for(let i=0;i<contentList.length;i++){
        let url=contentList[i].url;
        text+=url+'\n';
    }
    saveTextAs(text,"urls.txt")
});

function copyUrls2Clipbord() {
    let input = document.querySelector("#downUrls");
    input.focus();
    input.select();
    input.setSelectionRange(0, 999999);
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        document.querySelector("#copytips").style.display = "block";
        setTimeout(function () {
            document.querySelector("#copytips").style.display = "none";
        }, 1200);
    }
    input.style.display = "none";
}

$("#copy2bord").click(function () {
    let urlStr = '';
    $.each(contentList, function (index, item) {
        urlStr += item.url + '\n';
    });

    let input = document.querySelector("#downUrls");
    input.style.display = "block";
    input.value = urlStr;

    setTimeout(function () {
        copyUrls2Clipbord();
    }, 1000);

});

refreshCount();

$("#ckbExtendsControlPanel").change(function(){
    if($("#ckbExtendsControlPanel").prop('checked')){
        $("#controlPanel").css('display','block');
    }else{
        $("#controlPanel").css('display','none');
    }
});

$("#ckbFilter").prop('checked', true);
$("#ckbFavorite").prop('checked', true);
$("#ckbFilterRepeat").prop('checked', true);
$("#ckbExtendsControlPanel").prop('checked',true);

function safeFileName(filename) {
    filename = filename.replaceAll('/', ' ');
    filename = filename.replaceAll('\\', ' ');
    filename = filename.replaceAll(':', ' ');
    filename = filename.replaceAll('*', ' ');
    filename = filename.replaceAll('<', ' ');
    filename = filename.replaceAll('>', ' ');
    filename = filename.replaceAll('"', ' ');
    filename = filename.replaceAll('\'', ' ');
    filename = filename.replaceAll('|', ' ');
    return filename;
}

function isRepeatResource(type, url, filename) {
    for (let i = contentList.length - 1; i >= 0; i--) {
        if (contentList[i].type == type && contentList[i].url == url && contentList[i].name == filename) {
            return true;
        }
    }
    return false;
}

const PARSE_ITEM_CLASS = {
    type: 'video/audio/image/doc',
    url: null,
    title: null,
    img: null,
    authorName: null,
    authorAvatar: null,
    authorId: null,
    authorHome: null,
};

// 将前一个列表合并到后一个列表
function mergeIntoList(src, dst) {
    if (!src) {
        return;
    }
    let enableRepeat = $("#ckbFilterRepeat").prop('checked');
    for (let i = 0; i < src.length; i++) {
        let item = src[i];
        let saveOk = true;
        if (enableRepeat) {
            if (isRepeatResource(item.url, item.filename)) {
                saveOk = false;
            }
        }
        if (saveOk) {
            dst.push(item);
        }
    }
}

let globalPropertyMatcherList=[]
let globalVideoMatcherList=[]
let globalAudioMatcherList=[]
let globalLiveMatcherList=[]
let globalImageMatcherList=[]
let globalDocumentMatcherList=[]

$("#matcherPropertyDownload").bind('click',function(){
    if(globalPropertyMatcherList.length>0){
        saveObjJsonAs(globalPropertyMatcherList,"property.json")
        globalPropertyMatcherList=[]
    }
})

$("#matcherVideoDownload").bind('click',function(){
    if(globalVideoMatcherList.length>0){
        saveObjJsonAs(globalVideoMatcherList,"video.json")
        globalVideoMatcherList=[]
    }
})

$("#matcherLiveDownload").bind('click',function(){
    if(globalLiveMatcherList.length>0){
        saveObjJsonAs(globalLiveMatcherList,"live.json")
        globalLiveMatcherList=[]
    }
})

$("#matcherAudioDownload").bind('click',function(){
    if(globalAudioMatcherList.length>0){
        saveObjJsonAs(globalAudioMatcherList,"audio.json")
        globalAudioMatcherList=[]
    }
})

$("#matcherImageDownload").bind('click',function(){
    if(globalImageMatcherList.length>0){
        saveObjJsonAs(globalImageMatcherList,"image.json")
        globalImageMatcherList=[]
    }
})

$("#matcherDocumentDownload").bind('click',function(){
    if(globalDocumentMatcherList.length>0){
        saveObjJsonAs(globalDocumentMatcherList,"document.json")
        globalDocumentMatcherList=[]
    }
})

$("#matcherClean").bind('click',function(){
    globalPropertyMatcherList=[]
    globalVideoMatcherList=[]
    globalAudioMatcherList=[]
    globalLiveMatcherList=[]
    globalImageMatcherList=[]
    globalDocumentMatcherList=[]
    updateMatcherCount()
})

function stringContaintsAny(str,arr=[]){
    for(let i=0;i<arr.length;i++){
        if(str.indexOf(arr[i])>=0){
            return true
        }
    }
    return false
}
function objectRecursiveMatcher(url,route,obj){
    Object.keys(obj).sort().forEach(function(key){
        let val=obj[key]
        if(!val || val==''){
            return
        }
        let lkey=key.toLowerCase();
        let nextRoute=route+"."+key;
        if(lkey.indexOf('url')>=0){
            let elem={
                type: 'property',
                url,
                route: nextRoute,
                val
            }
            globalPropertyMatcherList.push(elem)
            log('url property',elem)
        }
        let jval=JSON.stringify(val)
        if(jval.startsWith("\"") && jval.endsWith("\"")){
            let lval=val.toLowerCase()
            if(stringContaintsAny(lval,[".mp4",".flv",".mkv",".rmvb",".wmv",".avi",".mpeg",".mov"])){
                let elem={
                    type: 'video',
                    url,
                    route: nextRoute,
                    val
                }
                globalVideoMatcherList.push(elem)
                log('url video',elem)
            }else if (stringContaintsAny(lval,[".m3u8",".hls",".ts"])){
                let elem={
                    type: 'live',
                    url,
                    route: nextRoute,
                    val
                }
                globalLiveMatcherList.push(elem)
                log('url live',elem)
            }else if (stringContaintsAny(lval,[".mp3",".wav",".mp2",".flac",".aac",".ogg"])){
                let elem={
                    type: 'audio',
                    url,
                    route: nextRoute,
                    val
                }
                globalAudioMatcherList.push(elem)
                log('url audio',elem)
            }else if (stringContaintsAny(lval,[".jpg",".png",".gif",".webp",".jpeg",".bmp"])){
                let elem={
                    type: 'image',
                    url,
                    route: nextRoute,
                    val
                }
                globalImageMatcherList.push(elem)
                log('url image',elem)
            }else if (stringContaintsAny(lval,[".txt",
                ".doc",".docx",
                ".xls",".xlsx",
                ".ppt",".pptx",
                ".md",".json",".sql",
                ".sh",".bat",".exe",".apk",
                ".zip",".tar",".tgz",".img",".iso",".rar",".7z"
            ])){
                let elem={
                    type: 'doc',
                    url,
                    route: nextRoute,
                    val
                }
                globalDocumentMatcherList.push(elem)
                log('url doc',elem)
            }
        }else if(jval.startsWith("{") && jval.endsWith("}")){
            objectRecursiveMatcher(url,nextRoute,val)
        }else if(jval.startsWith("[") && jval.endsWith("]")){
            for(let i=0;i<val.length;i++){
                let arrNextRoute=nextRoute+"["+i+"]"
                objectRecursiveMatcher(url,arrNextRoute,val[i])
            }
        }
    })
}

function updateMatcherCount(){
    $("#matcherPropertyCount").html(globalPropertyMatcherList.length+'')

    $("#matcherVideoCount").html(globalVideoMatcherList.length+'')

    $("#matcherLiveCount").html(globalLiveMatcherList.length+'')

    $("#matcherAudioCount").html(globalAudioMatcherList.length+'')

    $("#matcherImageCount").html(globalImageMatcherList.length+'')

    $("#matcherDocumentCount").html(globalDocumentMatcherList.length+'')
}
function responseBodyMatcher(url,headers,res){
    if(!res){
        return
    }
    if(!$("#ckbMatcher").prop("checked")){
        return
    }
    objectRecursiveMatcher(url,"",res)
    updateMatcherCount()
}


// 解析快手视频
function parseKuaishouLikeVideo(url, headers, res) {
    let ret = [];

    let needParse=false
    // 快手视频
    // 个人主页相关列表
    const likeUrl = '/rest/v/feed/liked';
    if (url.indexOf(likeUrl) >= 0) {
        needParse=true;
    }

    const collectUrl='/rest/v/collect/list'
    if (url.indexOf(collectUrl) >= 0) {
        needParse=true;
    }

    const privateUrl='/rest/v/profile/private/list'
    if (url.indexOf(privateUrl) >= 0) {
        needParse=true;
    }

    if(!needParse){
        return ret;
    }

    needParse=false;

    if ($("#ckbKuaishouLike").prop('checked')) {
        needParse=true;
    }

    if ($("#ckbKuaishouCollect").prop('checked')) {
        needParse=true;
    }

    if ($("#ckbKuaishouPrivate").prop('checked')) {
        needParse=true;
    }

    if(!needParse){
        return ret;
    }

    if (!res) {
        return ret;
    }


    if(!res.feeds){
        return ret;
    }

    let feeds=res.feeds

    if(!feeds || feeds.length==0){
        return
    }

    for (let i = 0; i < feeds.length; i++) {
        let doc = {
            type: 'video',
            url: null,
            title: null,
            img: null,
            authorName: null,
            authorAvatar: null,
            authorId: null,
            authorHome: null,
        };
        let item = feeds[i];
        if (!item) {
            continue;
        }
        if (!item.photo) {
            continue;
        }
        if (!item.photo.photoUrls) {
            continue;
        }
        if (item.photo.photoUrls.length==0) {
            continue;
        }
        let curr=item.photo.photoUrls[0]
        if(!curr.url || curr.url==''){
            continue
        }

        doc.url = curr.url;
        doc.title = item.photo.caption;
        if (doc.filename && doc.filename != "") {
            doc.filename = safeFileName(doc.title) + '.mp4';
        } else {
            doc.filename = 'download.mp4';
        }
        doc.img = item.photo.coverUrl;
        if (item.author) {
            doc.authorName = item.author.name;
            doc.authorAvatar = item.author.headerUrl;
            doc.authorId = item.author.id;
            doc.authorHome = 'https://www.kuaishou.com/profile/' + doc.authorId;
        }

        ret.push(doc);
    }

    return ret;
}


// 解析快手视频
function parseKuaishouVideo(url, headers, res) {
    let ret = [];

    // 快手视频
    // 个人主页相关列表
    const catchUrl = '/graphql';
    if (url.indexOf(catchUrl) < 0) {
        return ret;
    }

    if (!$("#ckbKuaishouUserHome").prop('checked')) {
        return ret;
    }

    if (!res.data) {
        return ret;
    }


    if(!res.data.visionProfilePhotoList){
        return ret;
    }

    let feeds=res.data.visionProfilePhotoList.feeds

    if(!feeds || feeds.length==0){
        return
    }

    for (let i = 0; i < feeds.length; i++) {
        let doc = {
            type: 'video',
            url: null,
            title: null,
            img: null,
            authorName: null,
            authorAvatar: null,
            authorId: null,
            authorHome: null,
        };
        let item = feeds[i];
        if (!item) {
            continue;
        }
        if (!item.photo) {
            continue;
        }
        if (!item.photo.videoResource) {
            continue;
        }
        if (!item.photo.videoResource.h264) {
            continue;
        }
        if (!item.photo.videoResource.h264.adaptationSet) {
            continue;
        }
        if (item.photo.videoResource.h264.adaptationSet.length==0) {
            continue;
        }
        let representation=item.photo.videoResource.h264.adaptationSet[0].representation
        if(!representation || representation.length==0){
            continue;
        }
        let curr=representation[0]
        if(!curr.url || curr.url==''){
            continue
        }

        doc.url = curr.url;
        doc.title = item.photo.caption;
        if (doc.filename && doc.filename != "") {
            doc.filename = safeFileName(doc.title) + '.mp4';
        } else {
            doc.filename = 'download.mp4';
        }
        doc.img = item.photo.coverUrl;
        if (item.author) {
            doc.authorName = item.author.name;
            doc.authorAvatar = item.author.headerUrl;
            doc.authorId = item.author.id;
            doc.authorHome = 'https://www.kuaishou.com/profile/' + doc.authorId;
        }

        ret.push(doc);
    }

    return ret;
}
// 解析头条视频
function parseToutiaoVideo(url, headers, res) {
    let ret = [];
    // 头条视频
    // 个人主页相关列表
    const catchUrl = '/api/pc/list/user/feed';
    if (url.indexOf(catchUrl) < 0) {
        return ret;
    }

    // 小视频
    const shortVideoParam = 'category=pc_profile_short_video';

    // 微头条
    const ugcParam = 'category=pc_profile_ugc';

    // 视频
    const videoParam = 'category=pc_profile_video';

    let needParse = false;
    if ($("#ckbToutiaoUserShortVideo").prop('checked') && url.indexOf(shortVideoParam) >= 0) {
        needParse = true;
    }

    if ($("#ckbToutiaoUserUgc").prop('checked') && url.indexOf(ugcParam) >= 0) {
        needParse = true;
    }

    if ($("#ckbToutiaoUserVideo").prop('checked') && url.indexOf(videoParam) >= 0) {
        needParse = true;
    }

    if (!needParse) {
        return ret;
    }

    // 视频解析路径
    // url=data[i].video.play_addr.url_list[i]
    // name=data[i].title

    if (!res.data) {
        return ret;
    }

    for (let i = 0; i < res.data.length; i++) {
        let doc = {
            type: 'video',
            url: null,
            title: null,
            img: null,
            authorName: null,
            authorAvatar: null,
            authorId: null,
            authorHome: null,
        };
        let item = res.data[i];
        if (!item) {
            continue;
        }
        if (!item.video) {
            continue;
        }
        if (!item.video.play_addr) {
            continue;
        }
        if (!item.video.play_addr.url_list) {
            continue;
        }


        doc.url = item.video.play_addr.url_list[0];
        doc.title = item.title;
        if (doc.filename && doc.filename != "") {
            doc.filename = safeFileName(doc.title) + '.mp4';
        } else {
            doc.filename = 'download.mp4';
        }
        if (item.video.origin_cover) {
            if (item.video.origin_cover.url_list) {
                doc.img = item.video.origin_cover.url_list[0];
            }
        }
        if (item.user_info) {
            doc.authorName = item.user_info.name;
            doc.authorAvatar = item.user_info.avatar_url;
            doc.authorId = item.user_info.user_id;
            doc.authorHome = 'https://www.toutiao.com/c/user/token/' + doc.authorId + '/?source=m_redirect&tab=all';
        }

        ret.push(doc);
    }

    return ret;
}

// 解析抖音视频
function parseTiktokVideo(url, headers, res) {
    let ret = [];
    // 抖音视频
    // 喜欢列表
    const favoriteUrl = 'aweme/favorite';
    // 收藏列表
    const collectionUrl = 'aweme/listcollection';
    // 个人作品
    const postUrl = 'aweme/post';
    // 相关推荐
    const relatedUrl = 'aweme/related';
    // 观看历史
    const historyUrl = 'history/read';

    let needParse = false;

    if ($("#ckbTiktokFavorite").prop('checked') && url.indexOf(favoriteUrl) >= 0) {
        needParse = true;
    }
    if ($("#ckbTiktokCollection").prop('checked') && url.indexOf(collectionUrl) >= 0) {
        needParse = true;
    }
    if ($("#ckbTiktokPost").prop('checked') && url.indexOf(postUrl) >= 0) {
        needParse = true;
    }
    if ($("#ckbTiktokRelated").prop('checked') && url.indexOf(relatedUrl) >= 0) {
        needParse = true;
    }
    if ($("#ckbTiktokHistory").prop('checked') && url.indexOf(historyUrl) >= 0) {
        needParse = true;
    }

    if (!needParse) {
        return ret;
    }

    if (!res.aweme_list) {
        return ret;
    }

    for (let i = 0; i < res.aweme_list.length; i++) {
        let doc = {
            type: 'video',
            url: null,
            title: null,
            img: null,
            authorName: null,
            authorAvatar: null,
            authorId: null,
            authorHome: null
        };

        let item = res.aweme_list[i];

        if (!item) {
            continue;
        }

        if (!item.video) {
            continue;
        }

        if (!item.video.play_addr) {
            continue;
        }

        if (!item.video.play_addr.url_list) {
            continue;
        }

        doc.url = item.video.play_addr.url_list[0];
        doc.title = item.desc;
        if (doc.filename && doc.filename != "") {
            doc.filename = safeFileName(doc.title) + '.mp4';
        } else {
            doc.filename = 'download.mp4';
        }
        if (item.video.cover) {
            if (item.video.cover.url_list) {
                doc.img = item.video.cover.url_list[0];
            }
        }
        if (item.author) {
            doc.authorName = item.author.nickname;
            doc.authorId = item.author.sec_uid;
            doc.authorHome = 'https://www.douyin.com/user/' + doc.authorId;
            if (item.author.avatar_thumb) {
                if (item.author.avatar_thumb.url_list) {
                    doc.authorAvatar = item.author.avatar_thumb.url_list[0];
                }
            }
        }


        ret.push(doc);
    }

    return ret;
}

// 解析微博视频
function parseWeiboVideo(url, headers, res) {

    let ret = [];
    if (!res) {
        return ret;
    }

    let needParse = false;

    // 微博个人主页
    // ajax/statuses/mymblog
    const catchHomeUrl = '/ajax/statuses/mymblog';
    if ($("#ckbWeiboUserHome").prop('checked') && url.indexOf(catchHomeUrl) >= 0) {
        needParse = true;
    }

    // 微博个人视频
    // /ajax/profile/getWaterFallContent
    const catchWaterFallUrl = '/ajax/profile/getWaterFallContent';
    if ($("#ckbWeiboUserVideo").prop('checked') && url.indexOf(catchWaterFallUrl) >= 0) {
        needParse = true;
    }

    if (!needParse) {
        return ret;
    }

    // data.list[0].page_info.media_info.playback_list[0].play_info.url
    if (!res.data) {
        return ret;
    }

    if (!res.data.list) {
        return ret;
    }

    for (let i = 0; i < res.data.list.length; i++) {
        let doc = {
            type: 'video',
            url: null,
            title: null,
            img: null,
            authorName: null,
            authorAvatar: null,
            authorId: null,
            authorHome: null,
        };
        let item = res.data.list[i];
        if (!item) {
            continue;
        }
        if (!item.page_info) {
            continue;
        }
        if (!item.page_info.media_info) {
            continue;
        }
        if (!item.page_info.media_info.playback_list) {
            continue;
        }
        let video_url = null;
        for (let j = 0; j < item.page_info.media_info.playback_list.length; j++) {
            let play = item.page_info.media_info.playback_list[j];
            if (play) {
                if (play.play_info) {
                    if (play.play_info.url) {
                        video_url = play.play_info.url;
                        break;
                    }
                }
            }
        }
        if (!video_url) {
            continue;
        }
        let video_title = item.page_info.media_info.kol_title;

        doc.url = video_url;
        doc.title = video_title;
        doc.img = item.page_info.page_pic;
        let author = item.page_info.media_info.author_info;
        if (!author) {
            author = item.user;
        }
        if (author) {
            doc.authorId = author.idStr;
            doc.authorName = author.screen_name;
            doc.authorAvatar = author.avatar_hd;
            doc.authorHome = 'https://www.weibo.com/' + doc.authorId;
        }

        ret.push(doc);
    }

    return ret;
}

// 获取content-type
function parseContentType(headers) {
    if (!headers) {
        headers = [];
    }
    let contentType = '';
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        if (header['name'].toLowerCase().trim() == 'content-type') {
            contentType = header['value'];
        }
    }
    contentType = contentType.toLowerCase();

    return contentType;
}

// 获取URL中的后缀
function parseFileSuffix(url) {
    if (!url) {
        url = '';
    }
    let suffix = '';
    let sufUrl = url;
    let qsIdx = sufUrl.indexOf('?');
    if (qsIdx >= 0) {
        sufUrl = sufUrl.substring(0, qsIdx);
    }
    let sufIdx = sufUrl.lastIndexOf('.');
    if (sufIdx >= 0) {
        suffix = sufUrl.substring(sufIdx);
        suffix = suffix.toLowerCase();
    }
    return suffix;
}

// 获取URL中的文件名
function parseFileName(url) {
    if (!url) {
        url = '';
    }
    let bidx = url.lastIndexOf('/');
    let eidx = url.indexOf("?");
    let filename = '';
    if (bidx >= 0 && eidx >= 0) {
        filename = url.substring(bidx + 1, eidx);
    } else if (bidx >= 0) {
        filename = url.substring(bidx + 1);
    }
    filename = safeFileName(filename);
    return filename;
}

// 根据contentType和URL进行嗅探指定类型的资源
function parseCommonResources(url, headers, suffixArr = [], contentTypeArr = []) {
    let ret = {
        type: null,
        url: null,
        title: null,
        img: null,
        authorName: null,
        authorAvatar: null,
        authorId: null,
        authorHome: null,
    };
    if (!suffixArr) {
        suffixArr = [];
    }
    if (!contentTypeArr) {
        contentTypeArr = [];
    }
    if (suffixArr.length == 0 && contentTypeArr.length == 0) {
        return ret;
    }
    let contentType = parseContentType(headers);
    let suffix = parseFileSuffix(url);

    let isTarget = false;
    for (let i = 0; i < contentTypeArr.length; i++) {
        let item = contentTypeArr[i];
        if (contentType.indexOf(item) >= 0) {
            isTarget = true;
            break;
        }
    }

    for (let i = 0; i < suffixArr.length; i++) {
        let item = suffixArr[i];
        if (suffix == item) {
            isTarget = true;
            break;
        }
    }

    if (!isTarget) {
        return ret;
    }

    let filename = parseFileName(url);
    ret.title = filename;
    ret.url = url;
    return ret;
}

// 在新页签中打开窗口
function openInNewTab(url) {
    window.open(url);
}


// 渲染视频到面板
function renderVideos(list) {
    if (!list) {
        return;
    }
    let purityMode=$("#ckbPurityMode").prop('checked');
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let type = item.type;
        if (!type) {
            type = 'image';
        }
        let typeCoverHtml = '';
        let authorAvatar=item.authorAvatar;
        if (type == 'video') {
            typeCoverHtml = '' +
                '                <video controls width="100%">' +
                '                    <source src="' + item.url + '"/>' +
                '                </video>';
        } else if (type == 'audio') {
            typeCoverHtml = '' +
                '                <audio controls src="' + item.url + '" width="100%">' +
                '                </audio>';
        } else if (type == 'image') {
            typeCoverHtml = '' +
                '                <img src="' + item.url + '" width="100%"/>';
        } else {
            typeCoverHtml = '' +
                '                <a target="_blank" href="' + item.url + '">下载</a>';
        }
        let html = '<div class="card box-container">' +
            '            <div class="box-author" >' +
            (purityMode?'':
            '                <img class="box-avatar" src="' + item.authorAvatar + '"/>' +
            '                <div class="box-nickname active" onclick="openInNewTab(\'' + item.authorHome + '\')">' +
            '                   ' + item.authorName + ' ' +
            '                </div>' 
            )+
            '                <div class="btn-download downloadClass" url="' + item.url + '" name="' + item.filename + '">' +
            '                    下载' +
            '                </div>' +
            '            </div>' +
            '            <div class="box-title">' +
            '                <a target="_blank" href="' + item.url + '">' +
            '                    ' + item.title + '' +
            '                </a>' +
            '            </div>' +
            (purityMode?'':
            '            <div class="box-cover">' +
            typeCoverHtml +
            '            </div>' 
            ) +
            '        </div>';

        $("#content").append(html);
    }
}

// 注册回调，每一个http请求响应后，都触发该回调
chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
    if (!$("#ckbFilter").prop('checked')) {
        return;
    }

    const [{
        // 请求的类型，查询参数，以及url
        request: {method, queryString, url, headers: requestHeaders},

        // 响应的类型
        response: {status, headers: responseHeader},

        // 该方法可用于获取响应体
        getContent,
    }] = args;

    let enableSuffixCatch = $("#ckbSpySuffixType").prop('checked');

    let commonList = [];
    if ($("#ckbSpyVideo").prop('checked')) {
        let obj = parseCommonResources(url, responseHeader,
            enableSuffixCatch
                ? ['.mp4', '.mkv',
                    '.rmvb', '.rmv',
                    '.flv', '.m3u8']
                : [],
            ['video']);
        if (obj.url) {
            obj.type = 'video';
            if (!obj.title || obj.title == '') {
                obj.title = 'download.mp4';
            }
            commonList.push(obj);
        }
    }

    if ($("#ckbSpyAudio").prop('checked')) {
        let obj = parseCommonResources(url, responseHeader,
            enableSuffixCatch
                ? ['.aac', '.mp3', '.wav', '.ogg']
                : [],
            ['audio']);
        if (obj.url) {
            obj.type = 'audio';
            if (!obj.title || obj.title == '') {
                obj.title = 'download.mp3';
            }
            commonList.push(obj);
        }
    }

    if ($("#ckbSpyPicture").prop('checked')) {
        let obj = parseCommonResources(url, responseHeader,
            enableSuffixCatch
                ? ['.png', '.jpg', '.gif',
                    '.jpeg', '.bmp', '.webp']
                : [],
            ['image']);
        if (obj.url) {
            obj.type = 'image';
            if (!obj.title || obj.title == '') {
                obj.title = 'download.jpg';
            }
            commonList.push(obj);
        }
    }


    if ($("#ckbSpyDoc").prop('checked')) {
        let obj = parseCommonResources(url, responseHeader,
            enableSuffixCatch
                ? ['.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx', '.wps',
                    '.zip', '.7z', '.tar', '.gz', '.tgz', '.rar'
                    , '.exe', '.apk']
                : [],
            ['msword', 'ms-word',
                'msexcel', 'ms-excel',
                'mspowerpoint', 'ms-powerpoint',
                'officedocument',
                'zip', 'tar']);
        if (obj.url) {
            obj.type = 'doc';
            if (!obj.title || obj.title == '') {
                obj.title = 'download.doc';
            }
            commonList.push(obj);
        }
    }

    if (commonList.length > 0) {
        mergeIntoList(commonList, contentList);

        renderVideos(contentList);

        $('.downloadClass').click(function () {
            download($(this).attr('url'), $(this).attr('name'));
        })

        refreshCount();
    }

    // 将callback转为await promise
    // warn: content在getContent回调函数中，而不是getContent的返回值
    const content = await new Promise((res, rej) => getContent(res));


    if (!content || "" == content) {
        log('illegal content');
        return;
    }

    let respObj = null;
    try {
        respObj = JSON.parse(content);
    } catch (e) {

    }
    if (!respObj) {
        return;
    }

    try {
        responseBodyMatcher(url, responseHeader, respObj)
    } catch (e) {
        log(e.stack);
    }


    try {
        let tiktokList = parseTiktokVideo(url, responseHeader, respObj);
        mergeIntoList(tiktokList, contentList);
    } catch (e) {
        log(e.stack);
    }

    try {
        let toutiaoList = parseToutiaoVideo(url, responseHeader, respObj);
        mergeIntoList(toutiaoList, contentList);
    } catch (e) {
        log(e.stack);
    }

    try {
        let weiboList = parseWeiboVideo(url, responseHeader, respObj);
        mergeIntoList(weiboList, contentList);
    } catch (e) {
        log(e.stack);
    }

    try {
        let kuaisouList = parseKuaishouVideo(url, responseHeader, respObj);
        mergeIntoList(kuaisouList, contentList)
    } catch (e) {
        log(e.stack);
    }

    try {
        let kuaisouLikeList = parseKuaishouLikeVideo(url, responseHeader, respObj);
        mergeIntoList(kuaisouLikeList, contentList)
    } catch (e) {
        log(e.stack);
    }

    renderVideos(contentList);

    $('.downloadClass').click(function () {
        download($(this).attr('url'), $(this).attr('name'));
    })

    refreshCount();
});

