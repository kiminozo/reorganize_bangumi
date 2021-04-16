import superagent = require('superagent');
import cheerio = require('cheerio');
import * as fs from "fs"
import Path = require('path');

function agent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, docs) => {
                if (err) {
                    return reject(err);
                }
                // 成功解析
                resolve(docs.text);
            })
    })
}
type WatchType = 'collect' | 'wish' | 'do' | 'on_hold' | 'dropped'

interface WatchData {
    id: number;
    title: string;

}

interface WatchInfo {
    type: WatchType;
    count: number;
    dataList?: WatchData[];
}

interface UserWatchInfo {
    user: string;
    info: WatchInfo[];
}


async function getWatch(user: string, type: WatchType, page: number): Promise<WatchData[]> {
    const url = `http://bgm.tv/anime/list/${user}/${type}?page=${page}`;
    console.log(url);
    let html = await agent(url);
    const subStart = '/subject/'.length;
    const $ = cheerio.load(html);
    const dataList: WatchData[] = [];
    $("#browserItemList h3 a").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        //  console.log(item.text());
        const href = item.attr()['href'];
        const id = parseInt(href.substring(subStart, href.length));
        const data: WatchData = { id, title: item.text() };
        console.log(data);
        dataList.push(data);
    });
    //console.debug(dataList.length);
    //$("",item)
    return dataList;
}
const regex = /(\S+)\s{1}\((\d+)\)/;

function getWatchType(typeCN: string): WatchType {
    switch (typeCN) {
        case '想看':
            return 'wish';
        case '在看':
            return 'do';
        case '搁置':
            return 'on_hold';
        case '抛弃':
            return 'dropped';
        default:
            return 'collect'
    }
}

async function getInfo(user: string) {
    const url = `http://bgm.tv/anime/list/${user}`;
    console.log(url);
    let html = await agent(url);
    const $ = cheerio.load(html);
    const infoList: WatchInfo[] = [];
    $("ul.navSubTabs li a span").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        const text = item.text();
        const matches = regex.exec(text);
        const info: WatchInfo = {
            type: getWatchType(matches[1]),
            count: parseInt(matches[2]),
        }
        infoList.push(info);
        // console.log(info);
    });

    for (const info of infoList) {
        const pageCount = info.count / 24 + 1;
        const dataList: WatchData[][] = [];
        for (let page = 1; page < pageCount; page++) {
            const data = await getWatch(user, info.type, page);
            dataList.push(data);
        }
        info.dataList = dataList.flat();
        //console.log(info.dataList);
        // break;
    }

    for (const info of infoList) {
        console.log(info);
    }

    const userInfo: UserWatchInfo = { user, info: infoList };
    await fs.promises.writeFile(Path.join("output", `user-${user}.json`),
        JSON.stringify(userInfo, null, 1));
}

//getWatch("kiminozo", 'collect', 1);
getInfo("kiminozo")