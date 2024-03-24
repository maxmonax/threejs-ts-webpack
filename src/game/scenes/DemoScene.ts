import { BasicScene } from "../../core/scene/BasicScene";
import { DebugGui } from "../debug/DebugGui";
import { SceneNames } from "./SceneNames";

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
