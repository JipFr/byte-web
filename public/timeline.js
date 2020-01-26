
let currentTimelinePost;
let timelineData;
let timelineCursor;
let accounts = {};
let posts = [];
let audioUnlock = true;

async function fetchTimeline() {
	let timelineReq = await fetch(`/timeline${timelineCursor ? `?cursor=${timelineCursor}` : ""}`);
	let data = await timelineReq.json();

	timelineCursor = data.data.cursor;

	addPosts(data.data.posts);

	posts = [...posts, ...data.data.posts];

	console.log(data);

}

function addPosts(posts) {
	console.log(posts);
	for(let post of posts) {
		let node = document.importNode(document.querySelector("template.post").content, true);

		node.querySelector("video").src = post.videoSrc;
		node.querySelector("video").poster = post.thumbSrc;

		node.querySelector("video").load();
		node.querySelector("video").pause();

		document.querySelector(".posts").appendChild(node);
	}

	audioUnlock = true;

	

}

document.addEventListener("touchstart", unlockAudio);
document.addEventListener("mousedown", unlockAudio);

async function unlockAudio() {
	console.log(audioUnlock);
	if(audioUnlock) {
		for(let video of document.querySelectorAll("video")) {
			let b4 = video.currentTime;
			video.play();
			video.pause();
			video.currentTime = b4;
		}
		console.log("Unlocked audio");
		audioUnlock = false;
	}
}

function findCurrent() {
	let divs = document.querySelectorAll(".posts .post");
	for(let postDiv of divs) {
		let rect = postDiv.getBoundingClientRect();
		let top = rect.top;

		if(top > -10 && top < 10) {
			return postDiv;
		}

	}

	return currentTimelinePost;

}

async function updateVideo() {
	document.querySelectorAll(".posts video").forEach(video => video.pause());

	document.querySelectorAll(".currentPost").forEach(el => el.classList.remove("currentPost"));

	currentTimelinePost.classList.add("currentPost");
	currentTimelinePost.querySelector("video").currentTime = 0;
	await currentTimelinePost.querySelector("video").play();

	return true;

}

function updateTimeline() {
	let postsDiv = document.querySelector(".posts");
	let index = [...postsDiv.children].indexOf(currentTimelinePost);
	let endOffset = postsDiv.children.length - index;
	console.log(index, endOffset);

	if(endOffset < 3) {
		fetchTimeline();
	}

}

document.addEventListener("scroll", async () => {
	let currentPost = findCurrent();

	if(currentTimelinePost !== currentPost) {
		currentTimelinePost = currentPost;
		await updateVideo();
		updateTimeline();
	}

});

document.addEventListener("keyup", evt => {
	if(evt.key === "ArrowDown") {
		evt.preventDefault();
		console.log("STOP")
	}
});

async function init() {
	fetchTimeline();
}

window.addEventListener("load", init);