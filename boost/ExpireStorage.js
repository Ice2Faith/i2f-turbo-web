/**
 *
 * @param value {Object|null}
 * @param expireTs {number} timestamp
 * @constructor {ExpireData}
 * @type ExpireData
 * @return ExpireData
 */
function ExpireData(value = null, expireTs = -1) {
    this.value = value
    this.expireTs = expireTs
}

/**
 *
 * @constructor {ExpireStorage}
 * @type ExpireStorage
 * @return ExpireStorage
 */
function ExpireStorage(prefix = '') {
    this.prefix = prefix
    this.storage = localStorage
    this.storageName='localStorage'
}

/**
 *
 * @return {string}
 */
ExpireStorage.KEY_PREFIX = function () {
    return 'ttls:'
}

/**
 *
 * @param key {string}
 * @return {string|null}
 */
ExpireStorage.prototype.cacheKey = function (key) {
    if (!key) {
        return key
    }
    if (this.prefix && this.prefix != '') {
        return ExpireStorage.KEY_PREFIX() + this.prefix + ':' + key
    }
    return ExpireStorage.KEY_PREFIX() + key
}

/**
 *
 * @param value {Object}
 * @param expireTs {number} timestamp
 * @return {string}
 */
ExpireStorage.serialize = function (value, expireTs = -1) {
    return JSON.stringify(new ExpireData(value, expireTs))
}

/**
 *
 * @param str {string|null}
 * @return {ExpireData | null}
 */
ExpireStorage.deserialize = function (str) {
    if (!str) {
        return null
    }
    let item = JSON.parse(str)
    return item
}

/**
 *
 * @param key {string|null}
 * @return {ExpireData|null}
 */
ExpireStorage.prototype.getData = function (key) {
    let str = this.storage.getItem(this.cacheKey(key))
    return ExpireStorage.deserialize(str)
}

/**
 *
 * @param key {string}
 * @return {Object|null}
 */
ExpireStorage.prototype.getItem = function (key) {
    let data = this.getData(key)
    if (!data) {
        return null
    }
    let ts = data.expireTs
    if (new Date().getTime() > ts && ts >= 0) {
        return null
    }
    return data.value
}

/**
 *
 * @param key {string}
 * @param value {object|null}
 * @param ttlSeconds {number} ttl seconds
 * @return {void}
 */
ExpireStorage.prototype.setItem = function (key, value, ttlSeconds = -1) {
    let expireTs = -1
    if (ttlSeconds >= 0) {
        expireTs = new Date().getTime() + ttlSeconds * 1000
    }
    let str = ExpireStorage.serialize(value, expireTs)
    this.storage.setItem(this.cacheKey(key), str)
}

/**
 *
 * @param key {string}
 * @return {void}
 */
ExpireStorage.prototype.removeItem = function (key) {
    this.storage.removeItem(this.cacheKey(key))
}

/**
 *
 * @param key {string}
 * @param ttlSeconds {number} ttl seconds
 */
ExpireStorage.prototype.updateExpire = function (key, ttlSeconds = -1) {
    let data = this.getData(key)
    if (data == null) {
        return
    }
    this.setItem(key, data.value, ttlSeconds)
}

/**
 *
 * @param key {string}
 * @return {number|null} ttl seconds
 */
ExpireStorage.prototype.getTtl = function (key) {
    let data = this.getData(key)
    if (data == null) {
        return null
    }
    if (data.expireTs < 0) {
        return data.expireTs
    }
    return data.expireTs - new Date().getTime()
}


/**
 *
 * @param key {string}
 * @return {number|null} mill seconds timestamp
 */
ExpireStorage.prototype.getExpireMillSeconds = function (key) {
    let data = this.getData(key)
    if (data == null) {
        return null
    }
    return data.expireTs
}


/**
 * return {void}
 */
ExpireStorage.prototype.stopExpireTimer = function () {
    if (globalThis[this.storageName + 'Timer']) {
        clearInterval(globalThis[this.storageName + 'Timer'])
        globalThis[this.storageName + 'Timer'] = null
    }
}

/**
 * @return {void}
 */
ExpireStorage.prototype.startExpireTimer = function () {
    this.stopExpireTimer()
    let _this=this
    globalThis[this.storageName + 'Timer'] = setInterval(function () {
        let now = new Date().getTime()
        let prefix = ExpireStorage.KEY_PREFIX()
        let len = _this.storage.length
        let removes = []
        for (let i = 0; i < len; i++) {
            let key = _this.storage.key(i)
            if (!key) {
                continue
            }
            if (!key.startsWith(prefix)) {
                continue
            }
            let str = _this.storage.getItem(key)
            if (!str) {
                continue
            }
            let data = ExpireStorage.deserialize(str)
            if (data.expireTs < 0) {
                continue
            }
            if (now > data.expireTs) {
                removes.push(key)
            }
        }
        for (let i = 0; i < removes.length; i++) {
            _this.storage.removeItem(removes[i])
        }
    }, 15 * 1000)
}

function ExpireLocalStorage(prefix = '') {
    this.prefix = prefix
    this.storage = localStorage
    this.storageName='localStorage'
}

// 继承
ExpireLocalStorage.prototype = Object.create(ExpireStorage.prototype)
ExpireLocalStorage.prototype.constructor = ExpireLocalStorage


function ExpireSessionStorage(prefix = '') {
    this.prefix = prefix
    this.storage = sessionStorage
    this.storageName='sessionStorage'
}

// 继承
ExpireSessionStorage.prototype = Object.create(ExpireStorage.prototype)
ExpireSessionStorage.prototype.constructor = ExpireSessionStorage


globalThis.expireLocalStorage = new ExpireLocalStorage('default')
globalThis.expireLocalStorage.startExpireTimer()

globalThis.expireSessionStorage = new ExpireSessionStorage('default')
globalThis.expireSessionStorage.startExpireTimer()

// export {ExpireData, ExpireStorage, ExpireLocalStorage, ExpireSessionStorage}
