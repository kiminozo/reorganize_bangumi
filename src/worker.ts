import * as fs from "fs"
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import colors = require('colors/safe');
import Path = require('path');
import { downImage } from "./download";
import { extract } from "./match";
import { scan, move } from "./files";

function sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function search(keyword: string): Promise<bgm.Item> {
    //console.log(colors.gray(line));
    //let keyword = extract(line);
    //console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    let item = await bgm.searchApi(keyword);
    if (item === null) {
        let jpName = await kitsu.searchApi(keyword);
        if (jpName == null) {
            return null;
        }
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



const output = "output.log";
async function log(text: string) {
    await fs.promises.appendFile(output, text + "\r\n");
}

interface Config {
    deeps: number;
    backup?: string
}

export class Worker {
    private readonly src: string;
    private readonly desc: string;
    private readonly config: Config;

    constructor(src: string, desc: string, config: { deeps: number, backup?: string }) {
        this.src = src;
        this.desc = desc;
        this.config = config;
    }

    async start() {
        let paths = await scan(this.src, this.config.deeps);
        console.log(paths);
        await this.run(paths);
    }

    private async run(paths: string[]) {
        for (const path of paths) {
            const name = Path.basename(path);
            const keyword = extract(name);

            console.log(colors.yellow(`${name} --> ${keyword}`));
            if (keyword) {
                const item = await search(keyword);
                if (item != null) {
                    await saveItem(path, item);
                    console.log(colors.green(bgm.title(item)));
                    const desc = Path.join(this.desc, bgm.sort_out_path(item));
                    try {
                        await move(path, desc);
                        await log(`${path} --> ${desc}`);
                    } catch (error) {
                        console.log(colors.red(error.message));
                        await this.backup(path, Path.join("429", bgm.sort_out_path(item)));
                        await log(`${path} --> move failed`);

                    }
                } else {
                    console.log(colors.red("not found"));
                    await this.backup(path, Path.join("404", name));
                    await log(`${path} --> not found `);
                }
                await sleep(1000);
            } else {
                await log(`${path} --> extract error `);
            }
        }
    }

    private async backup(srcPath: string, descPath: string) {
        if (this.config.backup) {
            try {
                await move(srcPath, Path.join(this.config.backup, descPath));
            } catch {
                await move(srcPath, Path.join(this.config.backup, "error", descPath));
            }
        }
    }
}

async function test() {
    const item = await search("街角魔族")
    saveItem("tests", item)
    console.log(item)
}
test();