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

window.addEventListener('load', () => {
    Params.render.canvasParent = document.getElementById('game');
    new GameEngine({
        assetsPath: './assets/',
        scenes: [
            new BootScene(),
            new PreloaderScene(),
            new SphereScene(),
            new CubeScene(),
            new EffectScene(),
        ]
    });
}, false);

window.addEventListener('resize', () => {
    FrontEvents.onWindowResizeSignal.dispatch();
}, false);
