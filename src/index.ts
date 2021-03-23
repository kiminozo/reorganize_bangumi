import * as fs from "fs"
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import colors = require('colors/safe');

async function scan(path): Promise<string[]> {
    let dirs = await fs.promises.readdir(path)
    for (const dir of dirs) {
        console.log(dir);
    }
    return dirs;
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

async function search(line: string): Promise<string> {
    console.log(colors.gray(line));
    let keyword = extract(line);
    console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    let name = await bgm.searchApi(keyword);
    if (name === null) {
        let jpName = await kitsu.searchApi(keyword);
        name = await bgm.searchApi(jpName);
    }
    return name;
}

async function run(root, names) {
    for (const name of names) {
        let keyword = extract(name);
        if (keyword) {
            let title = await search(keyword);
            console.log(title);
        } else {
            console.warn("regex no match:" + name)
        }
    }
}

async function main() {
    let root = "S:\\unwatched"
    let names = await scan(root);
    await run(root, names)
}