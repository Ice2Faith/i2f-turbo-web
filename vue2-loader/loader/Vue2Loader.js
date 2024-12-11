/**
 * 用于将.vue文件直接用于多页面的html中
 * 也能够使用.vue文件进行开发，并尽量支持vue的组件，指令，混入等特性
 * 具体使用，请查看Vue2Loader.createVue的注释
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
Vue2Loader.fetchXhr = function (url, options) {
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
                    if (res.status != 200) {
                        return res.text().then(function (text) {
                            return Promise.reject({
                                ok: false,
                                value: text
                            })
                        })
                    }
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
 * 从URL中加载export default {}导出的对象进行返回
 * @param url {string} js导出文件的路径，一般为xxx.js
 * @return {Promise<Object | null>} 导出的对象
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
            console.warn('load object failure!', url)
            return Promise.resolve(null)
        })
}

/**
 * 将.vue文件的文本转换为一个对象
 * 用于后续处理
 * @param html {string} 内容就是.vue文件的文本
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
 * 通过给定的url指定的.vue文件，构建一个包含template的Vue组件options对象
 * @param url vue文件的URL，一般为xxx.vue
 * @returns {Promise<Object>} vue组件的Options,可用于Vue.component(name,options)等场景用于组件注册
 */
Vue2Loader.loadVueOptions = function (url) {
    let appId = 'vue_' + Vue2Loader.randomUUID()
    return new Promise(function (resolve, reject) {
        Vue2Loader.fetchUrl(url)
            .then(function (html) {
                let vueTemplate = Vue2Loader.parseVueTemplate(html)
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
                script += 'Vue2Loader.evalVueComponent(' + vueTemplate.varName + ',"' + appId + '","' + vueCompVarName + '")\n'

                let scriptDom = Vue2Loader.domGetOrCreate('vue_component_script_' + appId, 'script', document.body);
                scriptDom.type = 'text/javascript'
                Vue2Loader.domSetInnerHtml(scriptDom, script)

                let spyCompSetupCall = function () {
                    if (window[vueCompVarName]) {
                        Vue2Loader.domRemove(scriptDom)
                        Vue2Loader.domRemove(appDom)
                        resolve(window[vueCompVarName])
                        setTimeout(function () {
                            delete window[vueCompVarName]
                        }, 300)
                    } else {
                        setTimeout(spyCompSetupCall, 30)
                    }
                }
                setTimeout(spyCompSetupCall, 30)
            }).catch(function (error) {
            console.warn('load vue options failure!', url)
            reject(error)
        })
    })

}

/**
 * 内部使用，
 * 用于将loadVueOptions而来的vue文本转换为一个完整的VueOptions
 * 提供给后续的构建Vue组件等提供帮助
 * 主要是将.vue中template的元素转换为vueOptions.template属性
 * 以便于进行局部注册或者其他使用
 * @param vueOptions 未完善的VueOptions对象，或者.vue文件中export default{}的默认对象
 * @param templateElemId 模版元素ID，临时的ID，需要唯一
 * @param vueCompVarName 全局组件变量名，也是临时的，需要唯一
 */
Vue2Loader.evalVueComponent = function (vueOptions,
                                        templateElemId,
                                        vueCompVarName) {
    let templateDom = document.querySelector('#vue_component_' + templateElemId)
    if (templateDom) {
        vueOptions.template = templateDom.innerHTML
    }
    window[vueCompVarName] = vueOptions
}

/**
 * 通过URL对.vue文件加载处理为一个VueOptions
 * 实际是使用URL中export default {} 的对象作为指定的options
 * Vue.extend(options)
 * @param url 指定的options连接，一般为xxx.vue文件，文件中包含唯一的一个export default {}语法
 * @returns {Promise<Object>} Vue.extend(options)出来的对象
 */
