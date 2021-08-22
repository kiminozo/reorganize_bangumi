import * as fs from "fs"
import Path = require('path')
import { Item, title } from "./bgm"
import { Tvshow, TvshowInfo } from "./nfo"
import { Builder } from 'xml2js'
const builder = new Builder()

async function testRead(): Promise<Item> {
    const jsonItem = await fs.promises.readFile(Path.join("tests", "data.json"), 'utf-8')
    const item: Item = JSON.parse(jsonItem)
    return item
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
}

test()