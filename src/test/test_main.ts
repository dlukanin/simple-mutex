import {Mutex, IMutexOptions} from '../lib/mutex';
import * as bluebird from 'bluebird';
import {expect} from 'chai';

describe('mutex', function(): void {
    let currentCase = 0;
    const oldPromise = Promise;

    beforeEach(function(done: MochaDone): void {
        // TODO
        currentCase++;
        Promise = oldPromise;
        done();
    });

    it('should process passed mutex options', function(done: MochaDone): void {
        const options: IMutexOptions = {
            autoUnlockTimeoutMs: 1200,
            intervalMs: 100,
            Promise: bluebird
        };

        const mutex = new Mutex(options);

        expect((mutex as any).options).not.to.eq(options);
        expect((mutex as any).options).to.eql(options);
        done();
    });

    it('should lock', function(done: MochaDone): void {
        const mutex = new Mutex();
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
        const mutex = new Mutex();
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
        const mutex = new Mutex();

        mutex.capture('firstKey');
        mutex.capture('secondKey')
            .then((unlock) => {
                done();
            });
    });

    it('should have default timeout of 3000ms', function(done: MochaDone): void {
        const mutex = new Mutex();
        this.timeout(4000);
        mutex.capture('anotherKey');
        setTimeout(() => {
            mutex.capture('anotherKey')
                .then((unlock) => {
                    done();
                });
        }, 3000);
    });

    it('should throw error in no-Promise env', function(done: MochaDone): void {
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
        }
    });

    it('should use custom Promise', function(done: MochaDone): void {
        Promise = null;

        const mutex = new Mutex({
            Promise: bluebird
        });

        mutex.capture('test')
            .then((unlock) => {
                done();
            });
    });
});