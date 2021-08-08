class MyPromise {
	static PENDING = 'pending';
	static FULFILLED = 'fulfilled';
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
				this.state = MyPromise.FULFILLED;
				this.value = value;
				this.resolveCallback.forEach(fn => fn(value));
			}
		}
		let reject = (reason) => {
			if (this.state === MyPromise.PENDING) {
				this.state = MyPromise.REJECTED;
				this.reason = reason;
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
	then(onFulfilled, onRejected) {
		if (typeof onFulfilled !== 'function') {
			onFulfilled = value => value;
		}
		if (typeof onRejected !== 'function') {
			onRejected = reason => reason;
		}
		//返回一个新的 MyPromise 实例
		return new MyPromise((resolve, reject) => {
			// 异步代码，then 方法比 resolve 先执行的。回调函数要缓存起来
			if (this.state === MyPromise.PENDING) {
				this.resolveCallback.push(() => {
					const result = onFulfilled(this.value);
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
			} else if (this.state === MyPromise.FULFILLED) {
				setTimeout(() => {
					const result = onFulfilled(this.value);
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
	static all(promises) {
		return new MyPromise((resolve, reject) => {
			const result = [];
			let count = 0;
			promises.forEach((p, index) => {
				Promise.resolve(p).then(res=>{
					result[index] = res;
					count++;
					if (count === promises.length) {
						resolve(result);
					}
				},error=>{
					reject(error);
				})
			})
		})
	}
	static race(promises) {
		return new MyPromise((resolve, reject) => {
			promises.forEach(item => {
				Promise.resolve(item).then(res=>{
					resolve(res);
				},error=>{
					reject(error);
				})
			})
		})
	}
	static allSettled(promises) {
		const result = [];
		return new MyPromise((resolve, reject) => {
			promises.forEach(item => {
				Promise.resolve(item).then(res=>{
					result.push(res)
					if (result.length === promises.length) {
						resolve(result)
					}
				},error=>{
					result.push(error);
					if (result.length === promises.length) {
						resolve(result)
					}
				})
			})
		})
	}
}