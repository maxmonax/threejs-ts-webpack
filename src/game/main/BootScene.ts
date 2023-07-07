import { LogMng } from "../../utils/LogMng";
import { Settings } from '../data/Settings';
import { MyUtils } from '../../utils/MyUtils';
import { AAType } from "./Render";
import { BasicScene } from "./BasicScene";
import { SceneNames } from "../scenes/SceneTypes";

export class BootScene extends BasicScene {

    constructor() {
        super(SceneNames.BootScene);
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`GameBoot: ${aMsg}`, aData);
    }
    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`GameBoot: ${aMsg}`, aData);
    }
    logError(aMsg: string, aData?: any): void {
        LogMng.error(`GameBoot: ${aMsg}`, aData);
    }

    onInit() {
        // GET Params
        this.readGETParams();
        this.start(SceneNames.PreloaderScene);
    }
    
    private readGETParams() {

        const LIST = [
            {
                // anti aliasing
                keys: ['aa'],
                onReadHandler: (aValue: string) => {
                    Settings.render.aaType = aValue as AAType || 'NONE';
                    LogMng.debug('Settings: aaType = ' + Settings.render.aaType);
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
