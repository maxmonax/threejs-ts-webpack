import { ILogger } from "@/core/interfaces/ILogger";
import { LogMng } from "@/utils/logger/LogMng";
import * as datGui from "dat.gui";

type GuiElementType = 'field' | 'folder';

type ElementData = {
    alias: string,
    element: any,
    type: GuiElementType,
    folderAlias?: string
}

export class DebugGui implements ILogger {
    private _className = 'DebugGui';
    private static _instance: DebugGui;
    private _gui: datGui.GUI;
    private _elements: Map<string, ElementData>;

    private constructor() {
        if (DebugGui._instance) throw new Error("Double using DebugGui.constructor()!");
        this._gui = new datGui.GUI();
        this._elements = new Map();
    }

    static getInstance() {
        if (!this._instance) this._instance = new DebugGui();
        return this._instance;
    }

    logDebug(aMsg: string, aData?: any): void {
        LogMng.debug(`${this._className}: ${aMsg}`, aData);
    }

    logWarn(aMsg: string, aData?: any): void {
        LogMng.warn(`${this._className}: ${aMsg}`, aData);
    }

    logError(aMsg: string, aData?: any): void {
        LogMng.error(`${this._className}: ${aMsg}`, aData);
    }

    public get gui(): datGui.GUI {
        return this._gui;
    }

    addElement(aAlias: string, aElement: any, elementType: GuiElementType = 'field', aFolderName = '') {
        this._elements.set(aAlias, {
            alias: aAlias,
            element: aElement,
            type: elementType,
            folderAlias: aFolderName
        });
    }

    createFolder(aAlias: string): datGui.GUI {
        let f = this._gui.addFolder(aAlias);
        this.addElement(aAlias, f, 'folder');
        return f;
    }

    getElement(aAlias: string): datGui.GUIController | datGui.GUI {
        let ctrl = this._elements.get(aAlias);
        return ctrl.element;
    }

    removeElement(aAlias: string) {
        let ctrlData = this._elements.get(aAlias);
        this._elements.delete(aAlias);
        try {
            if (!ctrlData) return;
            switch (ctrlData.type) {
                case "field":
                    if (ctrlData.folderAlias.length > 0) {
                        let f = this.getElement(ctrlData.folderAlias);
                        f.remove(ctrlData.element);
                    }
                    else {
                        this._gui.remove(ctrlData.element);
                    }
                    break;
                case 'folder':
                    this._gui.removeFolder(ctrlData.element);
                    break;
            }
        } catch (error) {
            this.logError(`removeElement:`, error);
        }
        
    }

    /**
     * remove all elements
     */
    clear() {
        this._elements.forEach((aCtrl) => {
            this.removeElement(aCtrl.alias);
        });
    }


}