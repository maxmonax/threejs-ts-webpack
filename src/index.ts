import './html/css/main.css';
import './html/css/loader.css';
import { GameEngine } from './core/GameEngine';
import { FrontEvents } from './core/events/FrontEvents';
import { Params } from './game/data/Params';
import { SphereScene } from './game/scenes/SphereScene';
import { BootScene } from './game/scenes/BootScene';
import { PreloaderScene } from './game/scenes/PreloaderScene';
import { CubeScene } from './game/scenes/CubeScene';
import { EffectScene } from './game/scenes/EffectScene';
import { LogMng } from './utils/LogMng';

function initLogMng() {
    // init debug mode
    Params.isDebugMode = window.location.hash === '#debug';
    // LogMng settings
    if (!Params.isDebugMode) LogMng.setMode(LogMng.MODE_RELEASE);
    LogMng.system('log mode: ' + LogMng.getMode());
}

function initGameEngine() {
    new GameEngine({
        inputDomElement: Params.render.canvasParent,
        scenes: [
            new BootScene(),
            new PreloaderScene(),
            new SphereScene(),
            new CubeScene(),
            new EffectScene(),
        ]
    });
}

function initEvents() {
    window.addEventListener('resize', () => {
        FrontEvents.onWindowResizeSignal.dispatch();
    }, false);
}

window.addEventListener('load', () => {
    Params.render.canvasParent = document.getElementById('game');
    initLogMng();
    initGameEngine();
    initEvents();
}, false);
