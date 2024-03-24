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

export class DemoScene extends BasicScene {

    protected initGuiSceneFolder() {
        if (!DebugGui.getInstance()) return;
        let DATA = {
            spheres: () => {
                this.startScene(SceneNames.SphereScene);
            },
            cubes: () => {
                this.startScene(SceneNames.CubeScene);
            },
            effects: () => {
                this.startScene(SceneNames.EffectScene);
            }
        }
        let f = DebugGui.getInstance().createFolder('Scenes');
        f.add(DATA, 'spheres').name('Spheres Scene');
        f.add(DATA, 'cubes').name('Cubes Scene');
        f.add(DATA, 'effects').name('Effects Scene');
        f.open();
    }

    protected onFree() {
        DebugGui.getInstance()?.clear();
    }

}
