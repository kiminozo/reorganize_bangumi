import superagent = require('superagent');
import cheerio = require('cheerio');
import axios from 'axios';
import { httpsOverHttp } from 'tunnel'


function agent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, docs) => {
                if (err) {
                    return reject(err);
                }
                // 成功解析
                resolve(docs.text);
            })
    })
}

interface SearchData {
    title: string
    url: string;
}

export async function search(word: string): Promise<SearchData | null> {
    let key = word.replace(/\s/gi, "+");
    let url = "http://bgm.tv/subject_search/" + escape(key) + "?cat=2";
    console.log(url);
    let html = await agent(url);

    const $ = cheerio.load(html);
    const item = $("#browserItemList h3 a").first();
    console.debug($.html());
    //$("",item)
    if (item == null) {
        return null;
    }
    console.log(item.html());
    let href = item.attr()['href'];
    console.log(item.attr()['href']);
    return { title: item.text(), url: "https://bgm.tv" + href }
    //await bgm_info(href);
}

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

export interface List {
    id: number;
    url: string;
    type: number;
    name: string;
    name_cn: string;
    summary: string;
    air_date: string;
    air_weekday: number;
    images: Images;
    eps: number;
    eps_count: number;
    rating: Rating;
    rank: number;
    collection: Collection;
}

export interface SearchResult {
    results: number;
    list: List[];
}

const proxy = {
    host: "127.0.0.1",
    port: 7890,
};

const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };

export async function searchApi(word: string): Promise<string> {
    //let key = word.replace(/\s/gi, "+");
    let res = await axios.get<SearchResult>("https://api.bgm.tv/search/subject/" + encodeURI(word) + "?type=2", axiosConfig);
    if (res.data.list && res.data.list.length > 0) {
        console.debug(res.data.list);
        let item = res.data.list[0];

        return item.name_cn ? item.name_cn : item.name;
    }
    return "";
}


// async function bgm_info(href: string) {
//     let html = await agent("https://bgm.tv" + href);
//     const $ = cheerio.load(html);
//     $("#infobox li").each((_, ele) => {
//         let type = $("span", ele).text();
//         let val = $(ele).children().text();
//         console.log({ type, val })
//     });

// }


searchApi("ダンジョンに出会いを求めるのは間違っているだろうかⅢ ")