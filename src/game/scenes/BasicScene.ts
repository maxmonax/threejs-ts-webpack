import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ILogger } from "../interfaces/ILogger";
import { IUpdatable } from "../interfaces/IUpdatable";
import { LogMng } from "../../utils/LogMng";
import { Renderer } from "../renderers/Renderer";
import { Settings } from "../data/Settings";
import { Signal } from "../../utils/events/Signal";
import { SimpleRenderer } from "../renderers/SimpleRenderer";
import { CameraController, CameraControllerParams } from "../camera/CameraController";

type InitParams = {
    initRender?: boolean,
    initScene?: boolean,
    initCamera?: boolean
}

export class BasicScene implements ILogger, IUpdatable {
    private _name: string;
    private _params: InitParams;
    protected _render: Renderer;
    protected _scene: THREE.Scene;
    protected _camera: THREE.Camera;
    protected _cameraController: CameraController;

    onSceneStart = new Signal();

    constructor(aName: string, params?: InitParams) {
        this._name = aName;
        this._params = params;
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`${this._name}: ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`${this._name}: ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`${this._name}: ${aMsg}`, aData);
    }

    protected start(sceneName: string, aData?: any) {
        this.onSceneStart.dispatch(this, sceneName, aData);
    }

    protected initRenderer() {
        this._render = new SimpleRenderer({
            bgColor: Settings.render.bgColor,
            domCanvasParent: Settings.render.canvasParent
        });
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

    protected freeCamera() {
        if (this._camera) {
            if (this._scene) this._scene.remove(this._camera);
            this._camera = null;
            if (this._render) this._render.camera = null;
        }
    }

    protected freeScene() {
        if (this._render) this._render.scene = null;
    }

    protected freeRenderer() {
        if (this._render) this._render.free();
        this._render = null;
    }

    public get name(): string {
        return this._name;
    }

    init(aData?: any) {
        if (this._params?.initRender) this.initRenderer();
        if (this._params?.initScene) this.initScene();
        if (this._params?.initCamera) this.initCamera();
        this.onInit(aData);
    }

    free() {
        this.onFree();
        if (this._cameraController) this._cameraController.free();
        if (this._params?.initCamera) this.freeCamera();
        if (this._params?.initScene) this.freeScene();
        if (this._params?.initRender) this.freeRenderer();
    }

    initCameraController(aParams: CameraControllerParams) {
        this._cameraController = new CameraController(aParams);
    }

    protected onInit(aData?: any) {
        // for override
    }

    protected onFree() {
        // for override
    }

    onWindowResize() {
        this._render?.onWindowResize(innerWidth, innerHeight);
    }

    update(dt: number) {
        this._cameraController?.update(dt);
    }

    render() {
        if (this._params?.initRender == true) this._render.render();
    }

}