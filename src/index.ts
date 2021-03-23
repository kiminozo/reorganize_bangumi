import * as fs from "fs"
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import colors = require('colors/safe');
import Path = require('path');
import { downImage } from "./download";

async function scan(path: string, deep: number): Promise<string[]> {
    let stack = await fs.promises.readdir(path);
    stack = stack.map(p => Path.join(path, p));
    for (let i = 0; i < deep; i++) {
        let dirs = [...stack];
        stack.splice(0, stack.length);
        for (const child of dirs) {
            let tmp = await fs.promises.readdir(child);
            tmp.map(p => Path.join(child, p)).forEach(p => stack.push(p));
        }
    }
    return stack;
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

async function search(keyword: string): Promise<bgm.Item> {
    //console.log(colors.gray(line));
    //let keyword = extract(line);
    //console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    let item = await bgm.searchApi(keyword);
    if (item === null) {
        let jpName = await kitsu.searchApi(keyword);
        item = await bgm.searchApi(jpName);
    }
    return item;
}

async function saveItem(path: string, item: bgm.Item) {
    //let dir = Path.join("output", bgm.sort_out_path(item));
    // try {
    //     await fs.promises.mkdir(dir, { recursive: true })
    // } catch (error) {

    // }
    await fs.promises.writeFile(Path.join(path, "data.json"), JSON.stringify(item, null, 1));
    await downImage(item.images.large, Path.join(path, "Poster.jpg"));
}

async function sort_out_path(src: string, desc: string) {
    // let desc = Path.join("output", bgm.sort_out_path(item));
    if (src === desc) {
        return;
    }
    try {
        await fs.promises.mkdir(Path.dirname(desc), { recursive: true })
    } catch (error) {

    }
    await fs.promises.rename(src, desc);
}

const output = "output.log";
async function log(text: string) {
    await fs.promises.appendFile(output, text + "\r\n");
}

async function run(root: string, paths: string[]) {

    for (const path of paths) {
        const name = Path.basename(path);
        const keyword = extract(name);

        console.log(colors.yellow(`${name} --> ${keyword}`));
        if (keyword) {
            const item = await search(keyword);
            if (item != null) {
                await saveItem(path, item);
                console.log(colors.green(bgm.title(item)));
                const desc = Path.join(root, "new", bgm.sort_out_path(item));
                await sort_out_path(path, desc);
                await log(`${path} --> ${desc}`);
            } else {
                console.log(colors.red("not found"));
                await log(`${path} --> not found `);
            }
        } else {
            await log(`${path} --> extract error `);
        }
    }
}

async function main() {
    let root = "output"
    let paths = await scan(root, 1);
    console.log(paths);
    await run(root, paths)
}

main();