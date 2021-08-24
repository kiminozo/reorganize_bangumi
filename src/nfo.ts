



export interface TvshowInfo {
    tvshow: Tvshow;
}

export interface EpisodeDetailsInfo {
    episodedetails: EpisodeDetails;
}
export interface SeasonInfo {
    season: Season
}


export interface Tvshow {
    title: string;
    originaltitle: string;
    sorttitle?: string;
    plot?: string;
    outline?: string;
    lockdata?: string;
    lockedfields?: string;
    dateadded?: string;
    rating?: string;
    year?: string;
    premiered?: string;
    releasedate?: string;
    //studio?:         string;
    season?: string;
    episode?: string;
    displayorder?: string;
    status: string;
    showtitle?: string;
    displayseason?: string;
    displayepisode?: string;
    // thumb:          Thumb;
    // code:           Aired;
    // aired:          Aired;
    // namedseason:    Namedseason;
}

export interface EpisodeDetails {
    title: string;
    sorttitle: string;
    season: string;
    episode: string;
}

export interface Season {
    title: string;
    sorttitle: string;
    season: string;
}



//var obj = { root: { $: { id: "my id" }, _: "my inner text" } };

//var builder = new Builder();
//var s: TvNfo = { tvshow: { title: "魔族", originaltitle: "originaltitle", showtitle: "showtitle" } }
//var xml = builder.buildObject(s);
//console.log(xml)

//export function 
