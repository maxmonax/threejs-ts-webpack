import * as THREE from "three";
import { ILogger } from "../interfaces/ILogger";
import { LogMng } from "../../utils/LogMng";
import { BootScene } from "./BootScene";
import { PreloaderScene } from "./PreloaderScene";
import { SceneMng } from "./SceneMng";
import { Settings } from "../data/Settings";
import { FrontEvents } from "../events/FrontEvents";
import { DebugGui } from "../debug/DebugGui";
import { BasicScene } from "./BasicScene";
import { Config } from "../data/Config";

type GameParams = {
    assetsPath: string;
    scenes: BasicScene[];
}

export class GameEngine implements ILogger {

    private _params: GameParams;
    private _sceneMng: SceneMng;
    private _stats: Stats;
    private _clock: THREE.Clock;

    constructor(aParams: GameParams) {

        this._params = aParams;

        Config.assetsPath = this._params.assetsPath;

        this.initDebugMode();
        this.initScenes(this._params.scenes);
        // this.initRenderer(this._params.canvasParent);
        // this.startPreloader(aParams.assetsPath);
        this.initEvents();

        this._clock = new THREE.Clock();
        this.animate();

    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`Game: ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`Game: ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`Game: ${aMsg}`, aData);
    }

    private initDebugMode() {
        // init debug mode
        Settings.isDebugMode = window.location.hash === '#debug';
        // LogMng settings
        if (!Settings.isDebugMode) LogMng.setMode(LogMng.MODE_RELEASE);
        LogMng.system('log mode: ' + LogMng.getMode());
        this.initStats();
        this.initDebugGui();
    }

    private initStats() {
        if (Settings.isDebugMode) {
            this._stats = new Stats();
            this._stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(this._stats.dom);
        }
    }

    private initDebugGui() {
        if (Settings.isDebugMode) DebugGui.getInstance();
    }

    private initEvents() {
        FrontEvents.onWindowResizeSignal.add(this.onWindowResize, this);
    }

    private onWindowResize() {
        // if (this._gameScene) this._gameScene.onWindowResize();
        this._sceneMng.onWindowResize();
    }

    private initScenes(aScenes: BasicScene[]) {
        this._sceneMng = new SceneMng({
            scenes: aScenes
        });
        this._sceneMng.startScene(this._params.scenes[0].name);
    }

    private animate() {
        let dt = this._clock.getDelta();

        if (Settings.isDebugMode) this._stats.begin();
        this.update(dt);
        this.render();
        if (Settings.isDebugMode) this._stats.end();

        requestAnimationFrame(() => this.animate());
    }

    update(dt: number) {
        this._sceneMng.update(dt);
    }

    render() {
        this._sceneMng.render();
    }

}