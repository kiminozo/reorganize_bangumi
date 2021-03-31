import * as fs from "fs"
import Path = require('path');
import colors = require('colors/safe');

export async function scan(path: string, deep: number): Promise<string[]> {
    let stack = await fs.promises.readdir(path);
    stack = stack.map(p => Path.join(path, p))
        .filter(p => fs.lstatSync(p).isDirectory());
    for (let i = 0; i < deep; i++) {
        let dirs = [...stack];
        stack.splice(0, stack.length);
        for (const child of dirs) {
            // let stat = await fs.promises.lstat(child);
            // if (!stat.isDirectory()) {
            //     continue;
            // }
            let tmp = await fs.promises.readdir(child);
            tmp.map(p => Path.join(child, p))
                .filter(p => fs.lstatSync(p).isDirectory())
                .forEach(p => stack.push(p));
        }
    }
    return stack;
}

export async function move(src: string, desc: string) {
    // let desc = Path.join("output", bgm.sort_out_path(item));
    if (src === desc) {
        return;
    }
    try {
        await fs.promises.mkdir(Path.dirname(desc), { recursive: true })
    } catch (error) {

    }
    await fs.promises.rename(src, desc);
}
