import { Signal } from "../events/Signal";
import { LogMng } from "../LogMng";

type InitParams = {
    inputDomElement: HTMLElement;
    desktop: boolean;
    isRightClickProcessing: boolean;
};

export class InputMng {

    private static instance: InputMng = null;
    private params: InitParams;

    isTouchDown = false;

    /**
     * Current client input position
     */
    clientX = 0;
    clientY = 0;

    /**
     * Down client input position
     */
    downClientX = 0;
    downClientY = 0;

    /**
     * Up client input position
     */
    upClientX = 0;
    upClientY = 0;

    /**
     * Normalized current input position
     */
    normalPos = {
        x: 0,
        y: 0
    };

    /**
     * Normalized down input position
     */
    normalDown = {
        x: 0,
        y: 0
    };

    /**
     * Normalized up input position
     */
    normalUp = {
        x: 0,
        y: 0
    };

    /**
     * Set of keys down
     */
    keysDown = {};

    /**
     * (keyCode: string, key: string)
     */
    onKeyDownSignal = new Signal();

    /**
     * (keyCode: string, key: string)
     */
    onKeyUpSignal = new Signal();

    /**
     * (client_x, client_y)
     */
    onInputDownSignal = new Signal();

    /**
     * (client_x, client_y)
     */
    onInputUpSignal = new Signal();

    /**
     * (client_x, client_y)
     */
    onInputMoveSignal = new Signal();

    /**
     * (client_x, client_y)
     */
    onContextMenuSignal = new Signal();
    

    private constructor(aParams: InitParams) {

        this.params = aParams;

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            // LogMng.debug('keydown event code: ' + event.code);
            // LogMng.debug('keydown event key: ' + event.key);
            this.keysDown[event.code] = true;
            this.onKeyDownSignal.dispatch(event.code, event.key);
        }, false);

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            // LogMng.debug('keyup event: ' + event.code);
            this.keysDown[event.code] = false;
            this.onKeyUpSignal.dispatch(event.code, event.key);
        }, false);

        let dom = this.params.inputDomElement;

        if (dom) {

            // if (this.params.desktop) {
            LogMng.debug(`InputMng: init input events...`);

            dom.addEventListener('mousemove', (e: MouseEvent) => {

                // LogMng.debug(`mousemove: x: ${e.clientX}, y: ${e.clientY}`);

                this.clientX = e.clientX;
                this.clientY = e.clientY;

                // for 3d
                this.normalPos = {
                    x: (e.clientX / dom.clientWidth) * 2 - 1,
                    y: -(e.clientY / dom.clientHeight) * 2 + 1
                }

                if (this.params.desktop) {
                    this.onInputMoveSignal.dispatch(this.clientX, this.clientY);
                }

            }, true);

            dom.addEventListener('pointerdown', (e: PointerEvent) => {

                // e.button: 0 - left, 1 - middle, 2 - right

                // LogMng.debug(`mousedown: x: ${e.clientX}, y: ${e.clientY}`);
                // LogMng.debug(`pointerdown: button == ${e.button}`);

                if (this.params.desktop && e.button != 0) return;

                this.downClientX = e.clientX;
                this.downClientY = e.clientY;

                // for 3d
                this.normalDown = {
                    x: (e.clientX / dom.clientWidth) * 2 - 1,
                    y: -(e.clientY / dom.clientHeight) * 2 + 1
                }

                this.onInputDownSignal.dispatch(this.downClientX, this.downClientY);
            }, true);

            dom.addEventListener("pointerup", (e: PointerEvent) => {

                // LogMng.debug(`mouseup: x: ${e.clientX}, y: ${e.clientY}`);

                if (this.params.desktop && e.button != 0) return;

                this.upClientX = e.clientX;
                this.upClientY = e.clientY;

                // for 3d
                this.normalUp = {
                    x: (e.clientX / dom.clientWidth) * 2 - 1,
                    y: -(e.clientY / dom.clientHeight) * 2 + 1
                }

                this.onInputUpSignal.dispatch(e.clientX, e.clientY);
            }, true);

            // }
            // else {
            //     LogMng.debug(`init mouse events for mobile`);

            //     dom.addEventListener("touchstart", (e) => {
            //         var touches = e.changedTouches;
            //         if (touches.length > 1)
            //             return;
            //         var t = touches[0];
            //         this.currInputClientX = this.inputDownClientX = t.clientX;
            //         this.currInputClientY = this.inputDownClientY = t.clientY;
            //         this.isTouchDown = true;
            //         this.onInputDownSignal.dispatch(t.clientX, t.clientY);
            //     }, false);

            //     dom.addEventListener("touchmove", (e) => {
            //         let touches = e.changedTouches;
            //         if (touches.length > 1)
            //             return;
            //         let t = touches[0];
            //         this.currInputClientX = t.clientX;
            //         this.currInputClientY = t.clientY;
            //     }, false);

            //     dom.addEventListener("touchend", (e) => {
            //         var touches = e.changedTouches;
            //         if (touches.length > 1)
            //             return;
            //         var t = touches[0];
            //         this.isTouchDown = false;
            //         this.onInputUpSignal.dispatch(t.clientX, t.clientY);
            //     }, false);
            // }

            if (this.params.desktop && aParams.isRightClickProcessing) {
                window.oncontextmenu = () => {
                    this.onContextMenuSignal.dispatch(this.clientX, this.clientY);
                    return false; // cancel default menu
                };
            }

        }
        else {
            LogMng.warn(`InputMng: undefined input DOM element = ${this.params.inputDomElement}`);
            console.log('init params:', this.params);
        }

    }

    static getInstance(aParams?: InitParams): InputMng {
        if (!InputMng.instance) {
            if (aParams) {
                if (InputMng.instance) throw new Error("Reinicialization of InputMng, use single inicialization point");
                InputMng.instance = new InputMng(aParams);
            }
            else {
                LogMng.error('InputMng.getInstance(): aParams = null!');
            }
        }
        return InputMng.instance;
    }

    isKeyDown(aKey: string): boolean {
        return this.keysDown[aKey];
    }

    update() {

    }

}
