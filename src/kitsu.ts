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

function select_title(titles: Titles) {
    if (titles.zh_cn) {
        return titles.zh_cn;
    }
    if (titles.ja_jp) {
        return titles.ja_jp;
    }
    if (titles.en_jp) {
        return titles.en_jp;
    }
    if (titles.en_cn) {
        return titles.en_cn;
    }
    if (titles.en_us) {
        return titles.en_us;
    }
    console.error(titles);
    return titles.en;
}


export async function searchApi(word: string): Promise<string> {
    try {
        let result = await axios.get<RootObject>("https://kitsu.io/api/edge/anime?filter[text]=" + encodeURI(word));
        if (result.data.data && result.data.data.length > 0) {
            let title: string;
            if (result.data.data.length == 1) {
                const data = result.data.data[0];
                title = select_title(data.attributes.titles);
                console.log(colors.green(title));
                return title;
            } else {
                title = await choice(word, result.data.data);
                return title;
            }
        } else {
            //console.log(colors.red("not find"));
            let newWord = await input(word);
            if (newWord && newWord === word) {
                return null;
            }
            return searchApi(newWord);
        }
    } catch (error) {
        console.error(colors.red(error));
    }

}

async function input(word: string): Promise<string> {

    let answer = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: "kitsu未找到，是否调整名称:",
        default: word,
    }])

    console.log(answer.name);
    return answer.name;
}

async function choice(word: string, list: Data[]): Promise<string> {
    const titles = list.map(data => data.attributes.titles)
        .map(p => select_title(p));
    const choices = [...titles, "[取消]"];
    //console.log(choices);
    let answers = await inquirer.prompt([
        {
            type: 'list',
            message: `选择kitsu提供的名称:`,
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
    return titles.find(p => p === name);
}

// async function test() {
//     const item = await searchApi(" Fugou Keiji Balance - UNLIMITED")
//     console.log(item)
// }
// test();