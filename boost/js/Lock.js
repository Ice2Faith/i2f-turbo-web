/**
 * @constructor {Lock}
 * @type {Lock}
 * @return {Lock}
 */
function Lock() {
    this.locked = false;
    this.queue = [];
}

/**
 *
 * @return {Promise<void>|Promise<unknown>}
 */
Lock.prototype.lock = function () {
    let self = this;
    if (!this.locked) {
        this.locked = true;
        return Promise.resolve();
    }
    return new Promise(function (resolve) {
        self.queue.push(resolve);
    });
}

/**
 * @return {void}
 */
Lock.prototype.unlock = function () {
    if (this.queue.length > 0) {
        let next = this.queue.shift();
        next();
    } else {
        this.locked = false;
    }
}

function testLock() {
    let mutex = new Lock();
    let sharedValue = 0;

    let safeAsyncOperation = function (id) {
        mutex.lock().then(function () {
            console.log('任务 ' + id + ' 获取到了锁，开始执行...');

            return new Promise(function (resolve) {
                setTimeout(function () {
                    sharedValue++;
                    console.log('任务 ' + id + ' 执行完毕，共享数值更新为: ' + sharedValue);
                    resolve();
                }, 1000);
            });
        }).finally(function () {
            mutex.unlock();
        });
    }

    safeAsyncOperation(1);
    safeAsyncOperation(2);
    safeAsyncOperation(3);

    let safeAsyncOperation2 = function (id) {
        setTimeout(async function () {
            await mutex.lock()
            try {
                console.log('任务 ' + id + ' 获取到了锁，开始执行...');

                sharedValue++;
                console.log('任务 ' + id + ' 执行完毕，共享数值更新为: ' + sharedValue);
            } finally {
                mutex.unlock()
            }
        }, 1000);
    }

    safeAsyncOperation2(1);
    safeAsyncOperation2(2);
    safeAsyncOperation2(3);
}