/**
* Signals are what Phaser uses to handle events and event dispatching.
* You can listen for a Signal by binding a callback / function to it.
* This is done by using either `Signal.add` or `Signal.addOnce`.
*
* For example you can listen for a touch or click event from the Input Manager 
* by using its `onDown` Signal:
* `game.input.onDown.add(function() { ... });`
* Rather than inline your function, you can pass a reference:
* `game.input.onDown.add(clicked, this);`
* `function clicked () { ... }`
* In this case the second argument (`this`) is the context in which your function should be called.
*
* Now every time the InputManager dispatches the `onDown` signal (or event), your function
* will be called.
* Very often a Signal will send arguments to your function.
* This is specific to the Signal itself.
* If you're unsure then check the documentation, or failing that simply do:
* `Signal.add(function() { console.log(arguments); })`
* and it will log all of the arguments your function received from the Signal.
* Sprites have lots of default signals you can listen to in their Events class, such as:
* `sprite.events.onKilled`
* 
* Which is called automatically whenever the Sprite is killed.
* There are lots of other events, see the Events component for a list.
*
* As well as listening to pre-defined Signals you can also create your own:
* `var mySignal = new Phaser.Signal();`
*
* This creates a new Signal. You can bind a callback to it:
* `mySignal.add(myCallback, this);`
* and then finally when ready you can dispatch the Signal:
* `mySignal.dispatch(your arguments);`
* And your callback will be invoked. See the dispatch method for more details.
*
* @class Phaser.Signal
* @constructor
*/
export class Signal {
  /**
  * @property {?Array.<Phaser.SignalBinding>} _bindings - Internal variable.
  * @private
  */
  private _bindings: SignalBinding[];

  /**
  * @property {any} _prevParams - Internal variable.
  * @private
  */
  private _prevParams = null;

  /**
  * Memorize the previously dispatched event?
  *
  * If an event has been memorized it is automatically dispatched when a new listener is added with {@link #add} or {@link #addOnce}.
  * Use {@link #forget} to clear any currently memorized event.
  *
  * @property {boolean} memorize
  */
  memorize = false;

  /**
  * @property {boolean} _shouldPropagate
  * @private
  */
  private _shouldPropagate = true;

  /**
  * Is the Signal active? Only active signals will broadcast dispatched events.
  *
  * Setting this property during a dispatch will only affect the next dispatch. To stop the propagation of a signal from a listener use {@link #halt}.
  *
  * @property {boolean} active
  * @default
  */
  active = true;

  /**
  * @property {function} _boundDispatch - The bound dispatch function, if any.
  * @private
  */
  private _boundDispatch = false;

  /**
  * @method Phaser.Signal#validateListener
  * @param {function} listener - Signal handler function.
  * @param {string} fnName - Function name.
  * @private
  */
  private validateListener(listener, fnName) {

    if (typeof listener !== 'function') {
      throw new Error('Phaser.Signal: listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
    }

  };

  /**
  * @method Phaser.Signal#_registerListener
  * @private
  * @param {function} listener - Signal handler function.
  * @param {boolean} isOnce - Should the listener only be called once?
  * @param {object} [listenerContext] - The context under which the listener is invoked.
  * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0).
  * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
  */
  private _registerListener(listener, isOnce, listenerContext, priority, args) {

    var prevIndex = this._indexOfListener(listener, listenerContext);
    var binding;

    if (prevIndex !== -1) {
      binding = this._bindings[prevIndex];

      if (binding.isOnce() !== isOnce) {
        throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
      }
    }
    else {
      binding = new SignalBinding(this, listener, isOnce, listenerContext, priority, args);
      this._addBinding(binding);
    }

    if (this.memorize && this._prevParams) {
      binding.execute(this._prevParams);
    }

    return binding;

  };

  /**
  * @method Phaser.Signal#_addBinding
  * @private
  * @param {Phaser.SignalBinding} binding - An Object representing the binding between the Signal and listener.
  */
  private _addBinding(binding) {

    if (!this._bindings) {
      this._bindings = [];
    }

    //  Simplified insertion sort
    var n = this._bindings.length;

    do {
      n--;
    }
    while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);

    this._bindings.splice(n + 1, 0, binding);

  };

