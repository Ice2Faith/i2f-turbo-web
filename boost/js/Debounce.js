
/**
 * 防抖函数
 * 在限定的tts时间间隔内仅调用一次callback回调函数
 * 当lastExec为true时，如果tts时间未结束，存在调用，则会在tts时间到达时，最后执行一次回调
 * 函数返回值为一个接受一个入参的函数
 * callback回调函数可接受两个参数，分别为：调用的入参，防抖的上下文参数
 * 总的来说，就是一般的防抖函数，加上了支持入参和最后执行的特性
 * 用法示例：
 * let func=debounce(1000,(arg,ctx)=>{
 *   console.log('debounce',arg,ctx)
 * },true)
 * func(1)
 * func(2)
 * func(3)
 * @param tts 防抖时间间隔
 * @param callback 回调函数
 * @param lastExec 防抖结束是否最后调用一次
 * @returns function(arg){}
 */
export function Debounce(tts, callback, lastExec = false) {
    let ok = true
    let cnt = []
    const ret = (arg) => {
        cnt.push({
            arg: arg,
            ts: new Date().getTime()
        })
        if (!ok) {
            return
        }
        ok = false
        setTimeout(() => {
            ok = true
            const next = cnt.length > 0
            const execArg = next ? cnt[cnt.length - 1] : null
            const ctx = {
                cnt: cnt.length,
                last: true,
                miss: cnt.length - 1,
                triggerTs: execArg?.ts,
                executeTs: new Date().getTime(),
                diffTs: 0,
                missList: []
            }
            if (next) {
                ctx.diffTs = ctx.executeTs - ctx.triggerTs
                ctx.missList = cnt.slice(0, cnt.length - 1)
            }
            cnt = []
            if (lastExec && next) {
                callback(execArg.arg, ctx)
            }
        }, tts)
        let idx = 0
        if (lastExec) {
            idx = cnt.length - 1
        }
        const execArg = cnt[idx]
        const ctx = {
            cnt: cnt.length,
            last: false,
            miss: idx,
            triggerTs: execArg.ts,
            executeTs: new Date().getTime(),
            diffTs: 0,
            missList: []
        }
        ctx.diffTs = ctx.executeTs - ctx.triggerTs
        ctx.missList = cnt.slice(0, idx)
        cnt.splice(idx, 1)
        callback(execArg.arg, ctx)
    }
    return ret
}