Vue2Loader.loadVueComponent = function (url) {
    return new Promise(function (resolve, reject) {
        Vue2Loader.loadVueOptions(url)
            .then(function (vueOptions) {
                let nextHref = new URL(url, window.location.href).href
                Vue2Loader.resolveVueDependency(vueOptions, nextHref)
                    .then(function (resolveOptions) {
                        let comps = Vue.extend(resolveOptions)
                        resolve(comps)
                    }).catch(function (error) {
                    console.warn('resolve component dependency failure!', nextHref)
                    let comps = Vue.extend(vueOptions)
                    resolve(comps)
                })
            }).catch(function (error) {
            console.warn('load vue component failure!', url)
            reject(error)
        })
    })
}

/**
 * 通过URL将组件componentName全局注册到Vue中
 * 实际是使用URL中export default {} 的对象作为指定的options
 * Vue.component(directiveName,options)
 * @param url 指定的options连接，一般为xxx.vue文件，文件中包含唯一的一个export default {}语法
 * @param componentName 组件名称
 * @returns {Promise<Object>} Vue.component(name,options)出来的对象
 */
Vue2Loader.registryVueComponent = function (url, componentName = null) {
    return new Promise(function (resolve, reject) {
        Vue2Loader.loadVueOptions(url)
            .then(function (vueOptions) {
                let nextHref = new URL(url, window.location.href).href
                Vue2Loader.resolveVueDependency(vueOptions, nextHref)
                    .then(function (resolveOptions) {
                        let comps = Vue.component(componentName || resolveOptions.name, resolveOptions)
                        resolve(comps)
                    }).catch(function (error) {
                    console.warn('registry component dependency failure!', nextHref)
                    let comps = Vue.component(componentName || vueOptions.name, vueOptions)
                    resolve(comps)
                })
            }).catch(function (error) {
            console.warn('registry vue component failure!', url)
            reject(error)
        })
    })
}

/**
 * 通过URL将指令directiveName注册到Vue中
 * 实际是使用URL中export default {} 的对象作为指定的options
 * Vue.directive(directiveName,options)
 * @param url 指定的options连接，一般为xxx.js文件，文件中包含唯一的一个export default {}语法
 * @param directiveName 指令名称
 * @returns {Promise<Object>} Vue.directive(name,options)出来的对象
 */
Vue2Loader.registryVueDirective = function (url, directiveName = null) {
    return new Promise(function (resolve, reject) {
        Vue2Loader.loadVueOptions(url)
            .then(function (vueOptions) {
                let nextHref = new URL(url, window.location.href).href
                Vue2Loader.resolveVueDependency(vueOptions, nextHref)
                    .then(function (resolveOptions) {
                        let comps = Vue.directive(directiveName || resolveOptions.name, resolveOptions)
                        resolve(comps)
                    }).catch(function (error) {
                    console.warn('registry directive dependency failure!', nextHref)
                    let comps = Vue.directive(directiveName || vueOptions.name, vueOptions)
                    resolve(comps)
                })
            }).catch(function (error) {
            console.warn('registry vue directive failure!', url)
            reject(error)
        })
    })
}

