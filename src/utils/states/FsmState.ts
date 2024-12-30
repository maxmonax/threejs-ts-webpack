import { Fsm } from "./Fsm";

export abstract class FsmState {
    private _name: string;
    private _fsm: Fsm;
    
    constructor(aName: string, aFsm: Fsm) {
        this._name = aName;
        this._fsm = aFsm;
    }

    public get name(): string {
        return this._name;
    }

    get fsm(): Fsm {
        return this._fsm;
    }

    enter() { }
    update(dt: number) { }
    exit() { }

}