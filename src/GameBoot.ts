import { GamePreloader } from './GamePreloader';
import { GameRender } from './GameRender';
import { LogMng } from "./utils/LogMng";
import { Settings } from './data/Settings';
import { Params } from './data/Params';
import { MyUtils } from './utils/MyUtils';
import { MyMath } from './utils/MyMath';

type InitParams = {
    assetsPath: string;
    domCanvasParent: HTMLElement;
    onLoadProgress?: (status: number) => void;
    onLoadComplete?: () => void;
};

export class GameBoot {

    private _initParams: InitParams;
    private _preloader: GamePreloader;
    private _inited = false;

    init(aParams: InitParams) {

        if (this._inited) {
            LogMng.warn('GameBoot -> Game is already inited!');
            return;
        }
        this._inited = true;

        this._initParams = aParams;

        // init debug mode
        Params.isDebugMode = window.location.hash === '#debug';

        // LogMng settings
        if (!Params.isDebugMode) LogMng.setMode(LogMng.MODE_RELEASE);
        LogMng.system('log mode: ' + LogMng.getMode());

        // Config setups
        Params.assetsPath = this._initParams.assetsPath;

        // GET Params
        this.readGETParams();

        // Preloader
        this.startPreloader();

    }

    private readGETParams() {

        const LIST = [
            {
                // anti aliasing
                keys: ['aa'],
                onReadHandler: (aValue: string) => {
                    Settings.AA_TYPE = Number(aValue);
                    LogMng.debug('Config.AA_TYPE = ' + Settings.AA_TYPE);
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

    private startPreloader() {
        this._preloader = new GamePreloader();

        let extOnLoadProgress: Function; 
        if (typeof this._initParams.onLoadProgress === 'function') {
            extOnLoadProgress = this._initParams.onLoadProgress;
        }

        this._preloader.onLoadProgressSignal.add((aProgressPercent: number) => {
            LogMng.debug(`loading: ${aProgressPercent}%`);
            if (extOnLoadProgress) extOnLoadProgress(aProgressPercent);
        }, this);

        this._preloader.onLoadCompleteSignal.addOnce(() => {
            this.onLoadingComplete();
            if (typeof this._initParams.onLoadComplete === 'function') {
                this._initParams.onLoadComplete();
            }
        }, this);

        this._preloader.start();
    }

    private onLoadingComplete() {
        new GameRender(this._initParams.domCanvasParent);
    }

}
