declare namespace V4Types {
    /**
     * @hidden
     */
    namespace Config {
        interface Type {
            id: number;
            name: string;
            parent_id: number;
        }

        interface Category {
            id: number;
            name: string;
            types: Type[];
        }

        interface Machine {
            id: number;
            name: string;
            alias: string;
            color?: string;
        }

        interface Event {
            id: number;
            name: string;
            alias?: string;
        }

        interface Genre {
            id: number;
            name: string;
            alias?: string;
        }

        interface Theme {
            id: number;
            name: string;
            alias?: string;
        }

        interface Mode {
            id: number;
            name: string;
        }

        interface Chronicle {
            id: number;
            name: string;
        }

        interface Badge {
            id: number;
            imageUrl: string;
        }

        interface Smiley {
            id: number;
            code: string;
            width: number;
            height: number;
            imageUrl: string;
        }

        interface Store {
            id: number;
            name: string;
            imageUrl: string;
        }

        interface Level {
            id: number;
            name: string;
            permissions: Array<{
                label: string;
                value: number;
            }>;
        }

        interface General {
            customizations: {
                nativeAdFrequency: number;
            };
            assets: {
                css: Array<{
                    name: string;
                    url: string;
                }>;
                js: Array<{
                    name: string;
                    url: string;
                }>;
            };
            categories: Category[];
            tags: {
                machines: Machine[];
                events: Event[];
                genres: Genre[];
                themes: Theme[];
                modes: Mode[];
                chronicles: Chronicle[];
            };
            badges: Badge[];
            smileys: Smiley[];
            stores: Store[];
            levels: Level[];
        }
    }

    namespace Contents {
        interface RawHighTech {
            bonplan: {
                items: V4Types.Content.Generic[];
            };
            news: {
                items: V4Types.Content.Generic[];
            };
            reviews: {
                items: V4Types.Content.Generic[];
            };
            guides: {
                items: V4Types.Content.Generic[];
            };
        }

        interface HighTech {
            bonplan: V4Types.Content.Generic[];
            news: V4Types.Content.Generic[];
            reviews: V4Types.Content.Generic[];
            guides: V4Types.Content.Generic[];
        }

        interface Raw {
            paging: V4Types.Paging;
            items: V4Types.Content.Generic[];
        }
    }

    namespace Game {
        namespace Review {
            interface Infos {
                id: number;
                author: V4Types.Author;
                publishDate: string;
                mark: number;
                content: {
                    raw: string;
                    tree: V4Types.Tree[];
                }
            }

            interface FullInfos {
                id: number;
                category: number;
                type: number;
                title: number;
                machines: number[];
                genres: number[];
                reviewId: number;
                reviewText: {
                    raw: string;
                    tree: V4Types.Tree[];
                };
                coverUrl: string;
                mark: number;
            }
        }

        namespace Reviews {
            interface Raw {
                paging: V4Types.Paging;
                details: DetailedStats;
                items: V4Types.Game.Review.Infos[];
            }

            interface GlobalStats {
                machine: number;
                test?: { id: number; mark: number };
                preview?: { id: number; mark: number };
                userReviewAverage: number;
                userReviewAverageDecimal: number;
            }

            interface DetailedStats {
                reviewAverage: number;
                reviewAverageDecimal: number;
                reviewCount: number;
                reviewCount0to5: number;
                reviewCount6to10: number;
                reviewCount11to15: number;
                reviewCount16to20: number;
                topReviews: Infos[];
            }
        }

        interface Addin {
            id: number;
            category: number;
            type: number;
            title: string;
            machines: number[];
            releaseDate: string;
        }

        interface GameDetails {
            content: string;
            releaseDateFr: string;
            releaseDateUs?: string;
            releaseDateJp?: string;
            genres?: number[];
            themes?: number[];
            modes?: number[];
            publishers?: string[];
            pegi?: string[];
            medias?: string[];
            businessModel?: string[];
            langs?: string[];
            addins?: Addin[];
            website?: string;
        }

        interface Generic {
            id: number;
            category: number;
            type: number;
            title: string;
            machines?: number[];
            genres?: number[];
            releaseDate?: string;
            releaseMachines?: number[];
            coverUrl?: string;
            publishers?: number[];
            pegi?: string[];
        }

        interface Topic {
            id: number;
            title: string;
            author: V4Types.Author;
            lastMessageDate: string;
            nbAnswers: number;
        }

        interface StoreSupports {
            type: string;
            label: string;
            title: string;
            stores: { id: number; price: number; label: string; url: string; }[];
        }

