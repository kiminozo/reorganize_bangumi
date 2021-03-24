import { Worker } from "./worker";
import Path = require('path');

async function test() {
    const src = Path.join("output", "old");
    const desc = Path.join("output", "新番")
    const backup = Path.join("output", "backup")
    const worker = new Worker(src, desc, { deeps: 2, backup });
    worker.start();
}

async function main() {
    const src = Path.join("/Volumes/anime", "old");
    const desc = Path.join("/Volumes/anime", "新番")
    const backup = Path.join("/Volumes/anime", "backup")
    const worker = new Worker(src, desc, { deeps: 2, backup });
    worker.start();
}

test();