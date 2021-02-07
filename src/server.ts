import * as http from 'http';
//import { TmDB } from './match'
import { MovieDb } from 'moviedb-promise'
const apiKey: string = "5501399346685e41aa3df9c47ed4671f";
const db = new MovieDb(apiKey);

const server = http.createServer(async (request, response) => {
    console.log("create a server...");
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello world!');
    try {
        let res = await db.searchKeyword({ query: '无职' });
        response.write(JSON.stringify(res));



    } catch (error) {
        response.write(JSON.stringify(error));
    }
    response.end();

});

server.listen(3000, function () {
    console.log("Server listening on port 3000");
    console.log("test...");
});