        interface Infos extends Generic {
            webUrl: string;
            images: {
                paging: V4Types.Paging;
                items: Images;
            };
            content: string;
            targeting: V4Types.Targeting;
            bgImage: string;
            bgVideo?: V4Types.Video.Infos;
            reviews: {
                test?: { id: number; mark: number };
                preview?: { id: number; mark: number };
                userReviewAverage: number;
                userReviewAverageDecimal: number;
            };
            news: {
                paging: V4Types.Paging;
                items: V4Types.Content.Generic[];
            };
            videos: {
                paging: V4Types.Paging;
                items: V4Types.Video.Infos[];
            };
            wikis: {
                paging: V4Types.Paging;
                items: V4Types.Content.Generic[];
            };
            topics: {
                paging: V4Types.Paging;
                details?: { forumId: number };
                items: Topic[];
            };
            stores?: {
                paging: V4Types.Paging;
                details: { bestPrice: number };
                items: { machine: number, supports?: StoreSupports[] }[];
            };
        }

        type Images = {
            imageUrl: string;
        }[];
    }

    namespace Games {
        interface RawSummary {
            reviews: {
                items: V4Types.Content.Generic[];
            };
            previews: {
                items: V4Types.Content.Generic[];
            };
            releases: {
                items: V4Types.Game.Generic[];
            };
            trending: {
                items: V4Types.Game.Generic[];
            };
            awaited: {
                items: V4Types.Game.Generic[];
            };
            tipsnews: {
                items: V4Types.Content.Generic[];
            };
        }

        interface Summary {
            reviews: V4Types.Content.Generic[];
            previews: V4Types.Content.Generic[];
            releases: V4Types.Game.Generic[];
            trending: V4Types.Game.Generic[];
            awaited: V4Types.Game.Generic[];
            tipsnews: V4Types.Content.Generic[];
        }

        interface Raw {
            paging: V4Types.Paging;
            items: V4Types.Game.Generic[];
        }
    }

    namespace Content {
        namespace Comment {
            interface Infos {
                id: number;
                idParent?: number;
                state: "visible" | "deleted";
                publishDate: string;
                nbAnswers: number;
                content: {
                    raw: string;
                    tree?: V4Types.Tree;
                };
                author: V4Types.Author;
                votes: {
                    positives: number;
                    negatives: number;
                };
            }

            interface RawAnswers { 
                items: V4Types.Content.Comment.Infos[];
            }
        }

        namespace Comments {
            interface Raw {
                paging: V4Types.Paging;
                details: {
                    state: string;
                    topComments: V4Types.Content.Comment.Infos[];
                };
                items: V4Types.Content.Comment.Infos[];
            }

            interface RawTop {
                paging: V4Types.Paging;
                details: {
                    state: string;
                };
                items: V4Types.Content.Comment.Infos[];
            }
        }

        interface Generic {
            id: number;
            category: number;
            type: number;
            title: string;
            isEditor: boolean;
            isContributor?: boolean;
            publishDate: string;
            updateDate?: string;
            imageUrl: string;
            webUrl?: string;
            machines?: number[];
            genres?: number[];
            isJvtech?: boolean;
            productCategories?: V4Types.Product[];
            productBrands?: V4Types.Product[];
            author?: V4Types.Author;
        }

        interface Infos extends Generic {
            images?: string[];
            relatedGame?: V4Types.Game.Generic;
            content: string;
            targeting: V4Types.Targeting;
        }
    }

    namespace Video {
        interface Infos extends V4Types.Content.Infos {
            id: number;
            category: number;
            type: number;
            title: string;
            publishDate: string;
            imageUrl: string;
            webUrl: string;
            machines?: number[];
            relatedGame?: V4Types.Game.Generic;
            targeting: V4Types.Targeting;
            videoUrls: Array<{
                type: string;
                url: string;
            }>;
            dailymotionId: string;
            duration: number;
            isContent: number;
            commentState: string;
        }
    }

    namespace Videos {
        interface Raw {
            paging: V4Types.Paging;
            items: V4Types.Video.Infos[];
        }
    }

    namespace Account {
        namespace Favorites {
            interface Default {
                topics: Topic[];
                forums: Forum[];
                games: Game[];
            }

            type Games = V4Types.Game.Generic & {
                machine: number;
            }[];

            type Forums = {
                id: number;
                title: string;
            }[];

            type Topics = {
                id: number;
                forumId: number;
                title: string;
            }[];

            interface Raw {
                games: {
                    paging: V4Types.Paging;
                    items: V4Types.Account.Favorites.Games;
                };
                forums: {
                    paging: V4Types.Paging;
                    items: V4Types.Account.Favorites.Forums;
                };
                topics: {
                    paging: V4Types.Paging;
                    items: V4Types.Account.Favorites.Topics;
                }
            }
        }

