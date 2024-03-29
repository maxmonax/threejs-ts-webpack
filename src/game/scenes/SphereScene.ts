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

export class SphereScene extends DemoScene {
    private _effect: ParticleSystem;
    
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
            bgColor: Params.render.bgColor,
            domCanvasParent: Params.render.canvasParent,
            debugMode: Params.isDebugMode
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

        // objects
        let glowMagenta = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, 0, 1).multiplyScalar(colorFactor),
            toneMapped: false
        });

        let glowAqua = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0, 1, 1).multiplyScalar(colorFactor),
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

        // simple objects
        let simpleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff
        })
        let simpleObject1 = new THREE.Mesh(
            new THREE.SphereGeometry(.3, 20, 20),
            simpleMaterial
        )
        simpleObject1.position.set(-1.5, 0, 0);
        this._scene.add(simpleObject1);

        // debug gui
        if (Params.isDebugMode) {
            let debugGui = DebugGui.getInstance();
            let gui = debugGui.gui;
            const guiData = {
                colorFactor: colorFactor
            };
            debugGui.addElement('colorFactor', gui.add(guiData, 'colorFactor', 1, 10, .1).onChange((v) => {
                glowingSphere.material.color.setRGB(1, 0, 1).multiplyScalar(v);
                glowingSphere2.material.color.setRGB(0, 1, 1).multiplyScalar(v);
            }));
        }

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
        let axHeler = new THREE.AxesHelper(10);
        this._scene.add(axHeler);
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
