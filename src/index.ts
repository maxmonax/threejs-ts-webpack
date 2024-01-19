import './html/css/main.css';
import './html/css/loader.css';
import { GameEngine } from './core/GameEngine';
import { FrontEvents } from './core/events/FrontEvents';
import { Settings } from './game/data/Settings';
import { SphereScene } from './game/scenes/SphereScene';
import { BootScene } from './game/scenes/BootScene';
import { PreloaderScene } from './game/scenes/PreloaderScene';
import { CubeScene } from './game/scenes/CubeScene';

window.addEventListener('load', () => {
    Settings.render.canvasParent = document.getElementById('game');
    new GameEngine({
        assetsPath: './assets/',
        scenes: [
            new BootScene(),
            new PreloaderScene(),
            new SphereScene(),
            new CubeScene(),
        ]
    });
}, false);

window.addEventListener('resize', () => {
    FrontEvents.onWindowResizeSignal.dispatch();
}, false);
