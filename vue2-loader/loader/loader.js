/**
 *
 * @return {Loader}
 * @constructor {Loader}
 */
function Loader() {

}

/**
 *
 * @type {DOMParser}
 */
Loader.parser = new DOMParser()

/**
 *
 * @param html {string}
 * @return {Document}
 */
Loader.parseHtmlDom = function (html) {
    return Loader.parser.parseFromString(html, "text/html")
}

/**
 * use random number as uuid
 * this is uuid-3 implements
 * @return {string}
 */
Loader.randomUUID = function () {
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
 * @param parent {HTMLElement}
 * @param child {HTMLElement}
 */
Loader.domAppend = function (parent, child) {
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
Loader.domRemove = function (dom) {
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
Loader.domGetOrCreate = function (elemId, tagName, parent) {
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
        Loader.domAppend(parent, dom)
    }
    return dom
}

/**
 *
 * @param dom {HTMLElement}
 * @param html {string}
 */
Loader.domSetInnerHtml = function (dom, html) {
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
Loader.fetchXhr = function (url, options) {
    if (!options) {
        options = {}
    }
    if (!options.method) {
        options.method = 'get'
    }
    if (!options.responseType) {
        options.responseType = 'text'
    }
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(options.method, url);
        xhr.responseType = options.responseType
        xhr.onload = function (event) {
            if (this.status === 200) {
                resolve(this.response)
            } else {
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
Loader.fetchIframe = function (url) {
    return new Promise(function (resolve, reject) {
        let frameId = 'vue_frame_' + Loader.randomUUID().toLocaleLowerCase()
        let frameDom = Loader.domGetOrCreate(frameId, 'iframe', document.body)
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
                Loader.domRemove(frameDom)
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
                Loader.domRemove(frameDom)
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
Loader.fetchJsonp = function (url, options) {
    if (!options) {
        options = {}
    }
    return new Promise(function (resolve, reject) {
        let callbackFunctionName = options.callbackFunctionName || 'jsonp_callback'
        if (options.randomCallbackFunctionName) {
            callbackFunctionName = callbackFunctionName + '_' + Loader.randomUUID()
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

        let jsonpScriptId = 'jsonp_script_' + Loader.randomUUID()
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

        Loader.domAppend(document.body, scriptDom)

        let timeout = options.timeout || -1

        setTimeout(function () {
            if (timeout > 0) {
                reject(new Error('fetch jsonp timeout of ' + timeout + '!'))
            }
            Loader.domRemove(scriptDom)
        }, timeout > 0 ? timeout : 1500)
    })
}

/**
 *
 * @param url {string}
 * @return {Promise<string>}
 */
Loader.fetchUrl = function (url) {
    if (url) {
        let idx = url.lastIndexOf('?')
        if (idx >= 0) {
            url = url + '&'
        } else {
            url = url + '?'
        }
        // 允许30s的缓存
        url = url + '_tc=' + Math.floor(new Date().getTime() / 1000 / 30)
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
                if (err.ok === true) {
                    return Promise.reject(err)
                } else {
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
                return Loader.fetchXhr(href)
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
                if (err.ok === true) {
                    return Promise.reject(err)
                } else {
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
                if (err.ok === true) {
                    return Promise.reject(err)
                } else {
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
                return Loader.fetchJsonp(href)
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
                if (err.ok === true) {
                    return Promise.reject(err)
                } else {
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
            return Loader.fetchIframe(href)
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
                }).catch(function (innerErr) {
                    if (err.ok === true) {
                        return Promise.reject(err)
                    } else {
                        return Promise.reject({
                            ok: false,
                            value: undefined
                        })
                    }
                })
        }).catch(function (err) {
            // process possible value
            if (err.ok === true) {
                return Promise.resolve(err.value)
            } else {
                return Promise.reject(err)
            }
        })

}

/**
 *
 * @param header {string} html of head segment
 */
Loader.appendHeader = function (header) {
    if (header && header != '') {
        document.head.innerHTML = document.head.innerHTML + header
        let arr = document.head.querySelectorAll('title')
        for (let i = 0; i < arr.length; i++) {
            if (i != arr.length - 1) {
                Loader.domRemove(arr[i])
            }
        }
    }
}

/**
 *
 * @param url {string}
 * @return {Promise<Object | null>}
 */
Loader.loadObject = function (url) {
    return Loader.fetchUrl(url)
        .then(function (script) {
            let varName = 'js_obj_' + Loader.randomUUID()
            script = script.replace(/export\s+default\s+\{/, 'window.' + varName + ' = {')
            let scriptDom = Loader.domGetOrCreate('js_obj_script_' + varName, 'script', document.body);
            scriptDom.type = 'text/javascript'
            Loader.domSetInnerHtml(scriptDom, script)
            return new Promise(function (resolve, reject) {
                let spyAppSetupCall = function () {
                    if (window[varName]) {
                        resolve(window[varName])
                        setTimeout(function () {
                            delete window[varName]
                            Loader.domRemove(scriptDom)
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
 *
 * @param html {string}
 * @return {{template: string, varName: string, header: string, style: string, script: string}}
 */
Loader.parseVueTemplate = function (html) {
    const doc = Loader.parseHtmlDom(html)
    let template = doc.querySelector('template')
    if (template) {
        template = template.innerHTML
    } else {
        template = ''
    }
    let className = 'vue-scoped-style-' + Loader.randomUUID().toLowerCase()
    let dom = Loader.parseHtmlDom('<html><head></head><body>' + template + '</body></html>')
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
    let varName = 'vue_conf_' + Loader.randomUUID()
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

Loader.loadVueOptions = function (url) {
    let appId = 'vue_' + Loader.randomUUID()
    return new Promise((resolve, reject) => {
        Loader.fetchUrl(url)
            .then(html => {
                let vueTemplate = Loader.parseVueTemplate(html)
                let appDom = Loader.domGetOrCreate('vue_component_' + appId, 'div', document.body);
                appDom.style.display = 'none'
                appDom.style.height = '0px'
                appDom.style.width = '0px'
                Loader.domSetInnerHtml(appDom, vueTemplate.template)


                let styleDom = Loader.domGetOrCreate('vue_component_style_' + appId, 'style', document.body);
                Loader.domSetInnerHtml(styleDom, vueTemplate.style)


                let vueCompVarName = 'vue_comp_' + vueTemplate.varName
                let script = vueTemplate.script
                script += '\n'
                script += 'Loader.evalVueComponent(' + vueTemplate.varName + ',"' + appId + '","' + vueCompVarName + '")\n'

                let scriptDom = Loader.domGetOrCreate('vue_component_script_' + appId, 'script', document.body);
                scriptDom.type = 'text/javascript'
                Loader.domSetInnerHtml(scriptDom, script)

                let spyCompSetupCall = function () {
                    if (window[vueCompVarName]) {
                        Loader.domRemove(scriptDom)
                        Loader.domRemove(appDom)
                        resolve(window[vueCompVarName])
                        setTimeout(function () {
                            delete window[vueCompVarName]
                        }, 300)
                    } else {
                        setTimeout(spyCompSetupCall, 30)
                    }
                }
                setTimeout(spyCompSetupCall, 30)
            }).catch(error => {
                reject(error)
            })
    })

}

Loader.evalVueComponent = function (vueOptions,
                                    templateElemId,
                                    vueCompVarName) {
    let templateDom = document.querySelector('#vue_component_' + templateElemId)
    if(templateDom){
        vueOptions.template = templateDom.innerHTML
    }
    window[vueCompVarName] = vueOptions
}

Loader.loadVueComponent=function(url){
    return new Promise((resolve, reject)=>{
        Loader.loadVueOptions(url)
            .then(vueOptions=>{
                resolve(Vue.extend(vueOptions))
            }).catch(error=>{
                reject(error)
        })
    })
}

/**
 * 使用.vue文件创建网页
 * 支持简单的.vue文件内容
 * template,script,style
 * 区别是，使用相对连接指定components,mixins,directives
 * 具体可参考resolveVueDependency的vueOptions内容
 * @param url
 * @param domSelector
 * @return {Promise<unknown>}
 */
Loader.createVue=function(url,domSelector='#app'){
    return new Promise((resolve, reject)=>{
        Loader.loadVueOptions(url)
            .then(vueOptions=>{
                let nextHref=new URL(url,window.location.href).href
                Loader.resolveVueDependency(vueOptions,nextHref)
                    .then(resolveOptions=>{
                        resolveOptions.el=domSelector
                        let app=new Vue(resolveOptions)
                        resolve(app)
                    }).catch(error=>{
                        vueOptions.el=domSelector
                        let app=new Vue(vueOptions)
                        resolve(app)
                })
            }).catch(error=>{
                reject(error)
        })
    })
}

/**
 * 递归解析VueOptions中的属性
 * 将器加载为真实的对象
 * 处理
 * vueOptions.components
 * vueOptions.mixins
 * vueOptions.directives
 * vueOptions.objects
 * 使用案例:
 * vueOptions={
 *     components:{
 *         test: './test.vue',
 *         comp: './components/comp.vue',
 *         parent: '../parent.vue'
 *     },
 *     mixins:['./common.js','./mixins/list.js'],
 *     directives:{
 *         show: './directives/show.js',
 *         hover: '../common/hover-directive.js'
 *     },
 *     objects:{
 *         rsa: '../util/rsa.js'
 *     },
 *     ...
 *     以下是vue其他的配置,区别是上面这部分的写法
 *     data(){
 *         return {
 *
 *         }
 *     },
 *     mounted(){
 *
 *     },
 *     created(){
 *
 *     },
 *     methods:{
 *
 *     }
 *
 * }
 * @param vueOptions
 * @param baseHref
 * @return {Promise<unknown>}
 */
Loader.resolveVueDependency=function(vueOptions,baseHref){
    let arr=[]
    if(vueOptions.components){
        Object.keys(vueOptions.components).forEach(key=>{
            let value=vueOptions.components[key]
            if(typeof  value === 'string'){
                arr.push(new Promise((res,rej)=>{
                    let nextHref=new URL(value,baseHref).href
                    Loader.loadVueOptions(nextHref)
                        .then(comp=>{
                            Loader.resolveVueDependency(comp,nextHref)
                                .then(comOptions=>{
                                    vueOptions.components[key]=Vue.extend(comOptions)
                                    res(true)
                                }).catch(err=>{
                                vueOptions.components[key]=Vue.extend(comOptions)
                                res(true)
                            })
                        }).catch(err=>{
                        rej(false)
                    })
                }))
            }
        })
    }
    if(vueOptions.mixins){
        for (let i = 0; i < vueOptions.mixins.length; i++) {
            let value=vueOptions.mixins[i]
            if(typeof  value === 'string'){
                arr.push(new Promise((res,rej)=>{
                    let nextHref=new URL(value,baseHref).href
                    Loader.loadObject(nextHref)
                        .then(obj=>{
                            vueOptions.mixins[i]=obj
                            res(true)
                        }).catch(err=>{
                        rej(false)
                    })
                }))
            }
        }
    }
    if(vueOptions.directives){
        Object.keys(vueOptions.directives).forEach(key=>{
            let value=vueOptions.directives[key]
            if(typeof  value === 'string'){
                arr.push(new Promise((res,rej)=>{
                    let nextHref=new URL(value,baseHref).href
                    Loader.loadObject(nextHref)
                        .then(obj=>{
                            vueOptions.directives[key]=obj
                            Vue.directive(key,obj)
                            res(true)
                        }).catch(err=>{
                        rej(false)
                    })
                }))
            }
        })
    }
    if(vueOptions.objects){
        Object.keys(vueOptions.objects).forEach(key=>{
            let value=vueOptions.objects[key]
            if(typeof  value === 'string'){
                arr.push(new Promise((res,rej)=>{
                    let nextHref=new URL(value,baseHref).href
                    Loader.loadObject(nextHref)
                        .then(obj=>{
                            vueOptions.objects[key]=obj
                            res(true)
                        }).catch(err=>{
                        rej(false)
                    })
                }))
            }
        })
    }

    return new Promise((resolve, reject)=>{
        Promise.all(arr)
            .then(all=>{
                resolve(vueOptions)
            }).catch(err=>{
                reject()
        })
    })
}