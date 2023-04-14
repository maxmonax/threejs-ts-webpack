import * as THREE from "three";
import * as datGui from "dat.gui";
import { ILogger } from "../interfaces/ILogger";
import { IUpdatable } from "../interfaces/IUpdatable";
import { LogMng } from "../utils/LogMng";
import { Game } from "./Game";
import { Render } from "./Render";

export class BasicScene implements ILogger, IUpdatable {

    private _game: Game;
    private _render: Render;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;

    constructor(aGame: Game, aRender: Render) {
        this._game = aGame;
        this._render = aRender;
        this.initScene();
        this.initCamera();
    }

    public set scene(v: THREE.Scene) {
        this._scene = v;
    }

    public get scene(): THREE.Scene {
        return this._scene;
    }
    
    public set camera(v: THREE.Camera) {
        this._camera = v;
    }

    public get camera(): THREE.Camera {
        return this._camera;
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`BasicScene -> ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`BasicScene -> ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`BasicScene -> ${aMsg}`, aData);
    }

    protected initScene() {
        this._scene = new THREE.Scene();
        this._render.scene = this._scene;
    }

    protected initCamera() {
        const w = innerWidth;
        const h = innerHeight;
        this._camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
        this._camera.position.set(10, 5, 10);
        this._camera.lookAt(new THREE.Vector3(0, 0, 0));
        this._scene.add(this._camera);
        this._render.camera = this._camera;
    }

    init(...params) {

    }

    load() {

    }

    create() {

    }

    onWindowResize() {
        
    }

    render() {
        this._render.render();
    }
    
    update(dt: number) {

    }

}