/**
 * help use vue2 in multi-page-application website<br/>
 * this could improve coding style & structure<br/>
 * bring out simplify , purify vue code like vue-cli<br/>
 * but also, it has some restrict with it<br/>
 * such as, could not use 'import' and 'export' segments for process other modules<br/>
 * only support use 'export default' to  export default vue component(or instance)<br/>
 * so that, import other modules must by global '<script>' in html<br/>
 * <hr>
 * this is a <b>comp.vue</b> file
 * <pre>
 * <template>
 *   <div class="comp">
 *     {{message}}
 *   </div>
 * </template>
 *
 * <header>
 *   <title>vue2-loader</title>
 * </header>
 *
 * <script>
 * export default {
 *   name: "comp",
 *   data(){
 *     return {
 *       message: 'xxx',
 *       timer:null
 *     }
 *   },
 *   mounted(){
 *     this.timer=setInterval(()=>{
 *       this.message=new Date()+''
 *     },1000)
 *   },
 *   destroyed(){
 *     clearInterval(this.timer)
 *   }
 * }
 * </script>
 *
 * <style>
 * .comp{
 *   color: red;
 * }
 * .--this span{
 *  color: #444;
 * }
 * </style>
 * </pre>
 *
 * <hr/>
 * this is a <b>comp.html</b> file
 * <pre>
 * <!DOCTYPE html>
 * <html>
 * <head>
 *     <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
 *     <!-- <script src="./vue@2_dist_vue.js"></script> -->
 *     <title>vue2</title>
 *     <script src="./vue2-loader.js"></script>
 *
 * </head>
 * <body>
 *
 * </body>
 * <script>
 *     Vue2Loader.setupVueApp({
 *         url:'./comp.vue'
 *     })
 *
 * </script>
 * <style>
 *
 * </style>
 * </html>
 * </pre>
 *
 * <hr/>
 * now, you got an vue page <b>comp.html</b>,and could be view it in browser<br/>
 * but also, if you want view page in local file, <br/>
 * you must use <b>vue2-converter.js</b> to convert as local <b>cros-origin</b> support format(jsonp)<br/>
 * or direct use <b>convertor.html</b> to complete this work.<br/>
 * 
 * @return {Vue2Loader}
 * @constructor {Vue2Loader}
 */
function Vue2Loader() {

}

/**
 *
 * @type {DOMParser}
 */
Vue2Loader.parser = new DOMParser()

/**
 *
 * @param html {string}
 * @return {Document}
 */
Vue2Loader.parseHtmlDom = function (html) {
    return Vue2Loader.parser.parseFromString(html, "text/html")
}

/**
 * use random number as uuid
 * this is uuid-3 implements
 * @return {string}
 */
Vue2Loader.randomUUID = function () {
    let ret = ''
    let codes = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < 32; i++) {
        let num = Math.floor(Math.random() * codes.length)
        ret += codes.charAt(num)
    }
    return ret
}

/**
 *
 * @param html {string}
 * @return {{template: string, varName: string, header: string, style: string, script: string}}
 */
