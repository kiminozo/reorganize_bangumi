import { MovieDb } from 'moviedb-promise'
//import axios, { AxiosProxyConfig } from 'axios'
import { httpsOverHttp } from 'tunnel'
import * as fs from "fs"
import * as readline from "readline";
import colors = require('colors/safe');
// import jieba = require("nodejieba");
// import { tokenize, getTokenizer } from "kuromojin";
import axios from 'axios';
import { RootObject } from "./kitsuType";
import * as bgm from "./bgm";

const apiKey: string = "5501399346685e41aa3df9c47ed4671f";
const db = new MovieDb(apiKey);


const proxy = {
    host: "127.0.0.1",
    port: 7890,
};

const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };



// var token = bgmAuth.createToken({ grant_type: 'authorization_code', type: 'Bearer' })
// // Set the token TTL.
// token.expiresIn(1234) // Seconds.
// token.expiresIn(new Date('2022-11-08')) // Date.

// token.refresh().catch(e => console.error(e));
// console.log(token);

// async function auth() {
//     const data = {
//         clientId: 'bgm12835d9fe466616a5',
//         clientSecret: 'f8ff78be428a0642fd0008649394d963',
//         redirect_uri: "http://127.0.0.1/auth/github/callback",
//         state: "123134"
//     }
//     await axios.post("https://bgm.tv/oauth/access_token", data);
// }
// auth();


async function kitsuInfo(word: string) {
    try {
        let result = await axios.get<RootObject>("https://kitsu.io/api/edge/anime?filter[text]=" + encodeURI(word));
        if (result.data.data && result.data.data.length > 0) {
            let data = result.data.data[0];
            let titles = data.attributes.titles;
            let title = titles.ja_jp ? titles.ja_jp : titles.en_jp;
            console.log(colors.green(title));

            let bgm_data = await bgm.search(title);
            console.log(colors.blue(bgm_data.title));
            // if (data.attributes.showType === "TV") {
            //     await tvInfo(title);
            // } else {
            //     await movieInfo(title);
            // }
        } else {
            console.log(colors.red("not find"));
        }
    } catch (error) {
        console.error(colors.red(error));
    }
}
async function tvInfo(word: string) {
    try {

        let res = await db.searchTv({ query: word, language: 'zh-CN' }, axiosConfig);
        if (res.results && res.results.length > 0) {
            // console.debug(res.results);
            console.log(colors.blue(res.results[0].name));
            return;
        }
        let res2 = await db.searchMovie({ query: word, language: 'zh-CN' }, axiosConfig);
        if (res2.results && res2.results.length > 0) {
            // console.debug(res.results);
            console.log(colors.blue(res2.results[0].title));
            return;
        }
        console.log(colors.red("not find"));

    } catch (error) {
        console.log(colors.red(error));
    }
}

async function movieInfo(word: string) {
    try {
        let res = await db.searchMovie({ query: word, language: 'zh-CN' }, axiosConfig);
        if (res.results && res.results.length > 0) {
            // console.debug(res.results);
            console.log(colors.blue(res.results[0].title));
            return;
        }
        console.log(colors.red("not find"));

    } catch (error) {
        console.log(colors.red(error));
    }
}

const regex = /\[[^\[\]]*\]\s*\[?([^\[\]]+)\]?.*/;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extract(line: string): string {
    let result = regex.exec(line);
    let t1 = result ? result[1] : line;
    let t2 = t1.replace(/_/gi, " ")
    return t2;
}

async function search(line: string) {
    console.log(colors.gray(line));
    let keyword = extract(line);
    console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    await kitsuInfo(keyword);
}

async function test() {
    // await fs.readFile("tests/files.txt");
    let rl = readline.createInterface(fs.createReadStream("tests/files.txt"));
    for await (const line of rl) {
        await search(line);
        await sleep(200);
    }
}

const str = "[Airota&Nekomoe kissaten][Adachi to Shimamura][01-12END][1080p][CHS]";

// async function test2() {
//     await getTokenizer();
//     let x = await tokenize(str);
//     console.log(x);
// }

// jieba.load();
// let x = jieba.cut();
// console.log(x);
//test();

// const regex2 = /\[[^\[\]]+\]\s*\[?([^\[\]]+)\]?.+/;

// let result = regex2.exec("[云光字幕组]总之就是非常可爱 Tonikaku Kawaii-1-12  [简体双语][1080p]招募翻译");
// if (result) {
//     console.log(colors.yellow(result[1]));
// }

//search("[Sakurato]One Room Third Season [01-12 Fin][TVRip][1080p][CHS]");
//tvInfo("アイドルマスター シンデレラガールズ劇場");

test();

