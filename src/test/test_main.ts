import {Mutex, IMutexOptions} from '../lib/mutex';
import * as bluebird from 'bluebird';
import * as chai from 'chai';
import * as q from 'q';

const expect = chai.expect;

const promises = {
    native: Promise,
    bluebird,
    q: (q.Promise as any)
};

describe('mutex with default Promise opt', function(): void {
    let currentCase = 0;

    afterEach(function(done: MochaDone): void {
        // TODO
        currentCase++;
        done();
    });

    // TODO
    it('should lock', function(done: MochaDone): void {
        const mutex = new Mutex({});
        const testCase: number = currentCase;

        const firstFunction = function(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                mutex.capture('key')
                    .then((unlock) => {
                        setTimeout(() => {
                            done();
                        }, 1000);
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        };

        const secondFunction = function(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                mutex.capture('key')
                    .then((unlock) => {
                        if (currentCase === testCase) {
                            done('Mutex should not be captured');
                        }
                    });
            });
        };

        firstFunction();
        secondFunction();
    });

    it('should throw error in no-Promise env', function(done: MochaDone): void {
        const oldPromise = Promise;
        Promise = null;

        try {
            const mutex = new Mutex();
            done('Mutex should not be constructed');
        } catch (error) {
            expect(error).to.be.instanceOf(Error);
            expect(error.message).to.eq(
                'Could not get Promise object in current env. You should pass custom Promise lib to constructor options'
            );
            done();
        } finally {
            Promise = oldPromise;
        }
    });
});

Object.keys(promises).forEach((key) => {
    describe('mutex with ' + key, function(): void {
        const promise = promises[key];
        let currentCase = 0;

        afterEach(function(done: MochaDone): void {
            // TODO
            currentCase++;
            done();
        });

        it('should process passed mutex options', function(done: MochaDone): void {
            const options: IMutexOptions = {
                autoUnlockTimeoutMs: 1200,
                intervalMs: 100,
                Promise: promise
            };

            const mutex = new Mutex(options);

            expect((mutex as any).options).not.to.eq(options);
            expect((mutex as any).options).to.eql(options);
            done();
        });

        it('should lock', function(done: MochaDone): void {
            const mutex = new Mutex({
                Promise: promise
            });
            const testCase: number = currentCase;

            const firstFunction = function(): Promise<void> {
                return new Promise<void>((resolve, reject) => {
                    mutex.capture('key')
                        .then((unlock) => {
                            setTimeout(() => {
                                done();
                            }, 1000);
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
            };

            const secondFunction = function(): Promise<void> {
                return new Promise<void>((resolve, reject) => {
                    mutex.capture('key')
                        .then((unlock) => {
                            if (currentCase === testCase) {
                                done('Mutex should not be captured');
                            }
                        });
                });
            };

            firstFunction();
            secondFunction();
        });

        it('should unlock', function(done: MochaDone): void {
            const mutex = new Mutex({
                Promise: promise
            });
            mutex.capture('key').then((unlock) => {
                setTimeout(() => {
                    unlock();
                }, 300);
            });

            mutex.capture('key')
                .then((unlock) => {
                    unlock();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('should process different keys for capturing', function(done: MochaDone): void {
            const mutex = new Mutex({
                Promise: promise
            });

            mutex.capture('firstKey');
            mutex.capture('secondKey')
                .then((unlock) => {
                    done();
                });
        });

        it('should have default timeout of 3000ms', function(done: MochaDone): void {
            const mutex = new Mutex({
                Promise: promise
            });
            this.timeout(4000);
            mutex.capture('anotherKey');
            setTimeout(() => {
                mutex.capture('anotherKey')
                    .then((unlock) => {
                        done();
                    });
            }, 3000);
        });

        it('should not clear mutex key after timeout', function(done: MochaDone): void {
            const testCase: number = currentCase;
            this.timeout(4000);
            const mutex = new Mutex({
                autoUnlockTimeoutMs: 500,
                Promise: promise
            });

            mutex.capture('test')
                .then((unlock) => {
                    setTimeout(() => unlock(), 600);
                });

            mutex.capture('test')
                .then((unlock) => {
                    setTimeout(() => done(), 400);
                });

            setTimeout(() => {
                mutex.capture('test')
                    .then((unlock) => {
                        if (currentCase === testCase) {
                            done('Mutex should not be captured');
                        }
                    });
            }, 700);
        });
    });
});