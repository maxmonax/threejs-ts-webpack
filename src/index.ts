import { Game } from './main/Game';
import { FrontEvents } from './events/FrontEvents';
import './_html/css/main.css';
import './_html/css/loader.css';

window.addEventListener('load', () => {
    new Game({
        canvasParent: document.getElementById('game'),
        assetsPath: './assets/',
        onLoadComplete: () => {
            // event for front GUI loading bar
            document.getElementById('loader').remove();
        }
    });
}, false);

window.addEventListener('resize', () => {
    FrontEvents.onWindowResizeSignal.dispatch();
}, false);