        namespace Page {
            interface RawReviews {
                paging: V4Types.Paging;
                items: V4Types.Game.Review.FullInfos[];
            }

            interface RawContents {
                paging: V4Types.Paging;
                items: V4Types.Content.Generic[];
            }

            interface Raw {
                reviews: RawReviews;
                contents: RawContents;
            }

            interface Default {
                reviews: Review[];
                contents: Content[];
            }
        }

        interface Generic {
            id: number;
            alias: string;
            avatarUrl: string;
            bgCoverUrl: string;
            level: { name: string, id: number };
            hasNftBadge: boolean;
        }

        interface Infos extends Generic {
            description: { raw: string, tree: V4Types.Tree };
            info: {
                country: string;
                creationDate: string;
                creationSince: number;
                lastVisitDate: string;
                forumMessageCount: number;
                commentCount: number;
            }
        }

        interface Report {
            title: string;
            reasons: {
                id: number;
                title: string;
            }[];
        }

        interface Reports {
            categories: Report[];
        }
    }

    namespace SearchResult {
        interface RawSearchResult {
            games: V4Types.Games.Raw;
            news: V4Types.Contents.Raw;
            articles: V4Types.Contents.Raw;
            videos: V4Types.Videos.Raw;
            wikis: V4Types.Contents.Raw;
        }

        interface SearchResult {
            games: Game[];
            news: Content[];
            articles: Content[];
            videos: Video[];
            wikis: Content[];
        }
    }

    namespace Request {
        /**
         * @hidden
         */
        interface RequestOptions {
            query?: Record<string, any>;
            raw?: boolean;
            type?: "content" | "game" | "video" | "hightech" | "review" | "comment" | "topComment";
        }
        
        interface GamesQuery {
            machine?: number;
            genre?: number;
            mode?: number;
        }
        
        interface ContentsQuery {
            categories?: number[];
            types?: number[];
            events?: number[];
        }
        
        interface ReleasesQuery {
            month?: number;
            year?: number;
        }
        
        /**
         * Interface contenant des informations permettant de définir les pages à traiter lors d'une requête.
         * 
         * Note : la numérotation commence à `1`.
         * 
         * @property {number} begin Première page à traiter, par défaut `1`
         * @property {number | null} end Dernière page à traiter, par défaut `null` pour traiter toutes les pages restantes
         * @property {number} step Pas entre deux pages, par défaut `1`
         * @interface
         */
        interface Paging {
            begin?: number;
            end?: number | null;
            step?: number;
        }
        
        /**
         * @hidden
         */
        type Options =
            | { paging?: never; page: number; raw?: boolean; perPage?: number; }
            | { page?: never; paging?: Paging; raw?: boolean; perPage?: number; };
        
        /**
         * @hidden
         */
        type GamesOptions = Options & { query?: GamesQuery };
        /**
         * @hidden
         */
        type ContentsOptions = Options & { query?: ContentsQuery };
        /**
         * @hidden
         */
        type ReleasesOptions = Options & { query?: ReleasesQuery };

        /**
         * @hidden
         */
        namespace Game {
            type Options = V4Types.Request.Options & { machineId?: number };

            interface RequestOptions extends V4Types.Request.RequestOptions {
                machineId?: number | null;
            }
        }
    }

    interface Product {
        id: number;
        label: string;
    }

    interface Targeting {
        contenu_id: string[];
        content_type: string[];
        rubrique?: string;
        section: string;
        genre?: string[];
        machine?: string[];
        pegi?: string[];
        editeur?: string[];
        jeu?: string[];
        fiche?: string;
    }

    interface Author {
        id: number;
        alias: string;
        avatarUrl?: string;
        bgCoverUrl?: string;
        hasNftBadge: boolean;
        group?: string;
        signature?: string;
        level?: {
            name: string;
            id: number;
        };
    }

    interface Paging {
        page?: number;
        perPage?: number;
        itemCount: number;
        totalPageCount?: number;
        totalItemCount: number;
    }

    interface Tree {
        type: string;
        children: Array<{
            type: 'LINEBREAK' | 'STR' | 'SMILEY';
            text?: string;
            url?: string;
        }>;
    }
}

/**
 * @hidden
 */
declare namespace GGTypes {
    type RawTypes = GGTypes.Folder.Infos | GGTypes.Video.Infos | GGTypes.Game.Infos | GGTypes.News.Infos | GGTypes.Preview.Infos | GGTypes.Review.Infos;

    interface Raw<T extends RawTypes> {
        data: {
            items: T[];
        };
        itemCount: number;
    }

