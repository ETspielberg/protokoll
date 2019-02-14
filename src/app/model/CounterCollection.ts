import {Counter} from './Counter';

export class CounterCollection {

  constructor(public identifier: string,
              public totalRequests: number,
              public counters: Counter[]) {
  }
}
