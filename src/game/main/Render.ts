import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ILogger } from "../interfaces/ILogger";
import { LogMng } from "../../utils/LogMng";

type AAType = 'NONE' | 'FXAA' | 'SMAA';

type Passes = {
    composer?: EffectComposer;
    renderPass: RenderPass;
    fxaaPass?: ShaderPass;
    smaaPass?: SMAAPass;
};

export class Render implements ILogger {

    private _scene: THREE.Scene;
    private _camera: THREE.Camera;
    private _aaType: AAType;
    private _renderer: THREE.WebGLRenderer;
    private _renderPixelRatio: number;
    private _passes: Passes;

    constructor(aParams: {
        bgColor: number,
        domCanvasParent: HTMLElement,
        aaType: string,
        scene?: THREE.Scene,
        camera?: THREE.Camera
    }) {

        let domContainer = aParams.domCanvasParent;
        let w = domContainer.clientWidth;
        let h = domContainer.clientHeight;

        this._aaType = aParams.aaType as AAType;
        if (aParams.scene) this._scene = aParams.scene;
        if (aParams.camera) this._camera = aParams.camera;

        const clearColor = new THREE.Color(aParams.bgColor);

        this._renderer = new THREE.WebGLRenderer({
            antialias: false
        });
        this._renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this._renderer.setSize(w, h);
        this._renderer.setClearColor(clearColor);
        this._renderPixelRatio = this._renderer.getPixelRatio();
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        this._renderer.outputEncoding = THREE.sRGBEncoding;
        this._renderer.toneMapping = THREE.LinearToneMapping;
        this._renderer.toneMappingExposure = 0.8;

        domContainer.appendChild(this._renderer.domElement);

        this.initPasses();
    }
    
    private initPasses() {

        const w = innerWidth;
        const h = innerHeight;

        this._passes = {
            renderPass: new RenderPass(this._scene, this._camera)
        };

        // anti-aliasing pass
        let aaPass: ShaderPass | SMAAPass;
        switch (this._aaType) {
            case 'NONE':
                break;

            case 'FXAA':
                // FXAA
                aaPass = this._passes.fxaaPass = new ShaderPass(FXAAShader);
                this._passes.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * this._renderPixelRatio);
                this._passes.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * this._renderPixelRatio);
                break;

            case 'SMAA':
                // SMAA
                aaPass = this._passes.smaaPass = new SMAAPass(w, h);
                break;

            default:
                LogMng.warn(`GameEngine -> Unknown anti-aliasing type: ${this._aaType}`);
                break;
        }

        // bloom pass
        const bloomParams = {
            bloomStrength: 1,
            bloomRadius: .5,
            bloomThreshold: 1
        };

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomParams.bloomStrength,
            bloomParams.bloomRadius,
            bloomParams.bloomThreshold
        );

        let rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, {
            type: THREE.FloatType,
            encoding: THREE.sRGBEncoding,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            samples: 4
        });

        this._passes.composer = new EffectComposer(this._renderer, rt);

        this._passes.composer.setPixelRatio(1);

        this._passes.composer.addPass(this._passes.renderPass);
        this._passes.composer.addPass(bloomPass);
        if (aaPass) this._passes.composer.addPass(aaPass);

        // debug gui bloom
        // let gui = Params.datGui;
        // if (gui) {
        //     gui.add(bloomParams, 'bloomStrength', 0, 10, 0.1).onChange((v) => {
        //         bloomPass.strength = v;
        //     });
        //     gui.add(bloomParams, 'bloomRadius', 0, 20, 0.1).onChange((v) => {
        //         bloomPass.radius = v;
        //     });
        //     gui.add(bloomParams, 'bloomThreshold', 0, 5, 0.1).onChange((v) => {
        //         bloomPass.threshold = v;
        //     });
        // }

    }
    
    public set scene(v: THREE.Scene) {
        this._scene = v;
        this._passes.renderPass.scene = this._scene;
    }

    public get scene(): THREE.Scene {
        return this._scene;
    }
    
    public set camera(v: THREE.Camera) {
        this._camera = v;
        this._passes.renderPass.camera = this._camera;
    }

    public get camera(): THREE.Camera {
        return this._camera;
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`Render -> ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`Render -> ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`Render -> ${aMsg}`, aData);
    }

    onWindowResize(w: number, h: number) {

        this._renderer.setSize(w, h);
        this._passes.composer.setSize(w, h);
        
        switch (this._aaType) {
            case 'FXAA':
                this._passes.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * this._renderPixelRatio);
                this._passes.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * this._renderPixelRatio);
                break;
        }

        if (this._camera && this._camera instanceof THREE.PerspectiveCamera) {
        // if (this._camera) {
            this._camera.aspect = w / h;
            this._camera.updateProjectionMatrix();
        }

    }

    render() {
        if (this._scene && this._camera) {
            this._passes.composer.render();
        }
    }

}