/**
 * 使用url指定的.vue文件进行Vue渲染到domId的元素上
 * 使用.vue文件创建网页
 * 支持简单的.vue文件内容
 * template,script,style
 * 区别是，使用相对连接指定components,mixins,directives
 * 具体可参考resolveVueDependency的vueOptions内容
 * 使用案例：
 * test.html
 * ************************************************
 * <!DOCTYPE html>
 * <html>
 * <head>
 *     <meta charset="UTF-8">
 *     <title>vue2</title>
 *     <script src="../vue@2_dist_vue.js"></script>
 *     <script src="../Vue2Loader.js"></script>
 * </head>
 * <body>
 *    <div id="app">
 *    </div>
 * </body>
 * <script>
 *
 * Vue2Loader.createVue('./components/app.vue','#app')
 *
 * </script>
 * <style>
 *
 * </style>
 * </html>
 * ************************************************
 * app.vue
 * ************************************************
 * <template>
 *   <div class="app">
 *     {{message}}
 *     <span>world</span>
 *     <comp></comp>
 *     <hr/>
 *     <reso></reso>
 *   </div>
 * </template>
 *
 * <header>
 *   <title>加油</title>
 * </header>
 *
 * <script>
 * export default {
 *   name: "test",
 *   title: '测试页面',
 *   components:{
 *     comp: './comp/comp.vue',
 *     reso: './comp/reso/reso.vue'
 *   },
 *   mixins:['../mixins/mixin.js'],
 *   data(){
 *     return {
 *       message: 'hello'
 *     }
 *   },
 *   created(){
 *     this.alertHello()
 *   }
 * }
 * </script>
 *
 * <style scoped>
 * .app{
 *   color: blue;
 * }
 * .--this{
 *   background: lightseagreen;
 * }
 * .--this span{
 *   color: coral;
 * }
 * span{
 *   color: cyan;
 * }
 * </style>
 * ************************************************
 * 案例解析
 * test.html是HTML文件，是入口文件
 *
 * 添加了必要的script脚本vue和Vue2Loader
 * <script src="../vue@2_dist_vue.js"></script>
 * <script src="../Vue2Loader.js"></script>
 *
 * 在body中定义了Vue进行mount的根元素#app
 * <body>
 *    <div id="app">
 *    </div>
 * </body>
 *
 * 使用Vue2Loader加载指定的app.vue绑定到#app元素上进行Vue渲染
 * <script>
 * Vue2Loader.createVue('./components/app.vue','#app')
 * </script>
 *
 * app.vue就是使用vue-cli构建是的vue文件
 * 内容和语法上大体相似
 * 区别在于，不能使用import
 * 只能使用export default {}语法
 * 不能export其他对象
 *
 * 允许使用header标签，将自定义的HTML的head内容添加到HTML中
 * <header>
 *   <title>加油</title>
 * </header>
 *
 * 在VueOptions中允许使用title指定页面的标题
 * title: '测试页面',
 *
 * 通过URL加载方式，实现组件导入与混入导入等特性
 * 这部分具体参考Vue2Loader.resolveVueDependency的注释讲解
 * components:{
 *   comp: './comp/comp.vue',
 *   reso: './comp/reso/reso.vue'
 * },
 * mixins:['../mixins/mixin.js'],
 *
 * 加载器不会处理scoped
 * <style scoped>
 * </style>
 *
 * 但是允许在style中使用[.--this]来限定为根元素的类名
 * 这样也能够达到一部分的scoped的特性，限制用于根元素下的类样式
 * .--this{
 *   background: lightseagreen;
 * }
 * .--this span{
 *   color: coral;
 * }
 *
 * @param url 用于构建的.vue文件的URL，一般为xxx.vue
 * @param domId 绑定Vue进行渲染的元素ID，若查找不到元素，将会创建一个此ID的元素到body中,默认为app
 * @return {Promise<Object>} new Vue(options)出来的对象
 */
Vue2Loader.createVue = function (url, domId = 'app') {
    Vue2Loader.domGetOrCreate(domId, 'div', document.body)
    return new Promise(function (resolve, reject) {
        Vue2Loader.loadVueOptions(url)
            .then(function (vueOptions) {
                let nextHref = new URL(url, window.location.href).href
                Vue2Loader.resolveVueDependency(vueOptions, nextHref)
                    .then(function (resolveOptions) {
                        resolveOptions.el = '#' + domId
                        let app = new Vue(resolveOptions)
                        resolve(app)
                    }).catch(function (error) {
                    console.warn('resolve component dependency failure!', nextHref)
                    vueOptions.el = '#' + domId
                    let app = new Vue(vueOptions)
                    resolve(app)
                })
            }).catch(function (error) {
            console.warn('create vue failure!', url)
            reject(error)
        })
    })
}

