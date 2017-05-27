# ts-simple-mutex

[![Build Status](https://travis-ci.org/dlukanin/ts-simple-mutex.svg?branch=master)](https://travis-ci.org/dlukanin/ts-simple-mutex)

Yet another timeout & promise (native or custom) based mutex implementation for node and browsers.

```
npm install ts-simple-mutex --save
```

## Changelog

#### v 0.0.2
Some inner module fixes.

#### v 0.0.1
Hello, world! First version of package.

## Usage

Constructing mutex instances:
```
const Mutex = require('ts-simple-mutex').Mutex;

// or import {Mutex} from 'ts-simple-mutex' if you use module system

const mutex = new Mutex({
    autoUnlockTimeoutMs: 1200,
    intervalMs: 100,
});

```
Capturing mutex:

```
mutex.capture('key')
    .then((unlock) => {
        // Do something in this critical code section
        unlock();
    })

```
or e.g. if your env supports async/await
```
const unlock = await mutex.capture('key');

// Do something in this critical code section

unlock();

```

## Docs
### Mutex
#### constructor(options: IMutexOptions)
Creates new Mutex instance. You can pass options object to constructor:

`autoUnlockTimeoutMs` - timeout of mutex auto-unlock (3000 by default)

`intervalMs` - mutex is timer-based so you can change interval of mutex check (50 by default)

`Promise` - Promise implementation object. You can use custom implementation if you want to
 by passing custom Promise object, e.g. Bluebird (native Promise object by default).
 
 ```
 const bluebird = require('bluebird');
 
 const Mutex = require('ts-simple-mutex').Mutex;
 
 const mutex = new Mutex({
     autoUnlockTimeoutMs: 1200,
     intervalMs: 100,
     Promise: bluebird
 });
 
 ```

#### capture(key: string): Promise<() => void>
Tries to capture mutex by provided key. Returns Promise, resolving with unlocker function.

## License (MIT)

https://github.com/dlukanin/ts-simple-mutex/blob/master/LICENSE