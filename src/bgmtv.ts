import superagent = require('superagent');
import cheerio = require('cheerio');
import * as fs from "fs"
import Path = require('path');
import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync')
import BangumiDB, { WatchType, WatchInfo } from './bgmdb'

function sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


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





async function getWatch(user: string, type: WatchType, page: number): Promise<WatchInfo[]> {
    const url = `http://bgm.tv/anime/list/${user}/${type}?page=${page}`;
    console.log(url);
    let html = await agent(url);
    const subStart = '/subject/'.length;
    const $ = cheerio.load(html);
    const dataList: WatchInfo[] = [];
    $("#browserItemList h3 a").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        //  console.log(item.text());
        const href = item.attr()['href'];
        const id = parseInt(href.substring(subStart, href.length));
        // const data: WatchInfo = { id, title: item.text(), type };
        // console.log(data);
        dataList.push({ id, title: item.text(), type });
    });
    //console.debug(dataList.length);
    //$("",item)
    await sleep(50);
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
    const infoList: { type: WatchType, count: number }[] = [];
    $("ul.navSubTabs li a span").each((_index, ele) => {
        const item = $(ele);
        if (item == null) {
            return;
        }
        const text = item.text();
        const matches = regex.exec(text);
        const info = {
            type: getWatchType(matches[1]),
            count: parseInt(matches[2]),
        }
        infoList.push(info);
        // console.log(info);
    });
    const dataListList: WatchInfo[][] = [];

    for (const info of infoList) {
        const pageCount = info.count / 24 + 1;
        for (let page = 1; page < pageCount; page++) {
            const data = await getWatch(user, info.type, page);
            dataListList.push(data);
        }

        //console.log(info.dataList);
        //break;
    }
    const dataList = dataListList.flat();
    // for (const info of infoList) {
    //     console.log(info);
    // }

    //const userInfo: UserWatchInfo = { user, info: dataList };
    // await fs.promises.writeFile(Path.join("output", `user-${user}.json`),
    //     JSON.stringify(userInfo, null, 1));


    //db.defaults({ info: [], user: {} }).write();
    const db = new BangumiDB(user);
    db.save(dataList);
}



//getInfo("kiminozo");



// const info2 = db.get('info')
//     .filter(p => p.type === 'collect')
//     .get('dataList')
//     .value()
// console.log(info2);