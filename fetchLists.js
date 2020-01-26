
require("dotenv").config();

const fetch = require("node-fetch");

const listEndpoint = "https://api.byte.co/account/me/%list%";

async function getList(list = "followers") {
    let endpoint = listEndpoint.replace(/%list%/, list);
    let listReq = await fetch(endpoint, {
        method: "GET",
        headers: {
			"accept": "*/*",  
			"accept-encoding": "gzip;q=1.0, compress;q=0.5", 
			"user-agent": "byte/0.2 (co.byte.video; build:145; iOS 13.3.0) Alamofire/4.9.1", 
			"accept-language": "en-GB;q=1.0, nl-GB;q=0.9", 
			"authorization": process.env.auth 
		}
    });
    let res = await listReq.json();
    return res.data.accounts;
}

async function getFollowList() {
    const [ followers, following ] = await Promise.all([getList("followers"), getList("following")]);
    return {
        followers: followers.map(u => u.username),
        following: following.map(u => u.username)
    }
}

(async () => {
    console.log(await getFollowList());
})();