import { Worker } from "./worker";
import Path = require('path');


async function main() {
    const root = "/Volumes/anime";
    //  const root = "output";
    const src = Path.join(root, "old");
    const desc = Path.join(root, "新番")
    const backup = Path.join(root, "backup")
    const worker = new Worker(src, desc, { deeps: 1, backup });
    worker.start();
}

main();