/**
 * 递归解析VueOptions中的属性
 * baseHref用于记录传入的VueOptions对应的基本URL路径，进行递归查找依赖时，才能确定真实的URL绝对路径进行加载依赖
 * 将器加载为真实的对象
 * 处理
 * vueOptions.components 将会使用真实对象替换URL指向，实现局部组件注册
 * vueOptions.mixins 将会使用真实对象替换URL指向，实现局部混入
 * vueOptions.directives 将会直接进行Vue.directive指令注册
 * vueOptions.objects 将会将对象都挂载到Vue.prototype原型上
 * 使用案例:
 * ************************************************
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
 * ************************************************
 * 案例解析
 * components注册了test,comp,parent三个组件
 * mixins混入了两个特性
 * directives注册了show,hover两个全局指令
 * objects将rsa挂载到了Vue.prototype上，得到Vue.prototype.rsa
 * @param vueOptions Vue的Options对象
 * @param baseHref 传入的vueOptions对应的绝对路径，用于处理递归的依赖的绝对路径
 * @return {Promise<Object>} 处理替换完整的VueOptions,引用还是传入的vueOptions
 */
Vue2Loader.resolveVueDependency = function (vueOptions, baseHref) {
    let arr = []
    if (vueOptions.components) {
        Object.keys(vueOptions.components).forEach(function (key) {
            let value = vueOptions.components[key]
            if (typeof value === 'string') {
                arr.push(new Promise(function (res, rej) {
                    let nextHref = new URL(value, baseHref).href
                    Vue2Loader.loadVueOptions(nextHref)
                        .then(function (comp) {
                            Vue2Loader.resolveVueDependency(comp, nextHref)
                                .then(function (comOptions) {
                                    vueOptions.components[key] = Vue.extend(comOptions)
                                    res(true)
                                }).catch(function (err) {
                                console.warn('resolve component dependency failure!', nextHref)
                                vueOptions.components[key] = Vue.extend(comOptions)
                                res(true)
                            })
                        }).catch(function (err) {
                        console.warn('load component failure!', nextHref)
                        rej(false)
                    })
                }))
            }
        })
    }
    if (vueOptions.mixins) {
        for (let i = 0; i < vueOptions.mixins.length; i++) {
            let value = vueOptions.mixins[i]
            if (typeof value === 'string') {
                arr.push(new Promise(function (res, rej) {
                    let nextHref = new URL(value, baseHref).href
                    Vue2Loader.loadObject(nextHref)
                        .then(function (obj) {
                            vueOptions.mixins[i] = obj
                            res(true)
                        }).catch(function (err) {
                        console.warn('load mixin failure!', nextHref)
                        rej(false)
                    })
                }))
            }
        }
    }
    if (vueOptions.directives) {
        Object.keys(vueOptions.directives).forEach(function (key) {
            let value = vueOptions.directives[key]
            if (typeof value === 'string') {
                arr.push(new Promise(function (res, rej) {
                    let nextHref = new URL(value, baseHref).href
                    Vue2Loader.loadObject(nextHref)
                        .then(function (obj) {
                            vueOptions.directives[key] = obj
                            Vue.directive(key, obj)
                            res(true)
                        }).catch(function (err) {
                        console.warn('load directive failure!', nextHref)
                        rej(false)
                    })
                }))
            } else {
                Vue.directive(key, value)
            }
        })
    }
    if (vueOptions.objects) {
        Object.keys(vueOptions.objects).forEach(function (key) {
            let value = vueOptions.objects[key]
            if (typeof value === 'string') {
                arr.push(new Promise(function (res, rej) {
                    let nextHref = new URL(value, baseHref).href
                    Vue2Loader.loadObject(nextHref)
                        .then(function (obj) {
                            vueOptions.objects[key] = obj
                            Vue.prototype[key] = obj
                            res(true)
                        }).catch(function (err) {
                        console.warn('load object failure!', nextHref)
                        rej(false)
                    })
                }))
            } else {
                Vue.prototype[key] = value
            }
        })
    }

    return new Promise(function (resolve, reject) {
        Promise.all(arr)
            .then(function (all) {
                resolve(vueOptions)
            }).catch(function (err) {
            console.warn('some options not resolve!')
            resolve(vueOptions)
        })
    })
}