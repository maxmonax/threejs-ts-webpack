import * as THREE from "three";
import { BasicScene } from "../../core/scene/BasicScene";
import { DebugGui } from "../debug/DebugGui";
import { Params } from "../data/Params";
import { SceneNames } from "./SceneNames";
import { ComposerRenderer } from "../../core/renderers/ComposerRenderer";
import { Config } from "../data/Config";
import { ParticleSystem } from "@/core/effects/ParticleSystem";
import { ThreeLoader } from "@/utils/threejs/ThreeLoader";
import { TextureAlias } from "../data/TextureData";
import { DemoScene } from "./DemoScene";

export class EffectScene extends DemoScene {
    private _effect: ParticleSystem;
    
    constructor() {
        super(SceneNames.EffectScene, {
            initRender: true,
            initScene: true,
            initCamera: true
        });
    }

    protected onInit() {
        this.initGuiSceneFolder();
        this.initObjects();
        this.initInputs();
        this.initDebug();

    }

    private initObjects() {
        const colorFactor = 1;

        let loader = ThreeLoader.getInstance();

        let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(1, 1, 1).multiplyScalar(100);
        this._scene.add(dirLight);
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this._scene.add(ambientLight);
        
        // effect
        this._effect = new ParticleSystem({
            parent: this._scene,
            camera: this._camera,
            texture: loader.getTexture(TextureAlias.particle),
            frequency: 60,
            lifeTime: 1,
            size: { min: 0.02, max: .1 },

            position: new THREE.Vector3(0, 0, 0),

            velocity: new THREE.Vector3(0, 0, 0),
            deltaVelocity: {
                x: { min: -.1, max: .1 },
                y: { min: 2, max: 3 },
                z: { min: -.1, max: .1 }
            },

            color: 0xff0000, //76e4ff,
            alphaChange: [
                { t: 0, val: 0 },
                // { t: 0.2, val: 1 },
                { t: 0.5, val: 1 },
                { t: 1.0, val: 0 }
            ],
            scaleFactorChange: [
                { t: 0, val: .05 },
                { t: 0.2, val: .2 },
                //{ t: 0.05, val: 2 },
                { t: 1, val: 0.01 },
            ]
        });

        // new TWEEN.Tween(this.rainbowReactor.position).to({ x: -2000, y: 0, z: 0 }, 3000).
        //     yoyo(true).repeat(20).easing(TWEEN.Easing.Sinusoidal.InOut).start();

        // debug gui
        let debugGui = DebugGui.getInstance();
        let gui = debugGui.gui;

    }

    private initInputs() {
        this.initCameraController({
            domElement: Params.render.canvasParent,
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
        // let axHeler = new THREE.AxesHelper(10);
        // this._scene.add(axHeler);
    }

    protected onFree() {
        super.onFree();
    }

    onWindowResize() {
        super.onWindowResize();
        this._effect?.onWindowResize();
    }

    update(dt: number) {
        this._effect?.update(dt);
    }

}
