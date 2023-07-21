import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { InputMng } from "../../utils/input/InputMng";
import { DeviceInfo } from "../../utils/DeviceInfo";
import { LogMng } from "../../utils/LogMng";
import { MyMath } from "../../utils/MyMath";
import { BasicScene } from "./BasicScene";
import { DebugGui } from "../debug/DebugGui";
import { Settings } from "../data/Settings";
import { SceneNames } from "./SceneTypes";
import { ComposerRenderer } from "../renderers/ComposerRenderer";
import { Config } from "../data/Config";

export class SphereScene extends BasicScene {
    private _orbitControl: OrbitControls;
    
    constructor() {
        super(SceneNames.SphereScene, {
            initRender: true,
            initScene: true,
            initCamera: true
        });
    }

    protected initRenderer() {
        this._render = new ComposerRenderer({
            aaType: 'FXAA',
            bgColor: Settings.render.bgColor,
            domCanvasParent: Settings.render.canvasParent
        });
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`SphereScene: ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`SphereScene: ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`SphereScene: ${aMsg}`, aData);
    }

    protected onInit() {
        this.initObjects();
        this.initOrbitControl({
            domElement: Settings.render.canvasParent,
            camera: this._camera,
            enabled: true,
            minDist: 1,
            maxDist: 40,
            stopAngleTop: 10,
            stopAngleBot: 170
        });
        this.initInputs();
        this.initDebug();

    }

    private initObjects() {
        
        let light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(1, 1, 1).multiplyScalar(100);
        this._scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

        // objects
        let glowMagenta = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, 0, 1).multiplyScalar(8),
            toneMapped: false
        });

        let glowAqua = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0, 1, 1).multiplyScalar(8),
            toneMapped: false,
            wireframe: true
        });

        let glowingSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 20, 20),
            glowMagenta.clone()
        );
        this._scene.add(glowingSphere);

        let glowingSphere2 = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.5, 2),
            glowAqua
        );
        this._scene.add(glowingSphere2);

        let sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.5),
            new THREE.MeshLambertMaterial({ color: new THREE.Color(1, 0.5, 0.1) })
        );
        this._scene.add(sphere);

        [sphere, glowingSphere, glowingSphere2].forEach((s, i) => {
            let a = (i * Math.PI * 2) / 3;
            s.position
                .set(Math.cos(a), 0, Math.sin(-a))
                .setLength(3);
        });

        // debug gui
        let debugGui = DebugGui.getInstance();
        let gui = debugGui.gui;

        const guiData = {
            colorFactor: 8
        };

        let colorFactorGuiController = gui.add(guiData, 'colorFactor', 1, 20, 1).onChange((v) => {
            glowingSphere.material.color.setRGB(1, 0, 1).multiplyScalar(v);
            glowingSphere2.material.color.setRGB(0, 1, 1).multiplyScalar(v);
        });

        debugGui.addController('colorFactor', colorFactorGuiController);

    }

    private initOrbitControl(aParams: {
        domElement: HTMLElement,
        camera: THREE.Camera,
        enabled?: boolean,
        zoomSpeed?: number,
        enablePan?: boolean,
        panRadius?: number,
        minDist?: number,
        maxDist?: number,
        stopAngleTop?: number,
        stopAngleBot?: number
    }) {

        if (this._orbitControl) return;
        let domElement = aParams.domElement;
        this._orbitControl = new OrbitControls(aParams.camera, domElement);
        this._orbitControl.enabled = aParams.enabled;
        this._orbitControl.rotateSpeed = .5;
        this._orbitControl.enableDamping = true;
        this._orbitControl.dampingFactor = .9;
        this._orbitControl.zoomSpeed = aParams.zoomSpeed || 1;
        this._orbitControl.enablePan = aParams.enablePan == true;
        this._orbitControl.minDistance = aParams.minDist || 1;
        this._orbitControl.maxDistance = aParams.maxDist || 100;
        this._orbitControl.minPolarAngle = MyMath.toRadian(aParams.stopAngleTop || 0);
        this._orbitControl.maxPolarAngle = MyMath.toRadian(aParams.stopAngleBot || 0);
        this._orbitControl.autoRotateSpeed = 0.05;
        this._orbitControl.autoRotate = true;

        this._orbitControl.target = new THREE.Vector3();
        this._orbitControl.update();
        // this.orbitControl.addEventListener('change', () => { });
        // this.orbitControl.addEventListener('end', () => { });

    }

    private initInputs() {
        this.initCameraController({
            domElement: Settings.render.canvasParent,
            camera: this._camera,
            orbitController: {
                minDist: 1,
                maxDist: Config.game.meterSize * 100,
                stopAngleTop: 10,
                stopAngleBot: 170
            }
        });
        this._cameraController.enableOrbitController();
    }

    private initDebug() {
        let axHeler = new THREE.AxesHelper(10);
        this._scene.add(axHeler);
    }

    private finitOrbitControl() {
        if (!this._orbitControl) return;
        this._orbitControl.enabled = false;
        this._orbitControl.dispose();
        this._orbitControl = null;
    }

    protected onFinit() {
        this.finitOrbitControl();
        // debug gui
        let debugGui = DebugGui.getInstance();
        debugGui.removeController('colorFactor');
    }
    
    update(dt: number) {
        this._orbitControl.update();
    }

}