Vue2Loader.parseVueTemplate = function (html) {
    const doc = Vue2Loader.parseHtmlDom(html)
    let template = doc.querySelector('template')
    if (template) {
        template = template.innerHTML
    } else {
        template = ''
    }
    let className = 'vue-scoped-style-' + Vue2Loader.randomUUID().toLowerCase()
    let dom = Vue2Loader.parseHtmlDom('<html><head></head><body>' + template + '</body></html>')
    let body = dom.body
    let root = body.firstElementChild
    if (root) {
        root.className = root.className + ' ' + className
        template = body.innerHTML
    }

    let script = doc.querySelector('script')
    if (script) {
        script = script.innerHTML
    } else {
        script = ''
    }
    let varName = 'vue_conf_' + Vue2Loader.randomUUID()
    script = script.replace(/export\s+default\s+\{/, 'let ' + varName + ' = {')


    let style = doc.querySelector('style')
    if (style) {
        style = style.innerHTML
    } else {
        style = ''
    }
    style = style.split('.--this').join(('.' + className))

    let header = doc.querySelector('header')
    if (header) {
        header = header.innerHTML
    } else {
        header = ''
    }

    return {
        template: template,
        script: script,
        style: style,
        header: header,
        varName: varName
    }
}

/**
 *
 * @param parent {HTMLElement}
 * @param child {HTMLElement}
 */
Vue2Loader.domAppend = function (parent, child) {
    try {
        parent.append(child)
    } catch (e) {
        parent.appendChild(child)
    }
}

/**
 *
 * @param dom {HTMLElement}
 */
Vue2Loader.domRemove = function (dom) {
    try {
        dom.remove()
    } catch (e) {
        dom.parentNode.removeChild(dom)
    }
}

/**
 *
 * @param elemId {string}
 * @param tagName {string}
 * @param parent {HTMLElement}
 * @return {HTMLElement}
 */
Vue2Loader.domGetOrCreate = function (elemId, tagName, parent) {
    if (!tagName) {
        tagName = 'div'
    }
    if (!parent) {
        parent = document.body
    }
    let dom = document.querySelector('#' + elemId);
    if (!dom) {
        dom = document.createElement(tagName);
        dom.id = elemId
        Vue2Loader.domAppend(parent, dom)
    }
    return dom
}

/**
 *
 * @param dom {HTMLElement}
 * @param html {string}
 */
Vue2Loader.domSetInnerHtml = function (dom, html) {
    try {
        dom.innerHTML = html
    } catch (e) {
        dom.innerText = html
    }
}

/**
 *
 * @param url {string}
 * @param options {Object}
 * @returns {Promise<Object>}
 */
Vue2Loader.fetchXhr=function(url,options){
    if(!options){
        options={}
    }
    if(!options.method){
        options.method='get'
    }
    if(!options.responseType){
        options.responseType='text'
    }
    return new Promise(function(resolve,reject){
        let xhr = new XMLHttpRequest();
        xhr.open(options.method,url);
        xhr.responseType = options.responseType
        xhr.onload = function(event){
            if(this.status===200){
                resolve(this.response)
            }else{
                reject({
                    status: this.status,
                    statusText: this.statusText
                })
            }
        }
        xhr.send()
    })
}

/**
 * load an url content by iframe pre tag
 * @param url {string}
 * @return {Promise<string>}
 */
Vue2Loader.fetchIframe = function (url) {
    return new Promise(function (resolve, reject) {
        let frameId = 'vue_frame_' + Vue2Loader.randomUUID().toLocaleLowerCase()
        let frameDom = Vue2Loader.domGetOrCreate(frameId, 'iframe', document.body)
        frameDom.style.display = 'none'
        frameDom.style.width = '0px'
        frameDom.style.height = '0px'
        frameDom.onload = function () {
            try {
                let frameDoc = frameDom.contentDocument || frameDom.contentWindow.document
                let pre = frameDoc.querySelector('body pre')
                let text = pre.innerText
                resolve({
                    ok: true,
                    json: function () {
                        return Promise.resolve(text)
                    },
                    text: function () {
                        return Promise.resolve(text)
                    },
                })
            } catch (e) {
                reject(e)
            }
            setTimeout(function () {
                Vue2Loader.domRemove(frameDom)
            }, 300)
        }
        frameDom.onerror = function (event, source, lineno, colno, error) {
            reject({
                event: event,
                source: source,
                lineno: lineno,
                colno: colno,
                error: error
            })
            setTimeout(function () {
                Vue2Loader.domRemove(frameDom)
            }, 300)
        }
        frameDom.src = url
    })
}

/**
 * load an url content by jsonp
 * @param url {string}
 * @param options {object|null}
 * @return {Promise<Object>}
 */
Vue2Loader.fetchJsonp = function (url, options) {
    if (!options) {
        options = {}
    }
    return new Promise(function (resolve, reject) {
        let callbackFunctionName = options.callbackFunctionName || 'jsonp_callback'
        if (options.randomCallbackFunctionName) {
            callbackFunctionName = callbackFunctionName + '_' + Vue2Loader.randomUUID()
        }
        window[callbackFunctionName] = function (response) {
            resolve({
                ok: true,
                json: function () {
                    return Promise.resolve(response)
                },
                text: function () {
                    return Promise.resolve(response)
                },
            })
        }

        let src = url + ''
        if (src.indexOf('?') >= 0) {
            src += '&'
        } else {
            src += '?'
        }
        src += 'jsonp_callback=' + callbackFunctionName

        let jsonpScriptId = 'jsonp_script_' + Vue2Loader.randomUUID()
        let scriptDom = document.createElement('script')
        scriptDom.id = jsonpScriptId
        scriptDom.src = src
        scriptDom.charset = 'UTF-8'
        scriptDom.nonce = jsonpScriptId
        if (options.referrerPolicy) {
            scriptDom.referrerPolicy = options.referrerPolicy // 'same-origin'
        }
        if (options.crossOrigin) {
            scriptDom.crossOrigin = options.crossOrigin // 'true'
        }

        scriptDom.onerror = function (event, source, lineno, colno, error) {
            reject({
                event: event,
                source: source,
                lineno: lineno,
                colno: colno,
                error: error
            })
        }

        Vue2Loader.domAppend(document.body, scriptDom)

        let timeout = options.timeout || -1

        setTimeout(function () {
            if (timeout > 0) {
                reject(new Error('fetch jsonp timeout of ' + timeout + '!'))
            }
            Vue2Loader.domRemove(scriptDom)
        }, timeout > 0 ? timeout : 1500)
    })
}

/**
 *
 * @param url {string}
 * @return {Promise<string>}
 */
Vue2Loader.fetchUrl = function (url) {
    if(url){
        let idx=url.lastIndexOf('?')
        if(idx>=0){
            url=url+'&'
        }else{
            url=url+'?'
        }
        // 允许30s的缓存
        url=url+'_tc='+Math.floor(new Date().getTime()/1000/30)
    }
    // fetch resource chain
    return Promise.reject({
        ok: false,
        value: undefined
    })
        .catch(function (err) {
            // use fetch
            let href = url
            if ((typeof fetch) !== 'undefined') {
                return fetch(href, {
                    mode: 'no-cors'
                }).then(function (res) {
                    return res.text()
                }).then(function (text) {
                    if (!text || text == '') {
                        return Promise.reject({
                            ok: true,
                            value: text
                        })
                    }
                    return text
                })
            } else {
                if(err.ok===true){
                    return Promise.reject(err)
                }else{
                    return Promise.reject({
                        ok: false,
                        value: undefined
                    })
                }
            }
        })
        .catch(function (err) {
            // use xhr
            let href = url
            if ((typeof XMLHttpRequest) !== 'undefined') {
                return Vue2Loader.fetchXhr(href)
                    .then(function (text) {
                    if (!text || text == '') {
                        return Promise.reject({
                            ok: true,
                            value: text
                        })
                    }
                    return text
                })
            } else {
                if(err.ok===true){
                    return Promise.reject(err)
                }else{
                    return Promise.reject({
                        ok: false,
                        value: undefined
                    })
                }
            }
        })
        .catch(function (err) {
            // use axios
            let href = url
            if ((typeof axios) !== 'undefined') {
                return axios({
                    url: href,
                    method: 'get',
                    responseType: 'text'
                }).then(function (res) {
                    let text = res.data
                    if (!text || text == '') {
                        return Promise.reject({
                            ok: true,
                            value: text
                        })
                    }
                    return text
                })
            } else {
                if(err.ok===true){
                    return Promise.reject(err)
                }else{
                    return Promise.reject({
                        ok: false,
                        value: undefined
                    })
                }
            }
        }).catch(function (err) {
            // use jsonp
            let href = url
            if (window.location.protocol === 'file:') {
                let idx = href.lastIndexOf('?')
                if (idx >= 0) {
                    href = href.substring(0, idx) + '.jsonp.js' + href.substring(idx)
                } else {
                    href = href + '.jsonp.js'
                }
                return Vue2Loader.fetchJsonp(href)
                    .then(function (res) {
                        return res.text()
                    }).then(function (text) {
                        if (!text || text == '') {
                            return Promise.reject({
                                ok: true,
                                value: text
                            })
                        }
                        return text
                    })
            } else {
                if(err.ok===true){
                    return Promise.reject(err)
                }else{
                    return Promise.reject({
                        ok: false,
                        value: undefined
                    })
                }
            }
        }).catch(function (err) {
            // use iframe
            let href = url
            let idx = href.lastIndexOf('?')
            if (idx >= 0) {
                href = href.substring(0, idx) + '.iframe.txt' + href.substring(idx)
            } else {
                href = href + '.iframe.txt'
            }
            return Vue2Loader.fetchIframe(href)
                .then(function (res) {
                    return res.text()
                }).then(function (text) {
                    if (!text || text == '') {
                        return Promise.reject({
                            ok: true,
                            value: text
                        })
                    }
                    return text
                }).catch(function(innerErr){
                    if(err.ok===true){
                        return Promise.reject(err)
                    }else{
                        return Promise.reject({
                            ok: false,
                            value: undefined
                        })
                    }
                })
        }).catch(function (err) {
            // process possible value
            if(err.ok===true){
                return Promise.resolve(err.value)
            }else{
                return Promise.reject(err)
            }
        })

}

/**
 *
 * @param mixins {string[]}
 * @param mixinVarName {string|null}
 * @return {Promise<mixinVarName>}
 */
Vue2Loader.loadMixins = function (mixins, mixinVarName) {
    if (!mixins) {
        mixins = []
    }
    if (!mixinVarName) {
        mixinVarName = 'vue_mixins_' + Vue2Loader.randomUUID()
    }
    window[mixinVarName] = []
    let mixinList = []
    if (mixins) {
        for (let i = 0; i < mixins.length; i++) {
            let item = mixins[i]
            if (!item) {
                continue
            }
            if (item.url) {
                mixinList.push(Vue2Loader.loadObject(item.url))
            } else {
                mixinList.push(Vue2Loader.loadObject(item))
            }
        }
    }
    return Promise.all(mixinList)
        .then(function (vueMixins) {
            for (let i = 0; i < vueMixins.length; i++) {
                let item = vueMixins[i];
                if (item) {
                    window[mixinVarName].push(item)
                }
            }
            return mixinVarName
        })
}

/**
 *
 * @param vueOptions {Object} vue options
 * @param elemId {string} element id
 * @param mixinVarName {string} mixins variable name
 * @param vueAppVarName {string} vue app variable name
 */
Vue2Loader.initVueApp = function (vueOptions,
                                  elemId,
                                  mixinVarName,
                                  vueAppVarName) {
    if (!elemId) {
        elemId = 'app'
    }
    vueOptions.el = '#' + elemId
    if (window[mixinVarName]) {
        vueOptions.mixins = window[mixinVarName]
    }
    if (vueOptions.title && vueOptions.title != '') {
        document.title = vueOptions.title
    }
    window[vueAppVarName] = new Vue(vueOptions)
}

/**
 *
 * @param vueOptions {Object} vue options
 * @param componentName {string} component name
 * @param templateElemId {string} component template dom id
 * @param mixinVarName {string} mixins variable name
 * @param vueCompVarName {string} vue component variable name
 */
Vue2Loader.initVueComponent = function (vueOptions,
                                        componentName,
                                        templateElemId,
                                        mixinVarName,
                                        vueCompVarName) {
    let templateDom = document.querySelector('#vue_component_' + templateElemId)
    vueOptions.name = componentName
    if (window[mixinVarName]) {
        vueOptions.mixins = window[mixinVarName]
    }
    vueOptions.template = templateDom.innerHTML
    Vue.component(componentName, vueOptions)
    window[vueCompVarName] = vueOptions
}

/**
 *
 * @param header {string} html of head segment
 */
Vue2Loader.appendHeader = function (header) {
    if (header && header != '') {
        document.head.innerHTML = document.head.innerHTML + header
        let arr = document.head.querySelectorAll('title')
        for (let i = 0; i < arr.length; i++) {
            if (i != arr.length - 1) {
                Vue2Loader.domRemove(arr[i])
            }
        }
    }
}

/**
 * mixins=[
 *         {
 *             url: './test.js'
 *         },
 *         './hello.js'
 *     ]
 * @param url {string}
 * @param appId {string|null}
 * @param mixins {string[]|null}
 * @return {Promise<string>}
 */
Vue2Loader.createApp = function (url, appId, mixins) {
    if (!appId) {
        appId = 'app'
    }
    if (!mixins) {
        mixins = []
    }
    return Vue2Loader.loadMixins(mixins)
        .then(function (mixinVarName) {
            return Vue2Loader.fetchUrl(url).then(function (vueHtml) {
                return {
                    mixinVarName: mixinVarName,
                    vueHtml: vueHtml
                }
            })
        })
        .then(function (args) {
            const mixinVarName = args.mixinVarName;
            const vueHtml = args.vueHtml;

            const vueTemplate = Vue2Loader.parseVueTemplate(vueHtml);

            Vue2Loader.appendHeader(vueTemplate.header)

            let appDom = Vue2Loader.domGetOrCreate(appId, 'div', document.body)
            Vue2Loader.domSetInnerHtml(appDom, vueTemplate.template)


            let styleDom = Vue2Loader.domGetOrCreate('vue_style_' + appId, 'style', document.head)
            Vue2Loader.domSetInnerHtml(styleDom, vueTemplate.style)

            let vueAppVarName = 'vue_app_' + vueTemplate.varName
            let script = vueTemplate.script
            script += '\n'
            script += 'Vue2Loader.initVueApp(' + vueTemplate.varName + ',"' + appId + '","' + mixinVarName + '","' + vueAppVarName + '")\n'

            let scriptDom = Vue2Loader.domGetOrCreate('vue_script_' + appId, 'script', document.body);
            scriptDom.type = 'text/javascript'
            Vue2Loader.domSetInnerHtml(scriptDom, script)

            return new Promise(function (resolve, reject) {
                let spyAppSetupCall = function () {
                    if (window[vueAppVarName]) {
                        resolve(window[vueAppVarName])
                        setTimeout(function () {
                            delete window[mixinVarName]
                            Vue2Loader.domRemove(scriptDom)
                        }, 300)
                    } else {
                        setTimeout(spyAppSetupCall, 30)
                    }
                }
                setTimeout(spyAppSetupCall, 30)
            })
        })
}

/**
 *
 * @return {{pagePath: string, pageName: string}}
 */
Vue2Loader.parseCurrentPageInfo = function () {
    let path = window.location.pathname
    let app = 'index'
    let idx = path.lastIndexOf('/')
    if (idx >= 0) {
        app = path.substring(idx + 1)
        path = path.substring(0, idx)
    }
    idx = app.lastIndexOf(".")
    if (idx >= 0) {
        app = app.substring(0, idx)
    }
    if (!app || app == '') {
        app = 'index'
    }
    return {
        pagePath: path,
        pageName: app
    }
}

/**
 * @return {void}
 */
Vue2Loader.loadDefaultResources = function () {
    let info = Vue2Loader.parseCurrentPageInfo();
    document.write(
        '<script type="text/javascript" src="' + info.pagePath + '/' + info.pageName + '.js" charset="utf-8"></script>'
    );
    document.write('<link rel="stylesheet" href="' + info.pagePath + '/' + info.pageName + '.css">');

    document.write(
        '<script type="text/javascript" src="' + info.pagePath + '/' + 'index.js" charset="utf-8"></script>'
    );
    document.write('<link rel="stylesheet" href="' + info.pagePath + '/' + 'index.css">');

}

/**
 * mixins=[
 *         {
 *             url: './test.js'
 *         },
 *         './hello.js'
 *     ]
 * @param appId {string|null}
 * @param mixins {string[]|null}
 * @return {Promise<string>}
 */
Vue2Loader.createDefaultApp = function (appId, mixins) {
    if (!appId) {
        appId = 'app'
    }
    if (!mixins) {
        mixins = []
    }
    let info = Vue2Loader.parseCurrentPageInfo();
    let fullAppUrl = info.pagePath + '/' + info.pageName + '.vue'
    return Vue2Loader.createApp(fullAppUrl, appId, mixins)
}

/**
 * mixins=[
 *         {
 *             url: './test.js'
 *         },
 *         './hello.js'
 *     ]
 * @param url {string}
 * @param componentName {string}
 * @param mixins {string[]|null}
 * @return {Promise<string>}
 */
Vue2Loader.createComponent = function (url, componentName, mixins) {
    if (!componentName) {
        componentName = url
        let idx = componentName.lastIndexOf('/')
        if (idx >= 0) {
            componentName = componentName.substring(idx + 1)
        }
        idx = componentName.lastIndexOf('.vue')
        if (idx >= 0) {
            componentName = componentName.substring(0, idx)
        }
    }
    if (!mixins) {
        mixins = []
    }
    let appId = componentName + '_' + Vue2Loader.randomUUID()
    return Vue2Loader.loadMixins(mixins)
        .then(function (mixinVarName) {
            return Vue2Loader.fetchUrl(url).then(function (vueHtml) {
                return {
                    mixinVarName: mixinVarName,
                    vueHtml: vueHtml
                }
            })
        })
        .then(function (args) {
            const mixinVarName = args.mixinVarName;
            const vueHtml = args.vueHtml;
            const vueTemplate = Vue2Loader.parseVueTemplate(vueHtml);

            Vue2Loader.appendHeader(vueTemplate.header)

            let appDom = Vue2Loader.domGetOrCreate('vue_component_' + appId, 'div', document.body);
            appDom.style.display = 'none'
            appDom.style.height = '0px'
            appDom.style.width = '0px'
            Vue2Loader.domSetInnerHtml(appDom, vueTemplate.template)


            let styleDom = Vue2Loader.domGetOrCreate('vue_component_style_' + appId, 'style', document.body);
            Vue2Loader.domSetInnerHtml(styleDom, vueTemplate.style)


            let vueCompVarName = 'vue_comp_' + vueTemplate.varName
            let script = vueTemplate.script
            script += '\n'
            script += 'Vue2Loader.initVueComponent(' + vueTemplate.varName + ',"' + componentName + '","' + appId + '","' + mixinVarName + '","' + vueCompVarName + '")\n'

            let scriptDom = Vue2Loader.domGetOrCreate('vue_component_script_' + appId, 'script', document.body);
            scriptDom.type = 'text/javascript'
            Vue2Loader.domSetInnerHtml(scriptDom, script)

            let spyCompSetupCall = function () {
                if (window[vueCompVarName]) {
                    Vue2Loader.domRemove(scriptDom)
                    Vue2Loader.domRemove(appDom)
                    setTimeout(function () {
                        delete window[mixinVarName]
                        delete window[vueCompVarName]
                    }, 300)
                } else {
                    setTimeout(spyCompSetupCall, 30)
                }
            }
            setTimeout(spyCompSetupCall, 30)

            return appId
        })
        .catch(function (error) {
            return Promise.resolve(appId)
        })

}

/**
 *
 * @param url {string}
 * @return {Promise<Object | null>}
 */
Vue2Loader.loadObject = function (url) {
    return Vue2Loader.fetchUrl(url)
        .then(function (script) {
            let varName = 'js_obj_' + Vue2Loader.randomUUID()
            script = script.replace(/export\s+default\s+\{/, 'window.' + varName + ' = {')
            let scriptDom = Vue2Loader.domGetOrCreate('js_obj_script_' + varName, 'script', document.body);
            scriptDom.type = 'text/javascript'
            Vue2Loader.domSetInnerHtml(scriptDom, script)
            return new Promise(function (resolve, reject) {
                let spyAppSetupCall = function () {
                    if (window[varName]) {
                        resolve(window[varName])
                        setTimeout(function () {
                            delete window[varName]
                            Vue2Loader.domRemove(scriptDom)
                        }, 500)
                    } else {
                        setTimeout(spyAppSetupCall, 30)
                    }
                }
                setTimeout(spyAppSetupCall, 30)
            })
        }).catch(function (err) {
            return Promise.resolve(null)
        })
}

/**
 * config={
 *     url: './app.vue',
 *     appId: 'app',
 *     components:[
 *         {
 *             url: './comp.vue',
 *             name: 'comp'
 *         },
 *         {
 *             url: './test.vue'
 *         },
 *         './hello.vue'
 *     ],
 *     mixins:[
 *         {
 *             url: './test.js'
 *         },
 *         './hello.js'
 *     ]
 * }
 * @param config {object}
 * @return {Promise<string>}
 */
Vue2Loader.setupVueApp = function (config) {
    if (!config) {
        config = {}
    }
    let components = []
    if (config.components) {
        for (let i = 0; i < config.components.length; i++) {
            let item = config.components[i]
            if (!item) {
                continue
            }
            if (item.url) {
                components.push(Vue2Loader.createComponent(item.url, item.name))
            } else {
                components.push(Vue2Loader.createComponent(item))
            }
        }
    }
    return Promise.all(components)
        .then(function () {
            if (!config.url || config.url == '') {
                return Vue2Loader.createDefaultApp(config.appId, config.mixins)
            } else {
                return Vue2Loader.createApp(config.url, config.appId, config.mixins)
            }
        })
}
