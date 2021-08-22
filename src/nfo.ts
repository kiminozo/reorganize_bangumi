import { Builder } from 'xml2js';

interface TvNfo {
    tvshow: {
        title: string
        originaltitle: string
        showtitle: string
    }
}



//var obj = { root: { $: { id: "my id" }, _: "my inner text" } };

var builder = new Builder();
var s: TvNfo = { tvshow: { title: "魔族", originaltitle: "originaltitle", showtitle: "showtitle" } }
var xml = builder.buildObject(s);
console.log(xml)
