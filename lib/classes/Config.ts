/**
 * @module classes
 * @hidden
 */

import { InexistentContent } from "../errors.js";
import { callApi } from "../requests.js";
import { uniformize_string } from "../utils.js";
import { writeFile } from "fs";

/**
 * Classe permettant des opérations avec le fichier Config obtenu à l'endpoint general/config.
 * 
 */
export default class Config {
    private _file: V4Types.Config.General | undefined;

    constructor() {
        this._file = undefined;
    }

    private assertInited(): void {
        if (!this._file) {
            throw new InexistentContent("No file to search in. Please call Config.init first.");
        }
    }

    get file(): V4Types.Config.General | undefined {
        return this._file;
    }

    async init(): Promise<V4Types.Config.General> {
        const route = 'general/config';

        const response = await callApi(route);
        const data = await response.json() as V4Types.Config.General;
        this._file = data;

        return data;
    }

    getCategory(targetCategory: string | number): V4Types.Config.Category | undefined {
        this.assertInited();

        let category;
        if (typeof targetCategory === "string") {
            category = this._file!.categories.find((cat: V4Types.Config.Category) => uniformize_string(cat.name) === uniformize_string(targetCategory));
        } else {
            category = this._file!.categories.find((cat: V4Types.Config.Category) => cat.id === targetCategory);
        }

        if (category) {
            return category;
        }

        return undefined;
    }

    getType(targetType: string | number): V4Types.Config.Type | undefined {
        this.assertInited();

        const categories = this._file!.categories;

        for (const category of categories) {
            let type;
            if (typeof targetType === "string") {
                type = category.types.find((t: V4Types.Config.Type) => uniformize_string(t.name) === uniformize_string(targetType));
            } else {
                type = category.types.find((t: V4Types.Config.Type) => t.id === targetType);
            }

            if (type) {
                return type;
            }
        }

        return undefined;
    }

    getMachine(targetMachine: string | number): V4Types.Config.Machine | undefined {
        this.assertInited();

        const machines = this._file!.tags.machines;
        let machine;
        if (typeof targetMachine === "string") {
            machine = machines.find((m: V4Types.Config.Machine) => uniformize_string(m.name) === uniformize_string(targetMachine));
        } else {
            machine = machines.find((m: V4Types.Config.Machine) => m.id === targetMachine);
        }

        if (machine) {
            return machine;
        }

        return undefined;
    }

    getEvent(targetEvent: number | string): V4Types.Config.Event | undefined {
        this.assertInited();

        const events = this._file!.tags.events;
        let event;
        if (typeof targetEvent === "string") {
            event = events.find((e: V4Types.Config.Event) => uniformize_string(e.name) === uniformize_string(targetEvent));
        } else {
            event = events.find((e: V4Types.Config.Event) => e.id === targetEvent);
        }

        if (event) {
            return event;
        }

        return undefined;
    }

    getGenre(targetGenre: string | number): V4Types.Config.Genre | undefined {
        this.assertInited();

        const genres = this._file!.tags.genres;
        let genre
        
        if (typeof targetGenre === "string") {
            genre = genres.find((g: V4Types.Config.Genre) => uniformize_string(g.name) === uniformize_string(targetGenre));
        } else {
            genre = genres.find((g: V4Types.Config.Genre) => g.id === targetGenre);
        }

        if (genre) {
            return genre;
        }

        return undefined;
    }

    getTheme(targetTheme: string | number): V4Types.Config.Theme | undefined {
        this.assertInited();

        const themes = this._file!.tags.themes;
        let theme;
        if (typeof targetTheme === "string") {
            theme = themes.find((t: V4Types.Config.Theme) => uniformize_string(t.name) === uniformize_string(targetTheme));
        } else {
            theme = themes.find((t: V4Types.Config.Theme) => t.id === targetTheme);
        }

        if (theme) {
            return theme;
        }

        return undefined;
    }

    getMode(targetMode: string | number): V4Types.Config.Mode | undefined {
        this.assertInited();

        const modes = this._file!.tags.modes;
        let mode;
        if (typeof targetMode === "string") {
            mode = modes.find((m: V4Types.Config.Mode) => uniformize_string(m.name) === uniformize_string(targetMode));
        } else {
            mode = modes.find((m: V4Types.Config.Mode) => m.id === targetMode);

        }
        if (mode) {
            return mode;
        }

        return undefined;
    }

    getChronicle(targetChronicle: number | string): V4Types.Config.Chronicle | undefined {
        this.assertInited();

        const chronicles = this._file!.tags.chronicles;
        let chronicle;
        if (typeof targetChronicle === "string") {
            chronicle = chronicles.find((c: V4Types.Config.Chronicle) => uniformize_string(c.name) === uniformize_string(targetChronicle));
        } else {
            chronicle = chronicles.find((c: V4Types.Config.Chronicle) => c.id === targetChronicle);
        }

        if (chronicle) {
            return chronicle;
        }

        return undefined;
    }

    save(path: string): void {
        this.assertInited();

        const jsonString = JSON.stringify(this._file, null, 2);
        writeFile(path, jsonString, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}