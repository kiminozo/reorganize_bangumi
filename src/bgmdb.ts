import * as fs from "fs"
import Path = require('path');
import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync')

export type WatchType = 'collect' | 'wish' | 'do' | 'on_hold' | 'dropped'

export interface WatchInfo {
    id: number;
    title: string;
    type: WatchType;
}

// interface WatchInfo {
//     count: number;
//     dataList?: WatchData[];
// }

export interface WatchDB {
    info: WatchInfo[];
}


export default class BangumiDB {
    db: low.LowdbSync<WatchDB>;

    constructor(user: string) {
        const adapter = new FileSync<WatchDB>(Path.join("output", `${user}.db.json`))
        this.db = low(adapter);
    }

    save(infoList: WatchInfo[]) {
        this.db.set('info', infoList).write();
    }

    get(id: number): WatchInfo | null {
        return this.db.get('info').find({ id }).value()
    }
}
// const info2 = db.get('info')
//     .filter(p => p.type === 'collect')
//     .get('dataList')
//     .value()
const db = new BangumiDB("kiminozo");
console.log(db.get(183957));