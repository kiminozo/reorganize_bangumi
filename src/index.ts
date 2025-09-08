import { Worker } from "./worker";
import Path = require('path');
import { BgmType } from "./bgm";
import inquirer = require('inquirer');

let choices = [
    { name: "番剧", path: "/Volumes/anime", type: BgmType.anime, deeps: 0, shortPath: false },
    { name: "日剧", path: "/Volumes/drama", type: BgmType.drama, deeps: 0, shortPath: true },
    { name: "高清", path: "/Volumes/hd", type: BgmType.anime, deeps: 0, shortPath: true },]

async function main() {
    const root = "/Volumes/anime";
    //  const root = "output";
    const src = Path.join(root, "#未整理");
    const desc = Path.join(root)
    const backup = Path.join(root, "#失败")
    const worker = new Worker(src, { deeps: 0, desc, backup, type: BgmType.anime });
    worker.start();
}

async function select() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '选择下载类型',
            choices: choices.map(i => i.name)
        }
    ]);
    const choice = choices.find(i => i.name === answers.choice);
    if (choice) {
        const root = choice.path || "/Volumes/anime";
        //  const root = "output";
        const src = Path.join(root, "#未整理");
        const desc = Path.join(root)
        const backup = Path.join(root, "#失败")
        const worker = new Worker(src, { deeps: choice.deeps, desc, backup, type: choice.type, shortPath: choice.shortPath });
        worker.start();
    }
}


// main();
select();

// async function aria2() {
//     const root = "/Volumes/aria2";
//     const worker = new Worker(root, { deeps: 0 });
//     worker.start();
// }

//main();