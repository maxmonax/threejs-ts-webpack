import { ThreeLoader } from '../../utils/threejs/ThreeLoader';
import { TEXTURE_LOAD_LIST } from '../data/TextureData';
import { MODEL_LOAD_LIST } from '../data/ModelData';
import { BasicScene } from '../../core/scene/BasicScene';
import { SceneNames } from './SceneNames';
import { Config } from '../data/Config';

export class PreloaderScene extends BasicScene {
    private _loader: ThreeLoader;
    private _assetsPath: string;

    constructor() {
        super(SceneNames.PreloaderScene);
    }

    onInit() {
        this._assetsPath = Config.assetsPath;
        // init ThreeLoader
        this._loader = ThreeLoader.getInstance({
            retryCount: 2
        });
        let setId = this._loader.createNewSet({
            context: this,
            onProgress: this.onLoadProgress,
            onComplete: this.onLoadComplete
        });
        this.addAssetsToLoader(setId);
        this._loader.startSetLoading(setId);
    }
    
    private addAssetsToLoader(aSetId: number) {

        let assetsPath = this._assetsPath;
        
        // models
        let modelsPath = `${assetsPath}models/`;
        for (let i = 0; i < MODEL_LOAD_LIST.length; i++) {
            const item = MODEL_LOAD_LIST[i];
            this._loader.addFileToSet(aSetId, {
                alias: item.alias,
                file: modelsPath + item.file
            });
        }

        // textures
        let texturesPath = `${assetsPath}textures/`;
        for (let i = 0; i < TEXTURE_LOAD_LIST.length; i++) {
            const item = TEXTURE_LOAD_LIST[i];
            this._loader.addFileToSet(aSetId, {
                alias: item.alias,
                file: texturesPath + item.file
            });
        }

    }

    private onLoadProgress(aProgressPercent: number) {
        
    }

    private onLoadComplete() {
        // event for front GUI loading bar
        document.getElementById('loader').remove();
        this.startScene(SceneNames.SphereScene);
    }

}
