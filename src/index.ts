import { GameEngine } from './game/main/GameEngine';
import { FrontEvents } from './game/events/FrontEvents';
import './html/css/main.css';
import './html/css/loader.css';
import { Settings } from './game/data/Settings';
import { DemoScene } from './game/main/DemoScene';
import { BootScene } from './game/main/BootScene';
import { PreloaderScene } from './game/main/PreloaderScene';

window.addEventListener('load', () => {
    Settings.render.canvasParent = document.getElementById('game');
    new GameEngine({
        assetsPath: './assets/',
        scenes: [
            new BootScene(),
            new PreloaderScene(),
            new DemoScene()
        ]
    });
}, false);

window.addEventListener('resize', () => {
    FrontEvents.onWindowResizeSignal.dispatch();
}, false);