    interface Option {
        value: string;
        label: string;
        itemCount: number;
        urlPath: string;
        isObfuscated: number;
    }
    
    interface Query<K extends string> {
        key: K;
        noSelectionItemCount: string;
        noSelectionUrlPath: string;
        options: Option[];
    }

    namespace Content {
        interface Infos {
            publicationId: number;
            datePublished: string;
            urlPath: string;
            description?: string | null;
            title: string;
            coverImageUrlBySize: {
                origin: string;
                xs: string;
                ms: string;
                md: string;
                lg: string;
            };
            platforms?: string[];
        }
    }

    namespace Game {
        type Query = [GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"gameMode">];

        interface Infos {
            gameId: number;
            title: string;
            coverImageUrlBySize: {
                origin: string;
                xs: string;
                ms: string;
                md: string;
                lg: string;
            };
            platforms: string[];
            description: string;
            franceRelease: {
                datePeriod: {
                    date: string;
                    precision: string;
                };
                isCancelled: boolean;
            } | null;
            urlPath: string;
            bestReview: {
                editorialRatingDisplay: string;
                editorialRating: number;
                platforms: string[];
                urlPath: string;
            } | null;
            videos: {
                showCasedVideo: {
                    urlPath: string;
                    displayType: string;
                };
                count: number;
                hubUrlPath: string;
                singleVideoUrlPath: string | null;
            };
            forumUrlPath: string;
            userRating: {
                averagePlatformRating: number;
                platform: string;
                urlPath: string;
            };
            newUserOpinionUrlPath: string;
            storeUrlPath: string | null;
        }
    }

    namespace Games {
        type Raw = GGTypes.Raw<GGTypes.Game.Infos>;
    }

    namespace News {
        type Query = [GGTypes.Query<"publicationType">, GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"event">, GGTypes.Query<"publicationPeriod">];

        interface Infos extends GGTypes.Content.Infos {
            isSponsored: boolean;
            publicationTypeId: string;
            typeTitle: string;
            commentsCount: number;
        }

        type Raw = GGTypes.Raw<GGTypes.News.Infos>;
    }

    namespace Review {
        type Query = [GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"gameMode">, GGTypes.Query<"editorialRatingRange">, GGTypes.Query<"maxAge">];
        
        interface Infos extends GGTypes.Content.Infos {
            editorialRating: string;
            gameTitle: string;
            gameUrlPath: string;
            gamePlatforms: string;
        }
    }

    namespace Reviews {
        type Raw = GGTypes.Raw<GGTypes.Review.Infos>;
    }

    namespace Preview {
        type Query = [GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"event">];
        
        interface Infos extends GGTypes.Content.Infos {
            editorialFeeling: number;
            gameTitle: string;
            gameUrlPath: string;
            gamePlatforms: string[];
            commentsCount: number;
        }
    }

    namespace Previews {
        type Raw = GGTypes.Raw<GGTypes.Preview.Infos>;
    }

    namespace Video {
        type Query = [GGTypes.Query<"publicationType">, GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"event">];
        
        interface Infos extends GGTypes.Content.Infos {
            isSponsored: boolean;
            publicationTypeId: string;
            respawnIdMedia: number;
            typeTitle: string;
            externalId: number | null;
            durationMs: number;
            viewCount: number;
        }
    }

    namespace Videos {
        type Raw = GGTypes.Raw<GGTypes.Video.Infos>;
    }

    namespace Folder {
        type Query = [GGTypes.Query<"platform">, GGTypes.Query<"gameGenre">, GGTypes.Query<"event">];

        interface Infos extends GGTypes.Content.Infos {
            isSponsored: boolean;
            typeTitle: string;
            commentsCount: number;
        }
    }

    namespace Folders {
        type Raw = GGTypes.Raw<GGTypes.Folder.Infos>;
    }

    namespace Request {
        interface Paging {
            begin?: number;
            end?: number | null;
            step?: number;
        }

        interface RequestOptions {
            query?: Record<string, any>;
            raw?: boolean;
            type?: "news" | "game" | "review" | "preview" | "video" | "folder";
        }

        type Options =
        | { paging?: never; page: number; raw?: boolean; perPage?: number; }
        | { page?: never; paging?: Paging; raw?: boolean; perPage?: number; };

        namespace Games {
            interface Query {
                platform?: string;
                gameGenre?: string;
                gameMode?: string;
            }

            type Sort = "popularity" | "editorialRating" | "releaseDate" | "title";
            type Preset = "all" | "awaited" | "popular" | "best" | "currentBest" | "releases";

            type Options = GGTypes.Request.Options & {
                preset?: Preset;
                sort?: Sort;
                query?: Query;
            }
        }

