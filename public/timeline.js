
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

	posts = [...posts, ...data.data.posts];
	accounts = {
		...accounts,
		...data.data.accounts
	};

	addPosts(data.data.posts);

	console.log(data);

}

function addPosts(posts) {
	console.log(posts);
	for(let post of posts) {
		let node = document.importNode(document.querySelector("template.post").content, true);

		let author = accounts[post.authorID];
		let name = author.displayName || `@${author.username}`;
		node.querySelector(".userImg").src = author.avatarURL;
		node.querySelector(".userDisplay").innerHTML = name + `<sup class="postTimeOffset">${getTimeoffset(post)}</sup>`;
		
		node.querySelector(".postCaption").innerHTML = post.caption;
		node.querySelector(".likesSpan").innerHTML = post.likeCount;
		node.querySelector(".likes").setAttribute("data-liked", post.likedByMe);
		node.querySelector(".likes").setAttribute("data-post-id", post.id);

		node.querySelector("video").src = post.videoSrc;
		node.querySelector("video").poster = post.thumbSrc;

		node.querySelector("video").load();
		node.querySelector("video").pause();

		node.querySelector(".likes").addEventListener("click", like);

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

async function like(evt) {
	let el = evt.currentTarget;
	if(el.getAttribute("data-liked") === "true") return;

	let postID = el.dataset.postId;
	await fetch("/like?id=" + postID);
	el.setAttribute("data-liked", true);
	let likesSpan = el.querySelector(".likesSpan");
	let currentLikes = Number(likesSpan.innerText);
	likesSpan.innerText = currentLikes + 1;
}

function getTimeoffset(post) {
	
	let distance = Date.now() - (post.date * 1e3);

	let days = Math.floor(distance / (1000 * 60 * 60 * 24));
	let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	
	if(days > 0) return `${days}d`;
	if(hours > 0) return `${hours}h`;
	if(minutes > 0) return `${hours}m`;
	if(seconds > 5) return `${seconds}s`;
	return "Now";
}

async function init() {
	fetchTimeline();
}

window.addEventListener("load", init);