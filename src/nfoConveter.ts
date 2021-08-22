import * as fs from "fs"
import Path = require('path')
import { Item, title } from "./bgm"
import { Tvshow, TvshowInfo } from "./nfo"
import { Builder } from 'xml2js'
import { findBestMatch } from "string-similarity";
const builder = new Builder()

const videoExts: Set<string> = new Set([".mp4", ".mkv", ".rmvb"])

async function testRead(): Promise<Item> {
    const jsonItem = await fs.promises.readFile(Path.join("tests", "data.json"), 'utf-8')
    const item: Item = JSON.parse(jsonItem)
    return item
}

async function findNames(path: string, epCount: number): Promise<string[]> {
    const files = await fs.promises.readdir("tests")
    //console.log(files)
    const nameList: string[] = []
    for (const name of files) {
        const ext = Path.extname(name)
        // if (!videoExts.has(ext)) {
        //     continue
        // }
        if ((await fs.promises.stat(Path.join(path, name))).isDirectory()) {
            continue
        }

        nameList.push(name)
    }
    const sortNameList = nameList.sort((a, b) => b.length - a.length)
    const mainName = sortNameList[epCount / 2]
    console.log(mainName)
    const match = findBestMatch(mainName, nameList)
    const result = match.ratings.filter(p => p.rating > 0.9)
    // .flatMap(p => p.rating)
    console.log(result)
    return nameList

}

function conveter(item: Item) {
    const title = item.name_cn != null ? item.name_cn : item.name
    const summary = item.summary
    const tvshow: Tvshow = {
        title: title,
        originaltitle: item.name,
        sorttitle: title,
        showtitle: title,
        plot: summary,
        outline: summary,
        rating: item.rating.score.toString(),
        year: "",
        premiered: item.air_date,
        releasedate: item.air_date,
        season: "1",
        episode: "1",
        displayorder: "1",
        status: "Ended",
        displayseason: "",
        displayepisode: "",
    }
    const nfo: TvshowInfo = { tvshow }
    return nfo
}

async function saveNfo(nfo: TvshowInfo, path: string) {
    const xml = builder.buildObject(nfo);
    console.log(xml)
    try {
        await fs.promises.mkdir(Path.dirname(path), { recursive: true })
    } catch (error) {

    }
    await fs.promises.writeFile(Path.join(path, "tvshow.nfo"), xml, "utf-8")
}

async function test() {
    const item = await testRead()
    console.log(item)
    const nfo = conveter(item)
    console.log(nfo)
    await saveNfo(nfo, "output")

    // for (let i = 0; i < 12; i++) {
    //     const path = Path.join("tests", `[Airota & Nekomoe kissaten][Machikado Mazoku][0${i}][720p][CHS].mp4`)
    //     await fs.promises.writeFile(path, "", "utf-8")
    // }
}

async function test2() {
    const names = await findNames("tests", 12)
    // console.log(names)
}

test2()