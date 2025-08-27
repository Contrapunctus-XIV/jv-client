import Forum from "../classes/Forum.js";
import Content, { Video } from "../classes/Content.js";
import Game from "../classes/Game.js";
import Review from "../classes/Review.js";
import Topic from "../classes/Topic.js";
import Post from "../classes/Post.js";

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
            paging: V4Types.Paging;
            items: { imageUrl: string };
        };

        /**
         * @inline
         */
        interface MachineId {
            machineId?: number;
        }
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
            reviews: Content[];
            previews: Content[];
            releases: Game[];
            trending: Game[];
            awaited: Game[];
            tipsnews: Content[];
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

            type FavoriteGame = V4Types.Game.Generic & {
                machine: number;
            };

            type FavoriteForum = {
                id: number;
                title: string;
            };

            type FavoriteTopic = {
                id: number;
                forumId: number;
                title: string;
            };

            interface FavoriteGames {
                paging: V4Types.Paging;
                items: V4Types.Account.Favorites.FavoriteGame[];
            }

            interface FavoriteForums {
                paging: V4Types.Paging;
                items: V4Types.Account.Favorites.FavoriteForum[];
            }

            interface FavoriteTopics {
                paging: V4Types.Paging;
                items: V4Types.Account.Favorites.FavoriteTopic[];
            }

            interface Raw {
                games: FavoriteGames;
                forums: FavoriteForums
                topics: FavoriteTopics;
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
            resolved: boolean;
            poll?: Poll;
            lockReason?: string;
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
    /**
     * @hidden
     */
    interface FormData {
        isUserConnected: boolean;
        redirectLoginUrl: string;
        topicId: number;
        forumId: number;
        messageEditor: {
            messageInfo: {
                label: string;
                text: string;
                url: string;
            };
            inputName: string;
            initialText: string;
            placeholder: string;
            initialEnabledPreview: boolean;
            options: {
                maxRenderedStickers: boolean;
                isRenderedStickers: boolean;
                isRenderedNoelShack: boolean;
                isOpenedSpoils: boolean;
                isRenderedVideo: boolean;
            };
            userListGroups: {
                inputName: string;
                values: number[];
                defaultValue: number;
            };
            ajaxSessionContentEditToken: string;
        };
        formSession: {
            fs_session: string;
            fs_timestamp: number;
            fs_version: string;
            [k: string]: string | number;
        };
        ajaxToken: string;
        locales: {
            errors: string;
        };
    }

    namespace NoelShack {
        interface UploadInfos {
            erreurs: string;
            nb: number;
            chats: string;
            forums: string;
            blogs: string;
            url: string;
            nom: string;
            mini: string;
        }
    }

    namespace ProfileParams {
        type ProfileScope = "prive" | "public" | "abonnes";

        interface ProfileParams {
            profil_age: ProfileScope;
            profil_sexe: ProfileScope;
            profil_pays: ProfileScope;
            profil_ville: ProfileScope;
            profil_date_creation: ProfileScope;
            profil_date_passage: ProfileScope;
            profil_nombre_messages: ProfileScope;
            profil_nombre_commentaires: ProfileScope;
            profil_historique_messages: ProfileScope;
            profil_historique_commentaires: ProfileScope;
            profil_alias: ProfileScope;
            profil_droit_abonne: ProfileScope;
            profil_description: ProfileScope;
            profil_gamer_machines: ProfileScope;
            profil_gamer_genre_jeux: ProfileScope;
            profil_gamer_identifiants: ProfileScope;
            "identifiants[psn]": string;
            "identifiants[xbox live]": string;
            "identifiants[nintendonetwork]": string;
            "identifiants[nintendo3DS]": string;
            "identifiants[steam]": string;
            "identifiants[gamecenter]": string;
            "identifiants[origin]": string;
            profil_social_networks: ProfileScope;
            "reseaux[twitter]": string;
            "reseaux[youtube]": string;
            "reseaux[twitch]": string;
            "reseaux[lastfm]": string;
            "messageries[skype]": string;
            profil_skype: ProfileScope;
            "liens[]": string;
            profil_liens_libres: string;
            description: string;
            signature: string;
        }

        interface RawProfileParams extends ProfileParams {
            fs_session: string;
            fs_timestamp: string;
            fs_version: string;
            [fs_hash: string]: string;
        }

        interface RawParamsAndUrl {
            params: RawProfileParams;
            url: string;
        }
    }
}

