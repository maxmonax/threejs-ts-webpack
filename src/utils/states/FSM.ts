import { LogMng } from "../logger/LogMng";
import { FsmState } from "./FsmState";

export class Fsm {
    private _states = new Map<string, FsmState>();
    private _currState?: FsmState;

    isCurrentState(aName: string): boolean {
        return this._currState && this._currState.name == aName;
    }

    getCurrentState(): FsmState {
        return this._currState;
    }

    addState(aState: FsmState): Fsm {
        this._states.set(aState.name, aState);
        return this;
    }

    setState(aName: string, aUserData: any = null) {

        if (this.isCurrentState(aName)) {
            return;
        }

        if (!this._states.has(aName)) {
            LogMng.warn(`Fsm -> Tried to set an uninitialized state ${aName}`);
            return;
        }

        this._currState?.exit();
        this._currState = this._states.get(aName);
        this._currState.enter();

    }

    update(dt: number): void {
        this._currState?.update(dt);
    }

    free() {
        this._currState = null;
        this._states = null;
    }

}