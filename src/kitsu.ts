import axios from 'axios';
import { httpsOverHttp } from 'tunnel'
import inquirer = require('inquirer');
import colors = require('colors/safe');

export interface Links {
    self: string;
    related?: string;
}

export interface Titles {
    en_jp: string;
    ja_jp: string;
    en: string;
    en_us: string;
    en_cn: string;
    zh_cn: string;
}

export interface RatingFrequencies {
    2: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    13: string;
    14: string;
    15: string;
    16: string;
    17: string;
    18: string;
    20: string;
    3: string;
    19: string;
}

export interface Tiny {
    width?: number;
    height?: number;
}

export interface Small {
    width?: number;
    height?: number;
}

export interface Medium {
    width?: number;
    height?: number;
}

export interface Large {
    width?: number;
    height?: number;
}

export interface Dimensions {
    tiny: Tiny;
    small: Small;
    medium: Medium;
    large: Large;
}

export interface Meta {
    dimensions: Dimensions;
}

export interface PosterImage {
    tiny: string;
    small: string;
    medium: string;
    large: string;
    original: string;
    meta: Meta;
}


export interface CoverImage {
    tiny: string;
    small: string;
    large: string;
    original: string;
    meta: Meta;
}

export interface Attributes {
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    synopsis: string;
    description: string;
    coverImageTopOffset: number;
    titles: Titles;
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: string;
    ratingFrequencies: RatingFrequencies;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    nextRelease?: any;
    popularityRank: number;
    ratingRank?: number;
    ageRating: string;
    ageRatingGuide: string;
    subtype: string;
    status: string;
    tba: string;
    posterImage: PosterImage;
    coverImage: CoverImage;
    episodeCount: number;
    episodeLength: number;
    totalLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
}


export interface Genres {
    links: Links;
}


export interface Categories {
    links: Links;
}


export interface Castings {
    links: Links;
}


export interface Installments {
    links: Links;
}


export interface Mappings {
    links: Links;
}



export interface Reviews {
    links: Links;
}



export interface MediaRelationships {
    links: Links;
}



export interface Characters {
    links: Links;
}



export interface Staff {
    links: Links;
}



export interface Productions {
    links: Links;
}



export interface Quotes {
    links: Links;
}



export interface Episodes {
    links: Links;
}



export interface StreamingLinks {
    links: Links;
}



export interface AnimeProductions {
    links: Links;
}



export interface AnimeCharacters {
    links: Links;
}



export interface AnimeStaff {
    links: Links;
}

export interface Relationships {
    genres: Genres;
    categories: Categories;
    castings: Castings;
    installments: Installments;
    mappings: Mappings;
    reviews: Reviews;
    mediaRelationships: MediaRelationships;
    characters: Characters;
    staff: Staff;
    productions: Productions;
    quotes: Quotes;
    episodes: Episodes;
    streamingLinks: StreamingLinks;
    animeProductions: AnimeProductions;
    animeCharacters: AnimeCharacters;
    animeStaff: AnimeStaff;
}

export interface Data {
    id: string;
    type: string;
    links: Links;
    attributes: Attributes;
    relationships: Relationships;
}

export interface RootObject {
    data: Data[];
}




export async function searchApi(word: string): Promise<string> {
    try {
        let result = await axios.get<RootObject>("https://kitsu.io/api/edge/anime?filter[text]=" + encodeURI(word));
        if (result.data.data && result.data.data.length > 0) {
            let data;
            if (result.data.data.length == 1) {
                data = result.data.data[0];
            } else {
                data = await choice(word, result.data.data);
            }
            if (data == null) {
                return null;
            }
            let titles = data.attributes.titles;
            let title = titles.ja_jp ? titles.ja_jp : titles.en_jp;
            console.log(colors.green(title));
            return title;
        } else {
            console.log(colors.red("not find"));
            return null;
        }
    } catch (error) {
        console.error(colors.red(error.message));
    }

}

async function choice(word: string, list: Data[]): Promise<Data> {
    let choices = list.map(data => data.attributes.titles).map(titles => titles.ja_jp ? titles.ja_jp : titles.en_jp);
    choices.push("[取消]");
    let answers = await inquirer.prompt([
        {
            type: 'list',
            message: `选择kitsu提供的日文名称:`,
            name: 'name',
            choices: choices,
            validate: function (answer) {
                if (answer.length < 1) {
                    return 'You must choose at least one topping.';
                }
                return true;
            },
        },
    ]);
    // console.log(JSON.stringify(answers, null, '  '));
    let name = answers.name;
    return list.find(item => item.attributes.titles.ja_jp === name || item.attributes.titles.en_jp === name);
}