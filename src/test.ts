import { MovieDb } from 'moviedb-promise'
//import axios, { AxiosProxyConfig } from 'axios'
import { httpsOverHttp } from 'tunnel'
import * as fs from "fs"
import * as readline from "readline";
import colors = require('colors/safe');

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
async function tvInfo(word: string) {
    try {
        let res = await db.searchTv({ query: word, language: 'zh-CN' }, axiosConfig);
        console.log(res);

        //if (res.results && res.results.length > 0) {
        let info = await db.tvInfo({ id: 94664, language: 'zh-CN' }, axiosConfig)
        console.log(info);
        // }

    } catch (error) {
        console.log(error);
    }
}
const regex = /\[[^\[\]]+\]\S+?\[?([^\[\]]+)\]?.+/;

function test() {
    // await fs.readFile("tests/files.txt");
    let readInterface = readline.createInterface(fs.createReadStream("tests/files.txt"), process.stdout);
    readInterface.on('line', function (line) {
        let result = regex.exec(line);
        if (result) {
            console.log(colors.green(result[1]));
        }
    });
}

console.log(colors.yellow("hello world"));
test();
//tvInfo("无职");

