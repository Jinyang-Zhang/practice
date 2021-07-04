class MyPromise {
	static PENDING = 'pending';
	static RESOLVED = 'resolved';
	static REJECTED = 'rejected';
	constructor(excutor) {
		this.state = MyPromise.PENDING;
		this.value = '';
		this.reason = '';
		//将成功的回调函数缓存在 resolvedCallback 中
		this.resolveCallback = [];
		//将失败的回调函数缓存在 rejectCallback 中
		this.rejectCallback = [];
		let resolve = (value) => {
			//只有 PENDING 状态才可以被修改，保证 MyPromise 状态的不可逆
			if (this.state === MyPromise.PENDING) {
				this.state = MyPromise.RESOLVED;
				this.value = value;
				this.resolveCallback.forEach(fn => fn(value));
			}
		}
		let reject = (reason) => {
			if (this.state === MyPromise.PENDING) {
				this.state = MyPromise.REJECTED;
				this.value = value;
				this.rejectCallback.forEach(fn => fn(reason));
			}
		}
		try {
			//同步执行传进来的 excutor 函数
			excutor(resolve, reject);
		} catch (e) {
			console.log('excutor error:', e)
			reject(e);
		}
	}
	then(onResolved, onRejected) {
		if (typeof onResolved !== 'function') {
			onResolved = value => value;
		}
		if (typeof onRejected !== 'function') {
			onRejected = reason => reason;
		}
		//返回一个新的 MyPromise 实例
		return new MyPromise((resolve, reject) => {
			// 异步代码，then 方法比 resolve 先执行的。回调函数要缓存起来
			if (this.state === MyPromise.PENDING) {
				this.resolveCallback.push(() => {
					const result = onResolved(this.value);
					if (result instanceof MyPromise) {
						result.then(resolve,reject);
					} else {
						resolve(result);
					}
				})
				this.rejectCallback.push(() => {
					const reason = onRejected(this.reason);
					if (reason instanceof MyPromise) {
						reason.then(resolve,reject);
					} else {
						reject(reason);
					}
				})
			} else if (this.state === MyPromise.RESOLVED) {
				setTimeout(() => {
					const result = onResolved(this.value);
					if (result instanceof MyPromise) {
						result.then(resolve,reject);
					} else {
						resolve(result);
					}
				})
			} else if (this.state === MyPromise.REJECTED) {
				setTimeout(() => {
					const reason = onRejected(this.reason);
					if (reason instanceof MyPromise) {
						reason.then(resolve,reject);
					} else {
						reject(reason);
					}
				})
			}
		})
	}
	static resolve(promise) {
		return new MyPromise((resolve, reject) => {
			if (promise instanceof MyPromise) {
				promise.then(resolve, reject);
			} else {
				resolve(promise);
			}
		})
	}
	static reject(promise) {
		return new MyPromise((resolve, reject) => {
			reject(promise);
		})
	}
}