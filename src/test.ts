//import axios, { AxiosProxyConfig } from 'axios'
import { httpsOverHttp } from 'tunnel'
import * as fs from "fs"
import * as readline from "readline";
import colors = require('colors/safe');
// import jieba = require("nodejieba");
// import { tokenize, getTokenizer } from "kuromojin";
import axios from 'axios';
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import inquirer = require('inquirer');
import { downImage } from './download';
import path = require('path');
import { extract } from './match';

// const proxy = {
//     host: "127.0.0.1",
//     port: 7890,
// };

// const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };


const regex = /\[[^\[\]]*\]\s*\[?([^\[\]]+)\]?.*/;
const numberReg = /^[0-9\-]+$/;
const regex2 = /\[?([^\[\]]+)\]?.*/;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function search(line: string): Promise<string> {
    console.log(colors.gray(line));
    let keyword = extract(line);
    console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    let item = await bgm.searchApi(keyword);
    if (item === null) {
        let jpName = await kitsu.searchApi(keyword);
        if (jpName === null) {
            return null;
        }
        item = await bgm.searchApi(jpName);
    }
    if (item != null) {
        await save(item);
        return bgm.title(item);
    } else {
        console.log(colors.red("not found"));
    }
}

async function save(item: bgm.Item) {
    let dir = path.join("output", bgm.sort_out_path(item));
    try {
        await fs.promises.mkdir(dir, { recursive: true })
    } catch (error) {

    }
    await fs.promises.writeFile(dir + "/data.json", JSON.stringify(item, null, 1));
    await downImage(item.images.large, dir + "/Poster.jpg");
}

async function test() {
    // await fs.readFile("tests/files.txt");
    let output = "output/list.txt";
    try {
        await fs.promises.unlink(output);
    } catch (error) {

    }

    let rl = readline.createInterface(fs.createReadStream("tests/files.txt"));
    for await (const line of rl) {
        let name = await search(line);
        await fs.promises.appendFile(output, `${line} >> ${name} \r\n`);
        await sleep(200);
    }
}
//test();

async function md() {
    let rl = readline.createInterface(fs.createReadStream("tests/files2.txt"));
    for await (const line of rl) {
        try {
            await fs.promises.mkdir(path.join("output", "old", "2020", "2020-01", line), { recursive: true })
        } catch (error) {

        }
    }
}


//const str = "[Airota&Nekomoe kissaten][Adachi to Shimamura][01-12END][1080p][CHS]";

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
//search("[KTXP][Gochuumon_wa_Usagi_Desu_ka_S3][01-12][GB][720p]")
//md();

search("街角魔族")