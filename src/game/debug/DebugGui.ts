import * as datGui from "dat.gui";

export class DebugGui {
    private static _instance: DebugGui;
    private _gui: datGui.GUI;
    private _controllers: Map<string, datGui.GUIController>;

    private constructor() {
        if (DebugGui._instance) throw new Error("Double using DebugGui.constructor()!");
        this._gui = new datGui.GUI();
        this._controllers = new Map<string, datGui.GUIController>();
    }

    static getInstance() {
        if (!this._instance) this._instance = new DebugGui();
        return this._instance;
    }

    public get gui(): datGui.GUI {
        return this._gui;
    }

    addController(aAlias: string, aGuiController: datGui.GUIController) {
        this._controllers.set(aAlias, aGuiController);
    }

    removeController(aAlias: string) {
        let ctrl = this._controllers.get(aAlias);
        this._gui.remove(ctrl);
    }


}