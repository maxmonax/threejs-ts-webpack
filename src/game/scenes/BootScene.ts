import { LogMng } from "../../utils/LogMng";
import { MyUtils } from '../../utils/MyUtils';
import { BasicScene } from "../../core/scene/BasicScene";
import { SceneNames } from "./SceneNames";

export class BootScene extends BasicScene {

    constructor() {
        super(SceneNames.BootScene);
    }

    onInit() {
        // GET Params
        this.readGETParams();
        this.startScene(SceneNames.PreloaderScene);
    }
    
    private readGETParams() {

        const LIST = [
            {
                // anti aliasing
                keys: ['aa'],
                onReadHandler: (aValue: string) => {
                    // Settings.render.aaType = aValue as AAType || 'NONE';
                    // this.logDebug('Settings: aaType = ' + Settings.render.aaType);
                }
            }
        ];

        for (let i = 0; i < LIST.length; i++) {
            const listItem = LIST[i];
            const keys = listItem.keys;
            for (let j = 0; j < keys.length; j++) {
                const getName = keys[j];
                let qValue = MyUtils.getQueryValue(getName);
                if (qValue != null && qValue != undefined) {
                    listItem.onReadHandler(qValue);
                }
            }
        }

    }
    
}
