import { Worker } from "./worker";
import Path = require('path');
import { BgmType } from "./bgm";


async function main() {
    const root = "/Volumes/anime";
    //  const root = "output";
    const src = Path.join(root, "#未整理");
    const desc = Path.join(root)
    const backup = Path.join(root, "#失败")
    const worker = new Worker(src, { deeps: 0, desc, backup, type: BgmType.anime });
    worker.start();
}

// async function aria2() {
//     const root = "/Volumes/aria2";
//     const worker = new Worker(root, { deeps: 0 });
//     worker.start();
// }

main();