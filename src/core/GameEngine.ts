import * as THREE from "three";
import { ILogger } from "./interfaces/ILogger";
import { LogMng } from "../utils/LogMng";
import { SceneMng } from "./scene/SceneMng";
import { Params } from "../game/data/Params";
import { FrontEvents } from "./events/FrontEvents";
import { DebugGui } from "../game/debug/DebugGui";
import { BasicScene } from "./scene/BasicScene";
import { Config } from "../game/data/Config";
import { SceneNames } from "../game/scenes/SceneNames";
import { InputMng } from "../utils/input/InputMng";
import { DeviceInfo } from "../utils/DeviceInfo";

type GameParams = {
    assetsPath: string;
    scenes: BasicScene[];
}

export class GameEngine implements ILogger {
    private _className = 'GameEngine';
    private _params: GameParams;
    private _sceneMng: SceneMng;
    private _stats: Stats;
    private _clock: THREE.Clock;

    constructor(aParams: GameParams) {
        this._params = aParams;
        Config.assetsPath = this._params.assetsPath;
        this._clock = new THREE.Clock();

        this.initLogging();
        this.initStats();
        this.initEvents();
        this.initScenes(this._params.scenes);
        this.initInputs(Params.render.canvasParent);
        this.animate();
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`${this._className}: ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`${this._className}: ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`${this._className}: ${aMsg}`, aData);
    }

    private initLogging() {
        // init debug mode
        Params.isDebugMode = window.location.hash === '#debug';
        // LogMng settings
        if (!Params.isDebugMode) LogMng.setMode(LogMng.MODE_RELEASE);
        LogMng.system('log mode: ' + LogMng.getMode());
    }

    private initStats() {
        if (Params.isDebugMode) {
            this._stats = new Stats();
            this._stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(this._stats.dom);
        }
    }

    private initEvents() {
        FrontEvents.onWindowResizeSignal.add(this.onWindowResize, this);
    }

    private initScenes(aScenes: BasicScene[]) {
        this._sceneMng = new SceneMng({
            scenes: aScenes
        });
        // start first scene in list
        this._sceneMng.startScene(this._params.scenes[0].name);
    }

    private initInputs(aDomCanvasParent: HTMLElement) {
        InputMng.getInstance({
            inputDomElement: aDomCanvasParent,
            desktop: DeviceInfo.getInstance().desktop,
            isRightClickProcessing: false
        });
    }

    private onWindowResize() {
        this._sceneMng.onWindowResize();
    }

    /**
     * Main cycle
     */
    private animate() {
        let dt = this._clock.getDelta();

        if (Params.isDebugMode) this._stats.begin();
        this.update(dt);
        this.render();
        if (Params.isDebugMode) this._stats.end();

        requestAnimationFrame(() => this.animate());
    }

    update(dt: number) {
        this._sceneMng.update(dt);
    }

    render() {
        this._sceneMng.render();
    }

}