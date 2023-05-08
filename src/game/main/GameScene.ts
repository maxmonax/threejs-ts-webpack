import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { InputMng } from "../../utils/input/InputMng";
import { DeviceInfo } from "../../utils/DeviceInfo";
import { LogMng } from "../../utils/LogMng";
import { MyMath } from "../../utils/MyMath";
import { BasicScene } from "./BasicScene";
import { DebugGui } from "../debug/DebugGui";

export class GameScene extends BasicScene {

    private orbitControl: OrbitControls;
    

    init(aDomCanvasParent: HTMLElement) {
        
        this.initObjects();
        this.initInput(aDomCanvasParent);
        this.initOrbitControl({
            domElement: aDomCanvasParent,
            camera: this.camera,
            enabled: true,
            minDist: 1,
            maxDist: 40,
            stopAngleTop: 10,
            stopAngleBot: 170
        });

    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`GameScene -> ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`GameScene -> ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`GameScene -> ${aMsg}`, aData);
    }

    private initObjects() {
        
        let light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(1, 1, 1).setScalar(100);
        this.scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

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
        this.scene.add(glowingSphere);

        let glowingSphere2 = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.5, 2),
            glowAqua
        );
        this.scene.add(glowingSphere2);

        let sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.5),
            new THREE.MeshLambertMaterial({ color: new THREE.Color(1, 0.5, 0.1) })
        );
        this.scene.add(sphere);

        [sphere, glowingSphere, glowingSphere2].forEach((s, i) => {
            let a = (i * Math.PI * 2) / 3;
            s.position
                .set(Math.cos(a), 0, Math.sin(-a))
                .setLength(3);
        });

        // debug gui
        let gui = DebugGui.getInstance().gui;

        const guiData = {
            colorFactor: 8
        };

        if (gui) {
            gui.add(guiData, 'colorFactor', 1, 20, 1).onChange((v) => {
                glowingSphere.material.color.setRGB(1, 0, 1).multiplyScalar(v);
                glowingSphere2.material.color.setRGB(0, 1, 1).multiplyScalar(v);
            });
        }

    }

    private initInput(aDomCanvasParent: HTMLElement) {
        InputMng.getInstance({
            inputDomElement: aDomCanvasParent,
            desktop: DeviceInfo.getInstance().desktop,
            isRightClickProcessing: false
        });
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

        if (this.orbitControl) return;
        let domElement = aParams.domElement;
        this.orbitControl = new OrbitControls(aParams.camera, domElement);
        this.orbitControl.enabled = aParams.enabled;
        this.orbitControl.rotateSpeed = .5;
        this.orbitControl.enableDamping = true;
        this.orbitControl.dampingFactor = .9;
        this.orbitControl.zoomSpeed = aParams.zoomSpeed || 1;
        this.orbitControl.enablePan = aParams.enablePan == true;
        this.orbitControl.minDistance = aParams.minDist || 1;
        this.orbitControl.maxDistance = aParams.maxDist || 100;
        this.orbitControl.minPolarAngle = MyMath.toRadian(aParams.stopAngleTop || 0);
        this.orbitControl.maxPolarAngle = MyMath.toRadian(aParams.stopAngleBot || 0);
        this.orbitControl.autoRotateSpeed = 0.05;
        this.orbitControl.autoRotate = true;

        this.orbitControl.target = new THREE.Vector3();
        this.orbitControl.update();
        // this.orbitControl.addEventListener('change', () => {
        // });
        // this.orbitControl.addEventListener('end', () => {
        // });

    }
    
    update(dt: number) {
        
    }

}
