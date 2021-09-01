import * as fs from "fs"
import Path = require('path')
import { EpItem, Item, title } from "./bgm"
import { EpisodeDetailsInfo, SeasonInfo, Tvshow, TvshowInfo } from "./nfo"
import { Builder } from 'xml2js'
import { findBestMatch } from "string-similarity";
const builder = new Builder()

const videoExts: Set<string> = new Set([".mp4", ".mkv", ".rmvb", ".flv"])
const dataFileName = "data.json";

async function testRead(): Promise<Item> {
    return readData("tests")
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

interface EpName {
    name: string
    ep: number
}

function findSample(list: string[]): string {
    const map = new Map<number, string[]>();
    list.forEach((item) => {
        const key = item.length;
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    const values = [...map.values()]
    const max = values.map(p => p.length).reduce((max, p) => max = Math.max(max, p), 0)
    return values.find(p => p.length == max)[Math.floor(max / 2)];
}

export function matchNames(nameList: string[], count: number = 12): EpName[] {
    //const sortNameList = nameList.sort((a, b) => b.length - a.length)
    // console.log(nameList)
    const sampleName = findSample(nameList)

    //console.log(sampleName)
    const match = findBestMatch(sampleName, nameList)
    const rating = 3 / sampleName.length
    const names = match.ratings.filter(p => p.rating > rating)
        .flatMap(p => p.target)
    //console.log(names)
    // const keys = numIndex(sampleName);
    // console.log(numIndex(sampleName))
    const info = numIndex(sampleName).find(d => {
        const tmp = names.map(n => n.substring(0, d.index))
        //console.log(tmp);
        return isSame(sampleName.substring(0, d.index), tmp, count)
    })

    //[Airota & Nekomoe kissaten][Machikado Mazoku][01][720p][CHS]
    // console.log("key：")

    if (info == null) {
        console.log("找不到info", info)
        return []
    }
    const epNames = names.flatMap(n => { return { ep: epNum(n, info.index), name: n } })
        .sort((a, b) => a.ep - b.ep)
    // console.log(epNames)
    return epNames
}

async function findNames(path: string, epCount: number): Promise<EpName[]> {
    const files = await fs.promises.readdir(path)

    const nameList: string[] = []
    for (const name of files) {
        if (name.startsWith(".")) {
            continue
        }
        const ext = Path.extname(name)
        if (!videoExts.has(ext.toLowerCase())) {
            continue
        }
        if ((await fs.promises.stat(Path.join(path, name))).isDirectory()) {
            continue
        }

        nameList.push(name)
    }
    if (nameList.length == 0) {
        console.log(`文件未找到${path}`)
        log(path + ":文件未找到")
        return []
    }
    if (nameList.length < epCount) {
        console.log(`文件未齐 ${nameList.length}/${epCount}`)
        console.log(nameList)
        log(path + ":文件未齐")
        return []
    }
    //console.log(nameList)
    const matchs = matchNames(nameList, epCount)
    if (!matchs || matchs.length === 0) {
        log(path + ":无法匹配")
    }
    return matchs
}

interface NumIndexData {
    key: string
    index: number
}


function numIndex(name: string): NumIndexData[] {
    const result: NumIndexData[] = []
    const regexp = /\d+/g;
    let m: RegExpExecArray
    do {
        m = regexp.exec(name);
        if (m) {
            m[0]
            result.push({ key: m[0], index: m.index })
        }
    } while (m);
    return result.reverse();
}

function epNum(name: string, index: number): number {
    //console.log(name)
    const test = name.substring(index, name.length - 1)
    //console.log("test:" + test)
    const regexp = /\d+(\.\d)?/g;
    const m = regexp.exec(test);
    if (m) {
        // console.log(m[0])
        return parseFloat(m[0])
    }

}


function isSame(base: string, names: string[], count: number) {
    //console.log(names)
    const sameCount = names.reduce((a, b) => {
        if (a.val === b) {
            a.same = a.same + 1
        }
        return a
    }, { same: 1, val: base }).same
    //console.log("same:" + sameCount + "/" + count)
    return sameCount >= count
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
        id: item.id.toString()
    }
    const nfo: TvshowInfo = { tvshow }
    return nfo
}

function conveterSeason(item: Item) {
    const title = (item.name_cn != null ? item.name_cn : item.name)

    const seasonInfo: SeasonInfo = {
        season: {
            title: title,
            sorttitle: item.name,
            season: '1'
        }
    }
    return seasonInfo;
}

function conveterEp(ep: EpItem) {
    const title = (ep.name_cn != null ? ep.name_cn : ep.name)
    const season = (~~ep.sort == ep.sort) ? "1" : "0"
    const epInfo: EpisodeDetailsInfo = {
        episodedetails: {
            title: title,
            sorttitle: ep.name,
            season: season,
            episode: ep.sort.toString(),
            id: ep.id.toString(),
            releasedate: ep.airdate
        }
    }
    return epInfo;
}

const output = "nfo-output.log";
async function log(text: string) {
    await fs.promises.appendFile(output, text + "\r\n");
}

async function saveNfo(nfo: TvshowInfo, path: string) {
    const xml = builder.buildObject(nfo);
    //console.log(xml)
    try {
        await fs.promises.mkdir(Path.dirname(path), { recursive: true })
    } catch (error) {

    }
    await fs.promises.writeFile(Path.join(path, "tvshow.nfo"), xml, "utf-8")
}

async function saveSeasonNfo(nfo: SeasonInfo, path: string) {
    const xml = builder.buildObject(nfo);
    //console.log(xml)
    await fs.promises.writeFile(Path.join(path, `season.nfo`), xml, "utf-8")
}

async function saveEpNfo(nfo: EpisodeDetailsInfo, path: string, name: string) {
    const xml = builder.buildObject(nfo);
    //console.log(xml)
    await fs.promises.writeFile(Path.join(path, `${Path.parse(name).name}.nfo`), xml, "utf-8")
}


export async function makeNfo(path: string) {
    const item = await readData(path)
    const nfo = conveter(item)
    //console.log(nfo)
    await saveNfo(nfo, path)
    //const season = conveterSeason(item)
    //await saveSeasonNfo(season, path)
    let names: EpName[]
    const epItems = item.eps as EpItem[]
    let count = epItems.filter(ep => ep.type === 0).length
    try {
        names = await findNames(path, count)
    } catch (error) {
        console.log(error)
        log(path + ":异常")
        return
    }
    //console.log(names)
    for (const name of names) {
        let ep = epItems.filter(ep => ep.type === 0)
            .find(ep => ep.sort === name.ep)
        let epNfo: EpisodeDetailsInfo;
        if (!ep) {
            ep = epItems.filter(ep => ep.type === 1)
                .find(ep => ep.sort === name.ep)
            if (!ep) {
                epNfo = {
                    episodedetails: {
                        title: name.name,
                        sorttitle: name.name,
                        season: epItems.length == 1 ? "1" : "0",
                        episode: (name.ep && name.ep < epItems.length + 10) ? name.ep.toString() : "1",
                    }
                }
            } else {
                epNfo = conveterEp(ep)
            }
        } else {
            epNfo = conveterEp(ep)
        }
        //  const nameInfo = Path.parse(name.name)
        // const epName = `.S01E${name.ep.toString().padStart(2, "0")}`
        // const newName = nameInfo.name + epName + nameInfo.ext
        // await fs.promises.rename(Path.join(path, name.name), Path.join(path, newName))
        // let epNfo = conveterEp(ep)
        console.log(`S${epNfo.episodedetails.season}E${epNfo.episodedetails.episode}:${name.name}`)
        await saveEpNfo(epNfo, path, name.name)
    }
}





async function test() {
    const item = await testRead()
    //console.log(item)
    const nfo = conveter(item)
    //console.log(nfo)
    await saveNfo(nfo, "output")

    const names = await findNames("tests", item.eps_count)

    for (const name of names) {
        const epItems = item.eps as EpItem[]
        const ep = epItems.filter(ep => ep.type === 0)
            .find(ep => ep.sort === name.ep)
        if (!ep) {
            continue
        }
        const epNfo = conveterEp(ep)
        await saveEpNfo(epNfo, "output", name.name)
    }
    // for (let i = 0; i < 12; i++) {
    //     const path = Path.join("tests", `[Airota & Nekomoe kissaten][Machikado Mazoku][0${ i }][720p][CHS].mp4`)
    //     await fs.promises.writeFile(path, "", "utf-8")
    // }
}

// async function test2() {
//     const names = await findNames("tests", 12)
//     console.log(names)
// }

//test()