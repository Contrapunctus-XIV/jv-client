/**
 * @module classes
 * @hidden
 */

import { GG_JWT_TOKENS } from "../vars.js";
import { callGG } from "../requests.js";

export default class GGConfig {
    private _file: undefined | GGTypes.Game.Query | GGTypes.News.Query | GGTypes.Review.Query | GGTypes.Video.Query | GGTypes.Preview.Query | GGTypes.Folder.Query;

    constructor() {
        this._file = undefined;
    }

    get file() {
        return this._file;
    }

    private assertInited(): void {
        if (!this._file) {
            throw new Error("L'instance de GGConfig n'a pas récupéré le contenu de config/content/filters. Appelez Config.init().");
        }
    }

    init(category: "game"): Promise<GGTypes.Game.Query>;
    init(category: "news"): Promise<GGTypes.News.Query>;
    init(category: "review"): Promise<GGTypes.Video.Query>;
    init(category: "preview"): Promise<GGTypes.Preview.Query>;
    init(category: "video"): Promise<GGTypes.Video.Query>;
    init(category: "folder"): Promise<GGTypes.Folder.Query>;
    async init(category: "game" | "news" | "review" | "preview" | "video" | "folder"): Promise<GGTypes.Game.Query | GGTypes.News.Query | GGTypes.Review.Query | GGTypes.Preview.Query | GGTypes.Video.Query | GGTypes.Folder.Query> {
        const token = GG_JWT_TOKENS[category];

        const route = `config/content/filters/${token}`;
        const response = await callGG(route);
        const data = await response.json();

        this._file = data.data;
        return data.data;
    }

    getOptions() {
        this.assertInited();

        return Object.fromEntries(this._file!.map((query: any) => [query.key, query.options.map((option: GGTypes.Option) => option.value)]));
    }

    getOptionDetails(optionValue: string): GGTypes.Option | undefined {
        this.assertInited();

        for (const query of this._file!) {
            const option = query.options.find((o: GGTypes.Option) => o.value === optionValue);
            if (option) {
                return option;
            }
        }

        return undefined;
    }

    private static getIdFromUrlPath(urlPath: string | null): number | undefined {
        if (!urlPath) {
            return undefined;
        }

        const match = urlPath.match(/(\d+)/);

        if (match) {
            return parseInt(match[1]);
        }

        return undefined;
    }

    getOptionId(optionValue: string): number | undefined {
        this.assertInited();

        for (const query of this._file!) {
            const option = query.options.find((o: GGTypes.Option) => o.value === optionValue);
            if (option) {
                return GGConfig.getIdFromUrlPath(option.urlPath);
            }
        }

        return undefined;
    }

    getOptionDetailsFromId(optionId: number): GGTypes.Option | undefined {
        this.assertInited();

        for (const query of this._file!) {
            const option = query.options.find((o: GGTypes.Option) => GGConfig.getIdFromUrlPath(o.urlPath) === optionId);
            if (option) {
                return option;
            }
        }

        return undefined;
    }

    getOptionValueFromId(optionId: number): string | undefined {
        this.assertInited();

        for (const query of this._file!) {
            const option = query.options.find((o: GGTypes.Option) => GGConfig.getIdFromUrlPath(o.urlPath) === optionId);
            if (option) {
                return option.value;
            }
        }

        return undefined;
    }
} 