  /**
  * @method Phaser.Signal#_indexOfListener
  * @private
  * @param {function} listener - Signal handler function.
  * @param {object} [context=null] - Signal handler function.
  * @return {number} The index of the listener within the private bindings array.
  */
  private _indexOfListener(listener, context) {

    if (!this._bindings) {
      return -1;
    }

    if (context === undefined) { context = null; }

    var n = this._bindings.length;
    var cur;

    while (n--) {
      cur = this._bindings[n];

      if (cur._listener === listener && cur.context === context) {
        return n;
      }
    }

    return -1;

  };

  /**
  * Check if a specific listener is attached.
  *
  * @method Phaser.Signal#has
  * @param {function} listener - Signal handler function.
  * @param {object} [context] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
  * @return {boolean} If Signal has the specified listener.
  */
  has(listener, context) {
    return this._indexOfListener(listener, context) !== -1;
  };

  /**
  * Add an event listener for this signal.
  * An event listener is a callback with a related context and priority.
  * You can optionally provide extra arguments which will be passed to the callback after any internal parameters.
  * For example: `Phaser.Key.onDown` when dispatched will send the Phaser.Key object that caused the signal as the first parameter.
  * Any arguments you've specified after `priority` will be sent as well:
  * `fireButton.onDown.add(shoot, this, 0, 'lazer', 100);`
  * When onDown dispatches it will call the `shoot` callback passing it: `Phaser.Key, 'lazer', 100`.
  * Where the first parameter is the one that Key.onDown dispatches internally and 'lazer', 
  * and the value 100 were the custom arguments given in the call to 'add'.
  *
  * @method Phaser.Signal#add
  * @param {function} listener - The function to call when this Signal is dispatched.
  * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
  * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
  * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
  * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
  */
  add(listener: Function, listenerContext?: any, priority?: number, ...args: any[]) {

    this.validateListener(listener, 'add');

    var args = [];

    if (arguments.length > 3) {
      for (var i = 3; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
    }

    return this._registerListener(listener, false, listenerContext, priority, args);

  };

  /**
  * Add a one-time listener - the listener is automatically removed after the first execution.
  *
  * If there is as {@link Phaser.Signal#memorize memorized} event then it will be dispatched and
  * the listener will be removed immediately.
  *
  * @method Phaser.Signal#addOnce
  * @param {function} listener - The function to call when this Signal is dispatched.
  * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
  * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
  * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
  * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
  */
  addOnce(listener: Function, listenerContext?: any, priority?: number, ...args: any[]) {

    this.validateListener(listener, 'addOnce');

    var args = [];

    if (arguments.length > 3) {
      for (var i = 3; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
    }

    return this._registerListener(listener, true, listenerContext, priority, args);

  };

  /**
  * Remove a single event listener.
  *
  * @method Phaser.Signal#remove
  * @param {function} listener - Handler function that should be removed.
  * @param {object} [context=null] - Execution context (since you can add the same handler multiple times if executing in a different context).
  * @return {function} Listener handler function.
  */
  remove(listener, context) {

    this.validateListener(listener, 'remove');

    var i = this._indexOfListener(listener, context);

    if (i !== -1) {
      this._bindings[i]._destroy(); //no reason to a Phaser.SignalBinding exist if it isn't attached to a signal
      this._bindings.splice(i, 1);
    }

    return listener;

  };

  /**
  * Remove all event listeners.
  *
  * @method Phaser.Signal#removeAll
  * @param {object} [context=null] - If specified only listeners for the given context will be removed.
  */
  removeAll(context = null) {

    if (context === undefined) { context = null; }

    if (!this._bindings) {
      return;
    }

    var n = this._bindings.length;

    while (n--) {
      if (context) {
        if (this._bindings[n].context === context) {
          this._bindings[n]._destroy();
          this._bindings.splice(n, 1);
        }
      }
      else {
        this._bindings[n]._destroy();
      }
    }

    if (!context) {
      this._bindings.length = 0;
    }

  };

  /**
  * Gets the total number of listeners attached to this Signal.
  *
  * @method Phaser.Signal#getNumListeners
  * @return {integer} Number of listeners attached to the Signal.
  */
  getNumListeners() {

    return this._bindings ? this._bindings.length : 0;

  };

  /**
  * Stop propagation of the event, blocking the dispatch to next listener on the queue.
  *
  * This should be called only during event dispatch as calling it before/after dispatch won't affect another broadcast.
  * See {@link #active} to enable/disable the signal entirely.
  *
  * @method Phaser.Signal#halt
  */
  halt() {

    this._shouldPropagate = false;

  };

  /**
  * Dispatch / broadcast the event to all listeners.
  *
  * To create an instance-bound dispatch for this Signal, use {@link #boundDispatch}.
  *
  * @method Phaser.Signal#dispatch
  * @param {any} [params] - Parameters that should be passed to each handler.
  */
  dispatch(...params: any[]) {

    if (!this.active || !this._bindings) {
      return;
    }

    var paramsArr = Array.prototype.slice.call(arguments);
    var n = this._bindings.length;
    var bindings;

    if (this.memorize) {
      this._prevParams = paramsArr;
    }

    if (!n) {
      //  Should come after memorize
      return;
    }

    bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
    this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

    //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
    //reverse loop since listeners with higher priority will be added at the end of the list
    do {
      n--;
    }
    while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);

  };

  /**
  * Forget the currently {@link Phaser.Signal#memorize memorized} event, if any.
  *
  * @method Phaser.Signal#forget
  */
  forget() {

    if (this._prevParams) {
      this._prevParams = null;
    }

  };

  /**
  * Dispose the signal - no more events can be dispatched.
  *
  * This removes all event listeners and clears references to external objects.
  * Calling methods on a disposed objects results in undefined behavior.
  *
  * @method Phaser.Signal#dispose
  */
  dispose() {

    this.removeAll();

    this._bindings = null;
    if (this._prevParams) {
      this._prevParams = null;
    }

  }

  /**
  * A string representation of the object.
  *
  * @method Phaser.Signal#toString
  * @return {string} String representation of the object.
  */
  toString() {

    return '[Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';

  }

};


/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
* 
* @class Phaser.SignalBinding
* @constructor
* @param {Phaser.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
class SignalBinding {
  _listener: Function;
  _isOnce = false;
  context: any;
  _signal: Signal;
  _priority = 0;
  _args: any[] = null;
  callCount = 0;
  active = true;
  params: any[] | null;
  constructor(signal: Signal, listener: Function, isOnce: boolean, listenerContext, priority, args) {

    /**
    * @property {Phaser.Game} _listener - Handler function bound to the signal.
    * @private
    */
    this._listener = listener;

    if (isOnce) {
      this._isOnce = true;
    }

    if (listenerContext != null) /* not null/undefined */ {
      this.context = listenerContext;
    }

    /**
    * @property {Phaser.Signal} _signal - Reference to Signal object that listener is currently bound to.
    * @private
    */
    this._signal = signal;

    if (priority) {
      this._priority = priority;
    }

    if (args && args.length) {
      this._args = args;
    }
  }

  /**
  * Call listener passing arbitrary parameters.
  * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
  * @method Phaser.SignalBinding#execute
  * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
  * @return {any} Value returned by the listener.
  */
  execute(paramsArr) {

    var handlerReturn, params;

    if (this.active && !!this._listener) {
      params = this.params ? this.params.concat(paramsArr) : paramsArr;

      if (this._args) {
        params = params.concat(this._args);
      }

      handlerReturn = this._listener.apply(this.context, params);

      this.callCount++;

      if (this._isOnce) {
        this.detach();
      }
    }

    return handlerReturn;

  };

  /**
  * Detach binding from signal.
  * alias to: @see mySignal.remove(myBinding.getListener());
  * @method Phaser.SignalBinding#detach
  * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
  */
  detach() {
    return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
  };

  /**
  * @method Phaser.SignalBinding#isBound
  * @return {boolean} True if binding is still bound to the signal and has a listener.
  */
  isBound() {
    return (!!this._signal && !!this._listener);
  };

  /**
  * @method Phaser.SignalBinding#isOnce
  * @return {boolean} If SignalBinding will only be executed once.
  */
  isOnce() {
    return this._isOnce;
  };

  /**
  * @method Phaser.SignalBinding#getListener
  * @return {function} Handler function bound to the signal.
  */
  getListener() {
    return this._listener;
  };

  /**
  * @method Phaser.SignalBinding#getSignal
  * @return {Phaser.Signal} Signal that listener is currently bound to.
  */
  getSignal() {
    return this._signal;
  };

  /**
  * Delete instance properties
  * @method Phaser.SignalBinding#_destroy
  * @private
  */
  _destroy() {
    delete this._signal;
    delete this._listener;
    delete this.context;
  };

  /**
  * @method Phaser.SignalBinding#toString
  * @return {string} String representation of the object.
  */
  toString() {
    return '[SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
  }

};