        namespace News {
            interface Query {
                publicationType?: string;
                platform?: string;
                gameGenre?: string;
                event?: string;
                publicationPeriod?: string;
            }

            type Options = GGTypes.Request.Options & {
                query?: Query;
            }
        }
        
        namespace Reviews {
            type Sort = "datePublished" | "editorialRating" | "gameTitle";

            type Query = {
                platform?: string;
                gameGenre?: string;
                gameMode?: string;
                editorialRatingRange?: string;
                maxAge?: string;
            }

            type Options = GGTypes.Request.Options & {
                sort?: Sort;
                query?: Query;
            }
        }

        namespace Previews {
            type Query = {
                platform?: string;
                gameGenre?: string;
                event?: string;
            }

            type Options = GGTypes.Request.Options & {
                query?: Query;
            }
        }

        namespace Videos {
            type Query = {
                publicationType?: string;
                platform?: string;
                gameGenre?: string;
                event?: string;
            }

            type Options = GGTypes.Request.Options & {
                query?: Query;
            }
        }

        namespace Folders {
            type Query = {
                platform?: string;
                gameGenre?: string;
                event?: string;
            }

            type Options = GGTypes.Request.Options & {
                query?: Query;
            }
        }
    }
}

declare namespace JVCTypes {
    namespace Forum {
        interface Topic {
            icon: string,
            id: number,
            title: string,
            author: string,
            nbAnswers: number,
            lastAnswerDate: Date,
            url: string
        }
    }

    namespace Topic {
        interface Infos {
            id: number,
            title: string,
            author: string,
            nbPages: number,
            lastAnswerDate: Date,
            publicationDate: Date,
            url: string,
            forumId: number;
            poll?: Poll;
        }

        interface Post {
            id: number;
            author: string;
            date: Date;
            content: string;
            topicId: number;
        }

        interface Poll {
            title: string;
            answers: {
                result: number;
                text: string;
            }[];
        }
    }

    namespace Post {
        interface Infos {
            id: number;
            url: string;
            author: string;
            date: Date;
            content: string;
            topicId: number;
            page: number;
        }
    }

    namespace ForumClient {
        interface Poll {
            title: string;
            answers: string[];
        }
    }

    namespace CDV {
        interface CreationDate {
            date: Date | undefined;
            daysSince: number | undefined;
        }

        interface Games {
            machines: string[];
            genres: string[];
            ids: {
                gameCenter: string | undefined;
                nintendo3DS: string | undefined;
                nintendoNetwork: string | undefined;
                origin: string | undefined;
                playstationNetwork: string | undefined;
                steam: string | undefined;
                xboxLive: string | undefined;
            };
        }

        interface SocialMedias {
            twitter: string | undefined;
            youtube: string | undefined;
            twitch: string | undefined;
            lastfm: string | undefined;
            skype: string | undefined;
            website: string | undefined;
        }

        interface Infos {
            alias: string;
            isBanned: boolean;
            level: number | undefined;
            description: string;
            signature: string;
            country: string | undefined;
            creationDate: CreationDate | undefined;
            lastVisit: Date | undefined;
            nbMessages: number | undefined;
            nbComments: number | undefined;
            socialMedias: SocialMedias | undefined;
            games: Games | undefined;
        }

        /**
         * @hidden
         */
        type CDV_SELS_AND_FUNCS = {
            [K in keyof Infos]: [string, (el: cheerio.Cheerio) => Infos[K]];
        }
    }

    namespace Request {
        /** 
         * Interface contenant des informations permettant de définir les pages à traiter lors d'une requête.
         * 
         * Note : la numérotation commence à `1`.
         * 
         * @property {number} begin Première page à traiter, par défaut `1`
         * @property {number | null} end Dernière page à traiter, par défaut `null` pour traiter toutes les pages restantes
         * @property {number} step Pas entre deux pages, par défaut `1`
         *
         * @interface
         */
        interface Paging {
            begin?: number;
            end?: number | null;
            step?: number;
        }

        /**
         * @hidden
         */
        interface OptionsPage {
            paging?: never;
            page: number;
            raw?: boolean;
        }

        /**
         * @hidden
         */
        interface OptionsPaging {
            paging?: Paging;
            page?: never;
            raw?: boolean;
        }

        /**
         * @hidden
         */
        type Options = OptionsPage | OptionsPaging;
        /**
         * @hidden
         */
        type SearchTopicOptions = Options & { searchMode?: "author" | "title" };
        /**
         * @hidden
         */
        interface RequestOptions {
            query?: Record<string, any>;
            raw?: boolean;
        }
    }
}