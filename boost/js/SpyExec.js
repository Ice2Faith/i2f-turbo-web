/**
 * 直到predicate返回为true时执行callback函数
 * @param predicate 执行条件监视函数
 * @param callback 执行回调函数
 * @param beginTts 监视开始时间间隔
 * @param multiplier 监视时间间隔递增系数
 * @param maxCount 最大监视次数
 * @param maxTts 最长监视时间
 * @param cancelCallback 没被触发时的回调
 * @constructor
 */
export default function SpyExec(predicate, callback,
  beginTts = 5,
  multiplier = 1.1,
  maxCount = -1,
  maxTts = -1,
  cancelCallback = null) {
  let tts = beginTts
  let sumTts = 0
  let cnt = 0
  const spy = function() {
    sumTts += tts
    cnt++
    const context = {
      predicate,
      callback,
      beginTts,
      multiplier,
      maxCount,
      maxTts,
      cancelCallback,
      tts,
      sumTts,
      cnt
    }
    if (maxCount >= 0) {
      if (cnt > maxCount) {
        cancelCallback(context)
        return
      }
    }
    if (maxTts >= 0) {
      if (sumTts > maxTts) {
        cancelCallback(context)
        return
      }
    }
    setTimeout(function() {
      let ok = true
      if (predicate) {
        ok = predicate(context)
      }
      if (ok === true) {
        if (callback) {
          callback(context)
        }
      } else {
        tts = tts * multiplier
        spy()
      }
    }, Math.floor(tts))
  }

  spy()
}

