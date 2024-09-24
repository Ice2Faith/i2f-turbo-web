/**
 * @type {FetchOptions}
 * @constructor
 */
function FetchOptions() {
    /**
     * 基本URL，没有值时使用 window.location.origin 的值
     * @type {String|null}
     */
    this.baseURL = null
    /**
     * 常用可选的值有 GET POST PUT DELETE
     * @type {String|null}
     */
    this.method = 'GET'
    /**
     * 定义了请求头信息的映射或者对象
     * @type {Map|Object|null}
     */
    this.headers = null
    /**
     * 可选值 json form text blob arrayBuffer
     * @type {String|null}
     */
    this.responseType = null
    /**
     * 定义了请求参数的映射或者对象
     * @type {Map|Object|null}
     */
    this.params = null
    /**
     * 定义了请求体
     * @type {any|null}
     */
    this.data = null
    /**
     * 原始的fetch的body字段
     * 如果此字段为无效值，则使用data字段
     * @type {any|null}
     */
    this.body = null

    /**
     * 请求拦截器
     * @type {function(FetchOptions):void}
     */
    this.requestInterceptor = null

    /**
     *
     * @type {function(FetchResult):void}
     */
    this.responseInterceptor = null

}

/**
 * @type {FetchResult}
 * @constructor
 */
function FetchResult() {
    /**
     * 请求使用的配置
     * @type {FetchOptions|null}
     */
    this.config = null
    /**
     * 响应数据
     * @type {any|null}
     */
    this.data = null
    /**
     * 定义了请求头信息的映射或者对象
     * @type {Map|Object|null}
     */
    this.headers = null
    /**
     * 定义响应是否成功
     * @type {boolean|null}
     */
    this.ok = null
    /**
     * 是否重定向
     * @type {boolean|null}
     */
    this.redirected = null
    /**
     * HTTP响应码
     * @type {Integer|null}
     */
    this.status = null
    /**
     * HTTP状态描述
     * @type {String|null}
     */
    this.statusText = null
    /**
     * 请求类型
     * @type {String|null}
     */
    this.type = null
    /**
     * 响应的完整URL
     * @type {String|null}
     */
    this.url = null
}

/**
 *
 * @param defaultOptions {FetchOptions}
 * @constructor
 */
function Fetch(defaultOptions = {}) {
    this.defaultOptions = defaultOptions || {}
}

//////////////////////////////////////////////////
// 静态方法
//////////////////////////////////////////////////

/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.json = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'application/json;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return Fetch.fetch(url, options)
}
/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.form = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return Fetch.fetch(url, options)
}
/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.multipart = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'multipart/form-data;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return Fetch.fetch(url, options)
}

/**
 * 兼容axios的配置方式
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.axios=function(options={}){
    return Fetch.fetch(options.url,options)
}

/**
 * 兼容原始 fetch 的功能的原始功能
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.fetch = function (url, options = {}) {
    if(!url){
        url=options.url
    }
    let u = null
    if (url.indexOf('://') >= 0) {
        u = new URL(url)
    } else {
        if (!options.baseURL) {
            if (!(typeof window == 'undefined')) {
                options.baseURL = window.location.origin
            }
        }
        u = new URL(url, options.baseURL)
    }
    if (options.params) {
        Object.keys(options.params).forEach((k) => {
            u.searchParams.delete(k)
            u.searchParams.append(k, options.params[k])
        })
    }
    url = u.toString()
    options.url = url

    let contentType = 'application/json'
    if (!options.headers) {
        options.headers = {}
    }
    Object.keys(options.headers).forEach((k) => {
        let lk = k.toLowerCase()
        if (lk == 'content-type') {
            contentType = options.headers[k]
        }
    })
    let method = options.method
    if (!method) {
        method = 'GET'
    }
    let lm = method.toLowerCase()
    if (lm != 'get') {
        if (!options.body) {
            if (options.data) {
                if (contentType.indexOf('json') >= 0) {
                    options.body = JSON.stringify(options.data)
                } else if (contentType.indexOf('urlencoded') >= 0) {
                    options.body = new URLSearchParams(options.data).toString()
                } else if (contentType.indexOf('multipart') >= 0) {
                    let isFormData = (options.data instanceof FormData)
                    if (!isFormData) {
                        isFormData = (Object.prototype.toString.call(options.data) == '[object FormData]')
                    }
                    if (!isFormData) {
                        isFormData = (options.data.constructor == FormData)
                    }
                    if (!isFormData) {
                        let fd = new FormData()
                        Object.keys(options.data).forEach(k => {
                            fd.append(k, options.data[k])
                        })
                        options.data = fd
                    }
                    options.body = options.data

                }
            }
        }
    }

    let responseType = options.responseType

    if (options.requestInterceptor) {
        options.requestInterceptor(options)
    }

    let resp = {
        config: options
    }
    if (!globalThis._fetch) {
        globalThis._fetch = globalThis.fetch
    }
    return globalThis._fetch(options.url, options)
        .then(res => {
            resp = Object.assign(resp, {
                body: res.body,
                bodyUsed: res.bodyUsed,
                headers: {},
                ok: res.ok,
                redirected: res.redirected,
                status: res.status,
                statusText: res.statusText,
                type: res.type,
                url: res.url,
            })

            let iter = res.headers.keys()
            while (true) {
                let rs = iter.next()
                if (!rs || rs.done) {
                    break
                }
                let k = rs.value
                let v = res.headers.get(k)
                resp.headers[k] = v
            }

            let pms = null
            if (responseType == 'json') {
                pms = res.json()
            } else if (responseType == 'form') {
                pms = res.formData()
            } else if (responseType == 'text') {
                pms = res.text()
            } else if (responseType == 'blob') {
                pms = res.blob()
            } else if (responseType == 'arrayBuffer') {
                pms = res.arrayBuffer()
            } else {
                pms = Promise.resolve(res.body)
            }

            return pms
                .then(data => {
                    resp.data = data
                    delete resp.body
                    delete resp.bodyUsed
                    if (options.responseInterceptor) {
                        options.responseInterceptor(resp)
                    }
                    return resp
                })

        })

}

/**
 * 使用包装之后的Fetch.fetch方法替代原始的fetch方法
 */
Fetch.installFetch = function () {
    if (!globalThis._fetch) {
        globalThis._fetch = globalThis.fetch
    }
    globalThis.fetch = Fetch.fetch
}

//////////////////////////////////////////////////
// 实例方法
// 会使用构造的默认options参数进行覆盖
//////////////////////////////////////////////////

/**
 * 基于实例的默认配置的 fetch 方法
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.prototype.fetch = function (url, options = {}) {
    let opts = Object.assign({}, this.defaultOptions, options)
    if (!opts.requestInterceptor) {
        opts.requestInterceptor = this.defaultOptions.requestInterceptor
    }
    if (!opts.responseInterceptor) {
        opts.responseInterceptor = this.defaultOptions.responseInterceptor
    }
    opts.headers = Object.assign({}, this.defaultOptions.headers, options.headers)
    return Fetch.fetch(url, opts)
}

/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.prototype.json = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'application/json;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return this.fetch(url, options)
}

/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.prototype.form = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return this.fetch(url, options)
}

/**
 *
 * @param url {String}
 * @param options {FetchOptions|?}
 * @return {Promise<FetchResult>}
 */
Fetch.prototype.multipart = function (url, options = {}) {
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Content-Type'] = 'multipart/form-data;charset=utf-8'
    if (!options.method) {
        options.method = 'post'
    }
    return this.fetch(url, options)
}

Fetch.installFetch()

export default Fetch
