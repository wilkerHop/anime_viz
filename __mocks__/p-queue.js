export default class PQueue {
  constructor() {}
  add(fn) {
    return fn();
  }
  onIdle() {
    return Promise.resolve();
  }
  get pending() { return 0; }
  get size() { return 0; }
  clear() {}
}
