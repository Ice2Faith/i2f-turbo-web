/**
 * @param count {int}
 * @constructor {CountDownLatch}
 * @type {CountDownLatch}
 * @return {CountDownLatch}
 */
function CountDownLatch(count) {
    this.count = count;
    this.queue = [];
}

/**
 * return {void}
 */
CountDownLatch.prototype.countDown = function () {
    if (this.count <= 0) {
        return;
    }

    this.count--; // 计数器减一

    // 当计数器减到0时，唤醒所有在队列中等待的任务
    if (this.count === 0) {
        while (this.queue.length > 0) {
            let resolve = this.queue.shift();
            resolve(); // 依次执行队列中的 resolve，解除阻塞
        }
    }
}

/**
 *
 * @return {Promise<void>|Promise<unknown>}
 */
CountDownLatch.prototype.await = function () {
    let self = this;
    // 如果计数器已经为0，直接返回一个立即成功的Promise
    if (this.count === 0) {
        return Promise.resolve();
    }
    // 否则，将当前任务放入队列中排队等待被唤醒
    return new Promise(function (resolve) {
        self.queue.push(resolve);
    });
}

/**
 *
 * @return {int}
 */
CountDownLatch.prototype.getCount = function () {
    return this.count;
}

async function testCountDownLatch() {
    let latch = new CountDownLatch(3);

    let runTask=function(taskId, time) {
        setTimeout(function() {
            console.log('子任务 ' + taskId + ' 执行完成');
            latch.countDown(); // 任务完成，触发倒计时减一
        }, time);
    }

    runTask(1, 2000);
    runTask(2, 1000);
    runTask(3, 1500);

    latch.await().then(function() {
        console.log('所有子任务均已完成，主流程继续执行！');
    });

    // await latch.await()
    //console.log('所有子任务均已完成，主流程继续执行！');

}