declare namespace LibTypes {
    namespace Requests {
        /**
         * les attributs qui sont obtenus après parsing de la sortie de cURL
         * @hidden
         */
        interface CurlRawResponse {
            body: string;
            headers: Record<string, string>;
            status: number;
            url: string;
        }

        /**
         * @hidden
         */
        type CurlParsers = {
            [K in keyof CurlRawResponse]: (str: string) => CurlRawResponse[K];
        }
        /**
         * @hidden
         */
        type CurlScheme = { [K in keyof CurlRawResponse]: [string, string] };
        /**
         * @hidden
         */
        type CurlResults = { [K in keyof CurlRawResponse]: string | null };
        type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";
        type BodyMode = "json" | "url" | "form" | "any";
        type BodyType = string | Record<string, any> | URLSearchParams | FormData | any;
    }

    namespace Args {
        interface Pagination {
            begin?: number;
            end?: number | null;
            step?: number;
        }

        /**
         * @inline
         */
        type Raw<T = {}> = T & { raw: true };
        /**
         * @inline
         */
        type NotRaw<T = {}> = T & { raw?: boolean };
        /**
         * @inline
         */
        type Page<T = {}> = T & { page: number; raw?: boolean };
        /**
         * @inline
         */
        type Paging<T = {}> = T & { paging?: Pagination; raw?: boolean };
        type RawAndPage<T = {}> = Raw<T> & Page<T>;
        type RawAndPaging<T = {}> = Raw<T> & Paging<T>;
        type PageOrPaging<T = {}> = (Page<T> & { paging?: never }) | (Paging<T> & { page?: never });

        interface Base {
            perPage?: number;
        }

        namespace Content {
            interface Base {
                perPage?: number;
            }
            
            type RequestType = "video" | "comment" | "topComment" | "content";
            
            interface RequestOptions<T = RequestType> {
                query?: Query,
                type?: T
            }

            interface OptionsWithPaging {
                raw?: boolean;
                paging?: Pagination;
                perPage?: number;
            }

            interface OptionsWithPage {
                raw?: boolean;
                page: number;
                perPage?: number
            }

        }

        type Query = Record<string, any>;

        namespace ForumTopic {

            /**
             * @inline
             */
            interface UseApi {
                api?: boolean;
            }

            interface SearchTopic {
                searchMode?: "author" | "title"
            }
        }

        namespace ForumClient {
            interface Poll {
                title: string;
                answers: string[];
            }

            /**
             * @inline
             */
            interface PostTopicOptions {
                poll?: Poll;
            }

            /**
             * @inline
             */
            interface UpOptions {
                delay?: number;
                callback?: (post: Post) => any;
            }
        }

        namespace Game {
            /**
             * @inline
             */
            interface MachineId {
                machineId?: number;
            }

            type Base = {
                perPage?: number;
            } & MachineId;

            type RequestType = "content" | "video" | "review";

            type RequestOptions<T = RequestType> = {
                type?: T;
                query?: Query;
            } & MachineId;
        }

        namespace Profile {
            /**
             * @inline
             */
            interface FavoriteOptions {
                mode?: "add" | "update" | "remove"
            }

            /**
             * @inline
             */
            interface LevelLimitOptions {
                mode?: "topic" | "post";
            }
        }

        namespace V4Client {
            /**
             * @inline
             */
            interface OnProfile {
                onProfile?: boolean;
            }
        }

        namespace JVCode {
            /**
             * @inline
             */
            interface ReplaceQTags {
                replaceQTags?: boolean;
            }
        }

        namespace V4 {
            type RequestType = "content" | "video" | "game" | "hightech";

            type RequestOptions<T = RequestType> = {
                type?: T;
                query?: Query;
            };

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

            type ContentsOptions = Base & {
                query?: ContentsQuery;
            };

            type GamesOptions = Base & {
                query?: GamesQuery;
            };

            type ReleasesOptions = Base & {
                query?: ReleasesQuery;
            };
        }

        namespace Requests {
            /**
             * @inline
             */
            interface RequestApiOptions {
                method?: LibTypes.Requests.HttpMethod;
                query?: Record<string, any>;
                data?: LibTypes.Requests.BodyType;
                cookies?: Record<string, string>;
                headers?: Record<string, string>;
                allowedStatusErrors?: number[];
                bodyMode?: LibTypes.Requests.BodyMode;
                retries?: number;
                retryDelay?: number 
            }

            /**
             * @inline
             */
            interface RequestOptions extends RequestApiOptions {
                curl?: boolean;
            }
        }
    }
}

export { JVCTypes, V4Types, LibTypes };