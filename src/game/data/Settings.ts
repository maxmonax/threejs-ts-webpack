import { AAType } from "../main/Render";

/**
 * Global parameters
 */
export class Settings {

    // modes
    static isDebugMode = false;

    static render = {
        canvasParent: null as HTMLElement,
        bgColor: 0x0,
        aaType: 'FXAA' as AAType
    }

};
