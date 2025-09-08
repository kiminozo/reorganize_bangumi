import * as fs from "fs"
import * as kitsu from "./kitsu";
import * as bgm from "./bgm";
import colors = require('colors/safe');
import Path = require('path');
import { downImage } from "./download";
import { extract } from "./match";
import { scan, move } from "./files";
import { makeNfo } from "./nfoConveter";
import { title } from "./bgm";

function sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}



async function search(keyword: string, type: bgm.BgmType): Promise<bgm.Item> {
    //console.log(colors.gray(line));
    //let keyword = extract(line);
    //console.log(colors.yellow(keyword));
    //await tvInfo(keyword);
    let item = await bgm.searchApi(keyword, type);
    if (item === null) {
        let jpName = await kitsu.searchApi(keyword);
        if (jpName == null) {
            return null;
        }
        item = await bgm.searchApi(jpName, type);
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
    rename?: boolean
    type?: bgm.BgmType
    shortPath?: boolean
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
                if (!this.config.backup) {
                    continue
                }
            } else {
                const keyword = extract(name);
                console.log(colors.yellow(`${name} --> ${keyword}`));
                if (!keyword) {
                    await log(`${path} --> extract error `);
                    continue
                }
                item = await search(keyword, this.config.type ? this.config.type : bgm.BgmType.anime);
            }

            if (item == null) {
                console.log(colors.red("not found"));
                if (!this.config.desc || !this.config.backup) {
                    continue
                }
                await this.backup(path, Path.join("未找到", name));
                await log(`${path} --> not found `);
            }

            const srcPath = await this.sourcePath(path)

            await saveItem(srcPath, item);
            if (!this.config.desc) {
                if (this.config.rename) {
                    await move(srcPath, Path.join(Path.dirname(srcPath), title(item)));
                }
                continue
            }
            const descPath = bgm.sort_out_path(item, this.config.shortPath);
            console.log(colors.green(descPath));
            const desc = Path.join(this.config.desc, descPath);
            try {
                await move(srcPath, desc);
                if (srcPath !== path) {
                    try {
                        await fs.promises.unlink(".DS_Store")
                        await fs.promises.rmdir(path,);
                    } catch {
                    }
                }
                await log(`${srcPath} --> ${desc}`);
            } catch (error) {
                console.log(colors.red(error.message));
                await this.backup(path, Path.join("重复", descPath));
                await log(`${srcPath} --> move failed`);
            }
            await sleep(1000);
        }
        await Promise.all(imageDownloader)
        console.log(colors.green("图片全部下载完成"));
    }

    private async sourcePath(path: string): Promise<string> {
        const childs = await fs.promises.readdir(path)
        const files = childs.filter(p => !p.startsWith("."))
        if (files.length == 1) {
            const childPath = Path.join(path, files[0])
            const stat = await fs.promises.lstat(childPath)
            console.log(`${path} -> ${stat}`)
            if (stat.isDirectory()) {
                console.log(`调整到子目录： ${childPath}`);
                return childPath
            }
        }
        return path
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