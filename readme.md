# lazy-singleton [![Build Status](https://travis-ci.org/jamestalmage/lazy-singleton.svg?branch=master)](https://travis-ci.org/jamestalmage/lazy-singleton) [![codecov](https://codecov.io/gh/jamestalmage/lazy-singleton/badge.svg?branch=master)](https://codecov.io/gh/jamestalmage/lazy-singleton?branch=master)

> Create lazy initialized singletons


## Install

```
$ npm install lazy-singleton
```


## Usage

```js
const lazySingleton = require('lazy-singleton');

const lazyDependency = lazySingleton(someExpensiveFunction)(...argsToPass);

// later - the expensive function won't be called until here
lazyDependency().doSomething();


// wrapped function will be called with `new`
const lazyInstance = new lazySingleton.Sync(SomeConstructor)(...argsToPass);
lazyInstance().memberFunction();

// it can be used as a lazy require wrapper - note we aren't chaining (...args) on the initial call.
const lazyRequire = require('lazy-singleton')(require);
const _ = lazyRequire('lodash');
const lazyFoo = lazyRequire('foo');
_().isNumber(3);
```

This is similar to, but different from, the popular [once package](https://www.npmjs.com/package/once), in that both ensure your wrapped function is only called once. With `once` the first caller determines which arguments are passed, and all future arguments are ignored. With this library, args are determined at creation time.




## API

*Note: All the API examples below show the common usage of two chained function calls. This is so you can create a generator that creates multiple lazy singletons with different args passed to the function (see the lazyRequire example above).*

### lazySingleton(fn)(...args)

#### fn

Type: `function`

The function to be called.

#### args

Type: `function`

The args for to be passed to the lazily called function.

&npbsp;

*Note: If `lazySingleton(fn)` is called with `new`, then `fn` will also be called with `new` if/when it is invoked. Useful for classes.*

### lazySingleton.sync(fn)(...args) and lazySingleton.Sync(fn)(...args)

These are both just an alias for the main function, the capitalized `.Sync` is useful when using `new` to prevent your linter from complaining.

### lazySingleton.promise(fn)(...args)

This is just a wrapper allowing easy promise creation. `fn` will be called `resolve`, and `reject` as it's first two arguments. 

```js
lazySingleton.promise((resolve, reject) => resolve('foo'))();

// is equivalent to:

lazySingleton(() => new Promise((resolve, reject) => resolve('foo')))();
```

Note that you can still pass additional `...args` to your [promise executor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Any extra args are just appended after `resolve` and `reject`.

```js
lazySingleton.promise(fn)('foo', 'bar');
// fn will be called with the extra args:
fn(resolve, reject, 'foo', 'bar');
```

Finally, the returned function will also accept a node style callback as it's first argument, allowing flexibility:

```js
const lazy = lazySingleton.promise(promiseExecutor)();

lazy().then(doSomething);
//or
lazy((err, result) => {/* doSomething */});
```

### lazySingleton.callback(fn)(...args)

Another sugar function. When lazily initialized, a node style callback will be appended to `..args`, allowing you to leverage node style libraries:

```js
const fileContents = lazySingleton.callback(fs.readFile)('some/path/to/file.txt');

// can be used as a promise
fileContents().then(contents => console.log(contents));
// or a node style callback
fileContents((err, contents) => console.log(contents))
```


## License

MIT © [James Talmage](https://github.com/jamestalmage)
