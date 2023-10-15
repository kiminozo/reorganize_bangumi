import { Item, sort_out_path, quarter, title, EpItem } from "./bgm";
import { scan, move } from './files'
import * as fs from "fs"
import Path = require('path');
import { infoApi } from "./bgm"
import { makeNfo, matchNames } from "./nfoConveter";
import { downImage } from "./download";
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

async function reorganizePath(root: string, path: string, short: boolean): Promise<void> {
    const item = await readData(path);
    if (!item) {
        return;
    }
    try {
        // const desc = Path.join(root, sort_out_path(item));
        const basename = Path.basename(path);
        //const descRoot = Path.dirname(Path.dirname(path));
        const desc = Path.join(root, quarter(new Date(item.air_date), short), basename);
        await move(path, desc);
        console.log(`move ${path} --> ${desc} `);
        await log(`move ${path} --> ${desc} `);
    } catch (err) {
        console.log(err.message);
    }
}

async function updateInfo(path: string): Promise<void> {
    const item = await readData(path);
    console.log(path)
    if (!item) {
        return;
    }
    const epItems = item.eps as EpItem[]
    if (epItems[0]) {

        return;
    }
    console.log("更新：" + path)
    const newItem = await infoApi(item.id)
    if (!newItem) {
        return;
    }
    await fs.promises.writeFile(Path.join(path, "data.json"), JSON.stringify(newItem, null, 1));
    //await downImage(item.images.large, Path.join(path, "Poster.jpg"))
}



async function reorganizeAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    await Promise.all(dirs.map(dir => reorganizePath(root, dir, true)));
}

async function updateInfoAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    console.log(dirs)
    //await waitAllLimit(dirs.map(dir => updateInfo(dir)), 1)
    for (const dir of dirs) {
        //console.log(dir)
        await updateInfo(dir)
        //await makeNfo(dir)
    }
    // await Promise.all(dirs.map(dir => updateInfo(dir)));

}

async function updateNfoAll(root: string, deep: number) {
    const dirs = await scan(root, deep);
    for (const dir of dirs) {
        console.log(dir)
        await makeNfo(dir)
    }
    //   await waitAllLimit(dirs, 2, path => updateNfo(path));
}

async function checkNfo(path: string) {

}

async function updateNfo(path: string) {
    let exist = false
    try {
        const files = await fs.promises.readdir(path)
        const mapFiles = files.filter(file => Path.extname(file) === ".nfo")
        if (mapFiles.length < 5) {
            const item = await readData(path);
            const epItems = item.eps as EpItem[]
            let count = epItems.filter(ep => ep.type === 0).length
            console.log(mapFiles.length + "/" + count)
            exist = mapFiles.length >= count
        } else {
            exist = true;
        }
        if (exist) {
            console.log(mapFiles)
            return
        }
    } catch (error) {
    }
    await makeNfo(path)
}

async function waitAllLimit<T, R>(source: T[], limit: number, func: (item: T) => Promise<R>): Promise<void> {
    // const result: T[] = []
    while (source.length > 0) {
        // 100 at at time
        const children = source.splice(0, limit);
        const childrenResult = await Promise.all(children.map(func));
        // result.push(...childrenResult)
    }
    // return result;
}

async function flatFile(path: string) {
    //let epNames = []
    console.log(path)
    try {
        const files = await fs.promises.readdir(path)
        const names: string[] = []
        for (const file of files) {
            if ((await fs.promises.lstat(Path.join(path, file))).isDirectory()) {
                names.push(file)
            }
        }
        const epNames = matchNames(names, names.length)
        console.log(epNames)
        for (const ep of epNames) {
            const children = await fs.promises.readdir(Path.join(path, ep.name))
            for (const child of children) {
                await fs.promises.rename(Path.join(path, ep.name, child),
                    Path.join(path, child))
            }
            await fs.promises.rmdir(Path.join(path, ep.name))
        }
    } catch (error) {
        console.log(error)
    }
}

async function loadError(file: string) {
    const data = await fs.promises.readFile(file, 'utf-8');
    const errors = data.split("\r\n").filter(p => p !== "")
    //console.log(errors)
    const items = errors.map(line => {
        const s = line.split(":")
        return { path: s[0], type: s[1] }
    })
    //.filter(p => p.type == "异常")
    for (const item of items) {
        //await flatFile(item.path)
        // await makeNfo(item.path)
        await fs.promises.rename(item.path, Path.join("/Volumes/anime/重新整理", Path.basename(item.path)))
    }
}

//reorganizeAll(Path.join("/Volumes/drama/"), 2)
//updateInfoAll(Path.join("/Volumes/pt", "新番"), 2)
//console.log("fate/stay night".replace(/\//gi, " "));
//updateNfoAll(Path.join("/Volumes/anime", "2010s"), 1)

//
//updateNfoAll("/Volumes/hd/", 1)
//updateInfo(Path.join("/Volumes/anime/2020s/", "2020-04", "ARTE"))
makeNfo("/Volumes//hd/2000s/你所期望的永远")

//makeNfo(Path.join("/Volumes/hd/2010s/四月是你的谎言"))
//loadError("nfo-output.log")