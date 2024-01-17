import * as THREE from "three";
import { BasicScene } from "./BasicScene";
import { DebugGui } from "../debug/DebugGui";
import { Settings } from "../data/Settings";
import { SceneNames } from "./SceneTypes";
import { ComposerRenderer } from "../renderers/ComposerRenderer";
import { Config } from "../data/Config";

export class SphereScene extends BasicScene {
    
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

    protected onInit() {
        this.initObjects();
        this.initInputs();
        this.initDebug();

    }

    private initObjects() {
        const colorFactor = 1;

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
        let debugGui = DebugGui.getInstance();
        let gui = debugGui.gui;

        const guiData = {
            colorFactor: colorFactor
        };

        let colorFactorGuiController = gui.add(guiData, 'colorFactor', 1, 10, .1).onChange((v) => {
            glowingSphere.material.color.setRGB(1, 0, 1).multiplyScalar(v);
            glowingSphere2.material.color.setRGB(0, 1, 1).multiplyScalar(v);
        });

        debugGui.addController('colorFactor', colorFactorGuiController);

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

    protected onFree() {
        // debug gui
        let debugGui = DebugGui.getInstance();
        debugGui.removeController('colorFactor');
    }

    update(dt: number) {
        
    }

}
