import { Item, sort_out_path, quarter, title } from "./bgm";
import { scan, move } from './files'
import * as fs from "fs"
import Path = require('path');
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


async function reorganizeAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    await Promise.all(dirs.map(dir => reorganizePath(root, dir)));
}

reorganizeAll(Path.join("/Volumes/anime", "新番"), 1)

//console.log("fate/stay night".replace(/\//gi, " "));