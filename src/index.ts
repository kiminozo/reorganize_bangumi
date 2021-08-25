import { Worker } from "./worker";
import Path = require('path');


async function main() {
    const root = "/Volumes/anime";
    //  const root = "output";
    const src = Path.join(root, "未整理");
    const desc = Path.join(root, "新番")
    const backup = Path.join(root, "失败")
    const worker = new Worker(src, desc, { deeps: 0, backup });
    worker.start();
}

main();