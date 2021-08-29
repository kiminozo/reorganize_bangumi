import * as fs from "fs"
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import colors = require('colors/safe');
import Path = require('path');
import { downImage } from "./download";
import { extract } from "./match";
import { scan, move } from "./files";
import { makeNfo } from "./nfoConveter";

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

const imageDownloader: Promise<unknown>[] = []

async function saveItem(path: string, item: bgm.Item) {
    //let dir = Path.join("output", bgm.sort_out_path(item));
    // try {
    //     await fs.promises.mkdir(dir, { recursive: true })
    // } catch (error) {

    // }
    await fs.promises.writeFile(Path.join(path, "data.json"), JSON.stringify(item, null, 1));
    await makeNfo(path)
    imageDownloader.push(downImage(item.images.large, Path.join(path, "Poster.jpg")));
}

async function readData(path: string): Promise<bgm.Item | null> {
    try {
        const filePath = Path.join(path, "data.json");
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const item: bgm.Item = JSON.parse(data);
        return item;
    } catch (error) {
        return null;
    }

}

const output = "output.log";
async function log(text: string) {
    await fs.promises.appendFile(output, text + "\r\n");
}

interface Config {
    deeps: number;
    desc?: string;
    backup?: string
}

export class Worker {
    private readonly src: string;
    private readonly config: Config;

    constructor(src: string, config: Config) {
        this.src = src;
        this.config = config;
    }

    async start() {
        let paths = await scan(this.src, this.config.deeps);
        const tmp = paths.filter(p => !p.startsWith("#") || !p.startsWith("."))
        console.log(paths);
        await this.run(paths);
    }

    private async run(paths: string[]) {
        for (const path of paths) {
            const name = Path.basename(path);
            if (name.startsWith("#") || name.startsWith(".")) {
                continue
            }
            let item = await readData(path);
            if (item) {
                continue
            }

            const keyword = extract(name);
            console.log(colors.yellow(`${name} --> ${keyword}`));
            if (!keyword) {
                await log(`${path} --> extract error `);
                continue
            }
            item = await search(keyword);
            if (item == null) {
                console.log(colors.red("not found"));
                if (!this.config.desc || !this.config.backup) {
                    continue
                }
                await this.backup(path, Path.join("未找到", name));
                await log(`${path} --> not found `);
            }

            await saveItem(path, item);
            if (!this.config.desc) {
                continue
            }
            const descPath = bgm.sort_out_path(item)
            console.log(colors.green(descPath));
            const desc = Path.join(this.config.desc, descPath);
            try {
                await move(path, desc);
                await log(`${path} --> ${desc}`);
            } catch (error) {
                console.log(colors.red(error.message));
                await this.backup(path, Path.join("重复", descPath));
                await log(`${path} --> move failed`);
            }
            await sleep(1000);
        }
        await Promise.all(imageDownloader)
        console.log(colors.green("图片全部下载完成"));
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

// async function test() {
//     const item = await search("街角魔族")
//     saveItem("tests", item)
//     console.log(item)
// }
// test();