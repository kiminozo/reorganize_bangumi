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

const apiKey: string = "5501399346685e41aa3df9c47ed4671f";
const db = new MovieDb(apiKey);

const proxy = {
    host: "127.0.0.1",
    port: 7890,
};

const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };
const params = {
    language: 'zhCN'
}


async function kitsuInfo(word: string) {
    try {
        let result = await axios.get<RootObject>("https://kitsu.io/api/edge/anime?filter[text]=" + encodeURI(word));
        if (result.data.data && result.data.data.length > 0) {
            console.log(result.data.data[0].attributes.titles);
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
            console.debug(res.results);
            // console.log(colors.green(res.results[0].name));
            return;
        }
        let w2 = word.split(" ")[0];
        if (w2 !== word) {
            res = await db.searchTv({ query: w2, language: 'zh-CN' }, axiosConfig);
            if (res.results && res.results.length > 0) {
                console.log(colors.blue(res.results[0].name));
                return;
            }
        }
        console.log(colors.red("not find"));
        //if (res.results && res.results.length > 0) {
        // let info = await db.tvInfo({ id: 94664, language: 'zh-CN' }, axiosConfig)
        // console.log(colors.green(info.name));
        // }

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

