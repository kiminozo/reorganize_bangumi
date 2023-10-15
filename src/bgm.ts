import axios from 'axios';
import Path = require('path');
//import { httpsOverHttp } from 'tunnel'
import inquirer = require('inquirer');


// function agent(url: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         superagent.get(url)
//             .end((err, docs) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 // 成功解析
//                 resolve(docs.text);
//             })
//     })
// }

// interface SearchData {
//     title: string
//     url: string;
// }

// export async function search(word: string): Promise<SearchData | null> {
//     let key = word.replace(/\s/gi, "+");
//     let url = "http://bgm.tv/subject_search/" + escape(key) + "?cat=2";
//     console.log(url);
//     let html = await agent(url);

//     const $ = cheerio.load(html);
//     const item = $("#browserItemList h3 a").first();
//     console.debug($.html());
//     //$("",item)
//     if (item == null) {
//         return null;
//     }
//     console.log(item.html());
//     let href = item.attr()['href'];
//     console.log(item.attr()['href']);
//     return { title: item.text(), url: "https://bgm.tv" + href }
//     //await bgm_info(href);
// }

export interface Images {
    large: string;
    common: string;
    medium: string;
    small: string;
    grid: string;
}

export interface Count {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
}

export interface Rating {
    total: number;
    count: Count;
    score: number;
}

export interface Collection {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
}

export interface Item {
    id: number;
    url: string;
    type: number;
    name: string;
    name_cn: string;
    summary: string;
    air_date: string;
    air_weekday: number;
    images: Images;
    eps: number | EpItem[];
    eps_count: number;
    rating: Rating;
    rank: number;
    collection: Collection;
}


export interface EpItem {
    id: number
    url: string//"http://bgm.tv/ep/892649"
    type: number
    sort: number //1
    name: string//"優子の目覚め!! 家庭の事情で今日から魔族"
    name_cn: string// "优子的觉醒！！因为家庭原因今天开始成为魔族"
    duration: string// "00: 24: 05"
    airdate: string//"2019 - 07 - 11"
    comment: number
    desc: string//"どこにでもいる普通の女子高生・吉田優子は、\r\nある朝目が覚めるとツノと尻尾が生えていた。\r\nパニクる優子に母・清子が告げたのは衝撃の事実。\r\n「吉田家は古代より闇を糧とするもの……封印されし『闇の一族』の末裔なのです」\r\n一族の封印を解くべく、闇の力に目覚めた優子と\r\n一族の宿敵・魔法少女との戦いが今、幕をあける……?\r\n\r\nシナリオ：大知慶一郎　絵コンテ：桜井弘明　演出：原田奈奈　総作画監督：大塚舞\r\n作画監督：大塚舞・林信秀・植竹康彦・アラタハヤト",
    status: string//"Air"
}

export function title(item: Item | null) {
    if (item == null) {
        return null;
    }
    const t = item.name_cn ? item.name_cn : item.name;
    return t.replace(/\//gi, " ");
}

export function quarter(date: Date, short: boolean = false): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let years: string;
    if (year < 1990) {
        years = "1980s"
    } else if (year < 2000) {
        years = "1990s"
    } else if (year < 2010) {
        years = "2000s"
    } else if (year < 2020) {
        years = "2010s"
    } else {
        years = "2020s"
    }
    if (short) {
        return years;
    }
    let quarter: string;
    if (month <= 3) {
        quarter = year + "-01";
    } else if (month < 6) {
        quarter = year + "-04";
    } else if (month < 9) {
        quarter = year + "-07";
    } else {
        quarter = year + "-10";
    }
    return Path.join(years, quarter);
}

export function sort_out_path(item: Item | null): string {
    if (item == null) {
        return null;
    }
    return Path.join(quarter(new Date(item.air_date)), title(item))
}


interface SearchResult {
    results: number;
    list: Item[];
}


// const proxy = {
//     host: "127.0.0.1",
//     port: 7890,
// };

// const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };
export enum BgmType { anime = 2, drama = 6 }


export async function searchApi(word: string, type: BgmType = BgmType.anime): Promise<Item> {
    //let key = word.replace(/\s/gi, "+");
    const url = "https://api.bgm.tv/search/subject/" + encodeURI(word) + "?type=" + type.valueOf()
    console.log(url)
    const res = await axios.get<SearchResult>(url, { timeout: 15000 });
    if (res.data.list && res.data.list.length > 0) {
        //console.debug(res.data.list);
        let item: Item;
        if (res.data.list.length == 1) {
            item = res.data.list[0];
        } else {
            const cho = await choice(word, res.data.list);
            if (cho === ChoiceType.Cancel) {
                return null;
            }
            if (cho === ChoiceType.Input) {
                const new_word = await input("输入自定义名称:", word);
                if (new_word && new_word === word) {
                    return null;
                }
                return await searchApi(new_word, type);
            }
            item = cho;
        }
        if (item == null) {
            return null;
        }
        return await infoApi(item.id)
    }
    const newWord = await input("bgm未找到，是否调整名称:", word);
    if (newWord && newWord === word) {
        return null;
    }
    return await searchApi(newWord, type);
}

export async function infoApi(id: number): Promise<Item> {
    //let key = word.replace(/\s/gi, "+");
    let res = await axios.get<Item>("https://api.bgm.tv/subject/" + id + "?responseGroup=large", { timeout: 15000 });
    if (res.data) {
        //console.debug(res.data.images.large);
        return res.data;
    }
    return null;
}

async function input(message: string, word: string): Promise<string> {

    let answer = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message,
        default: word,
    }])

    console.log(answer.name);
    return answer.name;
}

enum ChoiceType { Cancel = 0, Input = -1 }

async function choice(word: string, list: Item[]): Promise<Item | ChoiceType> {
    //console.log(list);
    let choices = list.map(item => { return { name: `${item.name_cn} | ${item.name}`, value: item.id } });
    choices.push({ name: "[自定义]", value: ChoiceType.Input });
    choices.push({ name: "[取消]", value: ChoiceType.Cancel });
    let answers = await inquirer.prompt([
        {
            type: 'list',
            message: `选择Bgm提供的中文名称:`,
            name: 'id',
            choices: choices,
        },
    ]);
    const id = answers.id;
    if (id == ChoiceType.Cancel) {
        return ChoiceType.Cancel;
    }
    if (id == ChoiceType.Input) {
        return ChoiceType.Input;
    }
    return list.find(item => item.id === id) ?? ChoiceType.Cancel;
}


// async function test() {
//     const item = await searchApi("奇诺之旅2")
//     console.log(item)
// }
// test();

//console.log(quarter(new Date("2019-04-02")))
// const date = new Date("2019-01-02");
// const month = date.getMonth();;
// console.log(month);
