const regex = /\[[^\[\]]*\]\s*\[?([^\[\]]+)\]?.*/;
const numberReg = /^[0-9\-]+$/;
const regex2 = /\[?([^\[\]]+)\]?.*/;

export function extract(line: string): string {
    const r1 = regex.exec(line);
    let res = r1 && r1.length > 1 ? r1[1] : line;
    if (numberReg.test(res)) {
        const r2 = regex2.exec(line);
        res = r2 && r1.length > 1 ? r2[1] : line;
    }
    res = res.replace(/_/gi, " ")
    return res;
}

// console.log(regex2.exec("[Runway de Waratte][01-12][BIG5][1080P]"));
//console.log(extract("[Oshibudo][01-12][BIG5][720P]"));