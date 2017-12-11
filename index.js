'use strict';
const p2n = require('p2n');

function lazySingleton(fn) {
	const isConstructor = this instanceof lazySingleton;

	return (...args) => {
		let initialized = false;
		let value;

		return () => {
			if (!initialized) {
				value = isConstructor ? new fn(...args) : fn(...args); // eslint-disable-line new-cap
				initialized = true;
			}

			return value;
		};
	};
}

const promise = fn => {
	const wrapped = lazySingleton((...args) => new Promise((resolve, reject) => fn(resolve, reject, ...args)));
	return (...args) => {
		const promise = wrapped(...args);
		return cb => p2n(promise(), cb);
	};
};

const callback = fn => promise(
	(resolve, reject, ...args) => {
		args.push((err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});

		fn(...args);
	}
);

module.exports = lazySingleton;
module.exports.sync = lazySingleton;
module.exports.Sync = lazySingleton;
module.exports.promise = promise;
module.exports.callback = callback;
