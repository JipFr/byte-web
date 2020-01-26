
require("dotenv").config();

const fetch = require("node-fetch");
const express = require("express");
const app = express();

const timelineEndpoint = "https://api.byte.co/timeline";
const likeEndpoint = "https://api.byte.co/post/id/%ID%/feedback/like";

async function fetchTimeline(timelineCursor = null) {

	let timelineReq = await fetch(timelineEndpoint + (timelineCursor ? `?cursor=${timelineCursor}` : ""), {
		":authority": "api.byte.co",
		headers: {
			"accept": "*/*",  
			"accept-encoding": "gzip;q=1.0, compress;q=0.5", 
			"user-agent": "byte/0.2 (co.byte.video; build:145; iOS 13.3.0) Alamofire/4.9.1", 
			"accept-language": "en-GB;q=1.0, nl-GB;q=0.9", 
			"authorization": process.env.auth 
		}
	});
	let data = await timelineReq.json();

	console.log(data);

	timelineCursor = data.data.cursor;

	return data;

}

async function likePost(id = null) {
	if(!id) return null;

	let likeReq = await fetch(likeEndpoint.replace("%ID%", id), {
		":authority": "api.byte.co",
		method: "PUT",
		headers: {
			"accept": "*/*",  
			"accept-encoding": "gzip;q=1.0, compress;q=0.5", 
			"user-agent": "byte/0.2 (co.byte.video; build:145; iOS 13.3.0) Alamofire/4.9.1", 
			"accept-language": "en-GB;q=1.0, nl-GB;q=0.9", 
			"authorization": process.env.auth 
		},
		body: JSON.stringify({
			"postID": id 
		})
	});
	let data = await likeReq.json();
	
	return data;

}

/* (async () => {
	let data = await fetchTimeline();
})(); */

app.get("/timeline", async (req, res) => {
	let data = await fetchTimeline(req.query.cursor || null);
	res.json(data);
});

app.get("/like", async (req, res) => {
	let data = await likePost(req.query.id);
	res.json(data);
});

app.use(express.static("public"));

app.listen(process.env.port || 80, () => {
	console.log("App is live");
});