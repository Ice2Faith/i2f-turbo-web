/**
 * 初始化eruda调试工具
 */
export function InitEruda() {
    const DOM_ID = 'eruda'
    let dom = document.querySelector('#' + DOM_ID)
    if (dom) {
        document.body.removeChild(dom)
    }
    if (window.eruda) {
        eruda.destroy()
    }
    let script = document.createElement('script');
    script.id = DOM_ID
    script.src = '//cdn.bootcss.com/eruda/1.5.2/eruda.min.js';
    script.onload = function () {
        eruda.init()
    }
    document.body.appendChild(script);
}

/**
 * 初始化vconsole调试工具
 */
export function InitVConsole() {
    const DOM_ID = 'vconsole'
    let dom = document.querySelector('#' + DOM_ID)
    if (dom) {
        document.body.removeChild(dom)
    }
    if (window.$vConsole) {
        window.$vConsole.destroy()
    }
    let script = document.createElement('script');
    script.id = DOM_ID
    script.src = '//unpkg.com/vconsole@latest/dist/vconsole.min.js';
    script.onload = function () {
        window.$vConsole = new window.VConsole()
    }
    document.body.appendChild(script);
}

/**
 * 计数窗口触发器
 * 用key键隔离的在指定的窗口时长windowMillSecond下触发达到count次，则触发回调callback
 * @param key 触发器的键，相同触发器使用的键应该一致
 * @param count 触发次数达到此值则触发回调
 * @param windowMillSecond 窗口的毫秒时长
 * @param callback 触发回调函数
 */
export function CountWindowActionCallback(key, count, windowMillSecond, callback) {
    if (!window.$action) {
        window.$action = {}
    }

    if (!window.$action[key]) {
        window.$action[key] = 0
    }

    window.$action[key]++
    setTimeout(() => {
        if (window.$action[key] > 0) {
            window.$action[key]--
        }
    }, windowMillSecond)
    if (window.$action[key] >= count) {
        window.$action[key] -= count
        callback()
    }
}


export default {
    eruda: InitEruda,
    vconsole: InitVConsole,
    countWindowAction: CountWindowActionCallback,
}
