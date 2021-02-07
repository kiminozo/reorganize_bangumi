import { MovieDb } from 'moviedb-promise'
//import axios, { AxiosProxyConfig } from 'axios'
import { httpsOverHttp } from 'tunnel'


const apiKey: string = "5501399346685e41aa3df9c47ed4671f";
const db = new MovieDb(apiKey);

const proxy = {
    host: "127.0.0.1",
    port: 10080,
};

const axiosConfig = { httpsAgent: httpsOverHttp({ proxy: proxy }) };
const params = {
    language: 'zhCN'
}
async function test() {
    try {
        let res = await db.searchTv({ query: '无职', language: 'zh-CN' }, axiosConfig);
        console.log(res);

        //if (res.results && res.results.length > 0) {
        let info = await db.tvInfo({ id: 94664, language: 'zh-CN' }, axiosConfig)
        console.log(info);
        // }

    } catch (error) {
        console.log(error);
    }
}

// async function test2() {
//     try {
//         let res = await axios.get("https://api.github.com/feeds",
//             { httpsAgent: httpsOverHttp({ proxy: proxy }) });
//         console.log(res.data);
//     } catch (err) {
//         console.error(err);
//     }
// }

console.log("hello world");
test();