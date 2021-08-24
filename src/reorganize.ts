import { Item, sort_out_path, quarter, title, EpItem } from "./bgm";
import { scan, move } from './files'
import * as fs from "fs"
import Path = require('path');
import { infoApi } from "./bgm"
import { makeNfo } from "./nfoConveter";
const dataFileName = "data.json";

const output = "output.log";
async function log(text: string) {
    await fs.promises.appendFile(output, text + "\r\n");
}

async function readData(path: string): Promise<Item | null> {
    try {
        const data = await fs.promises.readFile(Path.join(path, dataFileName), 'utf-8');
        const item: Item = JSON.parse(data);
        return item;
    } catch (error) {
        console.error(error);
        return null;
    }

}

async function reorganizePath(root: string, path: string): Promise<void> {
    const item = await readData(path);
    if (!item) {
        return;
    }
    try {
        // const desc = Path.join(root, sort_out_path(item));
        const basename = Path.basename(path);
        const descRoot = Path.dirname(Path.dirname(path));
        const desc = Path.join(descRoot, quarter(new Date(item.air_date)), basename);
        await move(path, desc);
        console.log(`move ${path} --> ${desc} `);
        await log(`move ${path} --> ${desc} `);
    } catch (err) {
        console.log(err.message);
    }
}

async function updateInfo(path: string): Promise<void> {
    const item = await readData(path);
    if (!item) {
        return;
    }
    // const epItems = item.eps as EpItem[]
    // if (epItems && epItems.length != 0) {
    //     return;
    // }
    const newItem = await infoApi(item.id)
    if (!newItem) {
        return;
    }
    await fs.promises.writeFile(Path.join(path, "data.json"), JSON.stringify(newItem, null, 1));

}


async function reorganizeAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    await Promise.all(dirs.map(dir => reorganizePath(root, dir)));
}

async function updateInfoAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    console.log(dirs)
    await Promise.all(dirs.map(dir => updateInfo(dir)));
}

async function updateNfoAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    for (const dir of dirs) {
        console.log(dir)
        await makeNfo(dir)
    }
    //await Promise.all(dirs.map(dir => makeNfo(dir)));
}

//reorganizeAll(Path.join("/Volumes/pt", "新番"), 1)
//updateInfoAll(Path.join("/Volumes/pt", "新番"), 2)
//console.log("fate/stay night".replace(/\//gi, " "));

updateNfoAll(Path.join("/Volumes/pt", "新番", "2020s"), 1)

//makeNfo(Path.join("/Volumes/pt", "新番", "2020s", "2021-04", "86 -不存在的战区-"))