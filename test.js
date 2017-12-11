import fs from 'fs';
import path from 'path';
import test from 'ava';
import td from 'testdouble';
import pify from 'pify';
import m from './index';

test('sync', t => {
	let count = 0;
	const foo = function (...args) {
		return `${++count} ${Boolean(new.target)} foo ${JSON.stringify(args)}`;
	};

	const singleFoo = m(foo)('bar', 'baz');

	t.is(singleFoo(), '1 false foo ["bar","baz"]');
	t.is(singleFoo(), '1 false foo ["bar","baz"]');
	t.is(count, 1);
});

test('new sync', t => {
	let count = 0;

	class Foo {
		constructor(...args) {
			this.count = ++count;
			this.args = JSON.stringify(args);
		}
	}

	const singleFoo = new m.Sync(Foo)('bar', 'baz');

	t.is(count, 0);

	const first = singleFoo();

	t.true(first instanceof Foo);
	t.is(first.args, '["bar","baz"]');
	t.is(first.count, 1);
	t.is(singleFoo(), first);
	t.is(count, 1);
});

test('promise resolves', async t => {
	const foo = td.function('foo');
	const resolve = td.matchers.captor();

	const singleFoo = m.promise(foo)('bar');

	td.verify(foo(), {times: 0, ignoreExtraArgs: true});

	const promise = singleFoo();

	td.verify(foo(resolve.capture(), td.matchers.anything(), 'bar'));

	resolve.value('baz');

	t.is(await promise, 'baz');
});

test('callback resolves', async t => {
	const foo = td.function('foo');
	td.when(foo('bar')).thenCallback(null, 'baz');

	const singleFoo = m.callback(foo)('bar');
	td.verify(foo(), {ignoreExtraArgs: true, times: 0});

	const promise = singleFoo();

	t.is(await promise, 'baz', 'returns a promise');
	t.is(await pify(singleFoo)(), 'baz', 'accepts a callback');

	td.verify(foo(), {ignoreExtraArgs: true, times: 1});
});

test('callback rejects', async t => {
	const foo = td.function('foo');
	const error = new Error('baz');

	td.when(foo('bar')).thenCallback(error);

	const singleFoo = m.callback(foo)('bar');

	td.verify(foo(), {ignoreExtraArgs: true, times: 0});

	t.is(await t.throws(singleFoo()), error, 'returns a rejected promise');
	t.is(await t.throws(pify(singleFoo)()), error, 'accepts a callback');

	td.verify(foo(), {ignoreExtraArgs: true, times: 1});
});

test('fs example', async t => {
	const readFixture = m.callback(fs.readFile)(path.join(__dirname, 'fixture.txt'), 'utf8');

	t.is(await readFixture(), 'hello\n');
	t.is(await pify(readFixture)(), 'hello\n');
});
