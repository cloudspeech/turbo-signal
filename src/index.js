let EMPTY = [];

class TurboSignal extends EventTarget {
  static #values = [];
  static #lastSignalIndex = 0;
  static #lastComputationIndex = -1;
  static #singleton;
  static #effects = [];
  static #registeringComputedSignalDependencies;
  static #registeredComputations = [];
  static #registeredSignalIndices = [];

  static #update = registeredComputationIndex => {
    let signalIndex =
      TurboSignal.#registeredSignalIndices[registeredComputationIndex];
    let newValue =
      TurboSignal.#registeredComputations[registeredComputationIndex]();
    TurboSignal.#value(signalIndex, newValue);
  };

  #id;

  constructor(initialValue) {
    super();

    this.#id = ++TurboSignal.#lastSignalIndex;

    if (!TurboSignal.#singleton) {
      TurboSignal.#singleton = this;
      this.addEventListener('change', ({ detail: id }) => {
        let effects = TurboSignal.#effects[id] || EMPTY;
        for (let effect of effects) {
          let type = typeof effect;
          if (type === 'function') {
            effect();
          } else if (type === 'number') {
            TurboSignal.#update(effect);
          }
        }
      });
    }

    let dependencies =
      TurboSignal.#registeringComputedSignalDependencies || EMPTY;

    for (let dependencyId; (dependencyId = dependencies.shift()); ) {
      if (!TurboSignal.#effects[dependencyId]) {
        TurboSignal.#effects[dependencyId] = [];
      }
      let dependencyEffects = TurboSignal.#effects[dependencyId];
      dependencyEffects.push(TurboSignal.#lastComputationIndex);
    }

    this.value = initialValue;
  }

  get value() {
    let index = this.#id;
    let dependencies = TurboSignal.#registeringComputedSignalDependencies;
    if (dependencies?.indexOf(index) < 0) {
      dependencies.push(index);
      dependencies.sort();
    }
    return TurboSignal.#values[index];
  }

  valueOf() {
    return this.value;
  }

  toString() {
    return String(this.value);
  }

  static #value(index, newValue) {
    let oldValue = TurboSignal.#values[index];
    if (oldValue !== newValue) {
      TurboSignal.#values[index] = newValue;
      TurboSignal.#singleton.dispatchEvent(
        new CustomEvent('change', { detail: index })
      );
    }
    return newValue;
  }

  set value(newValue) {
    return TurboSignal.#value(this.#id, newValue);
  }

  effect(callback, initial) {
    let index = this.#id;
    if (initial) callback();
    let callbacks = (TurboSignal.#effects[index] =
      TurboSignal.#effects[index] || []);
    let callbackIndex = callbacks.length;
    callbacks[callbackIndex] = callback;
    return [index, callbackIndex];
  }

  static uneffect([index, callbackIndex]) {
    TurboSignal.#effects[index][callbackIndex] = null;
  }

  static computed(callback) {
    TurboSignal.#registeringComputedSignalDependencies = [];
    let index = ++TurboSignal.#lastComputationIndex;
    TurboSignal.#registeredComputations[index] = callback;
    TurboSignal.#registeredSignalIndices[index] =
      TurboSignal.#lastSignalIndex + 1;
    let value = callback(); // fills TurboSignal.#registeringComputedSignalDependencies
    let signal = new TurboSignal(value);
    TurboSignal.#registeringComputedSignalDependencies = null;
    return signal;
  }
}

export const signal = value => new TurboSignal(value);
export const computed = callback => TurboSignal.computed(callback);
