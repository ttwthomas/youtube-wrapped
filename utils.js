function filterCurrentYear(video) {
  return Date.parse(video.time) > Date.parse('2022 GMT+1');
}
function filternotAfter(video) {
  return Date.parse(video.time) < Date.parse('2021 GMT+1');
}
function filterRemovedVideos(video) {
  return video.subtitles !== undefined;
}
function filterRemoveNonVideoFromComments(comment) {
  return comment.includes("a comment on a video");;
}

function sortObjectByValue(obj) {
  // convert the object into an array of key-value pairs
  const entries = Object.entries(obj);

  // sort the array by the numerical value of the second element in each pair (i.e. the value)
  entries.sort((a, b) => a[1] - b[1]);

  // convert the sorted array back into an object
  return entries.reverse();
}

function findMostFrequentChannel(videos) {
  // create an object to keep track of the count for each string
  const count = {};
  // loop through the array and count the occurences of each string
  for (const video of videos) {
    if (video.subtitles && video.subtitles[0].name) {
      channelName = video.subtitles[0].name;
      if (count[channelName]) {
        count[channelName]++;
      } else {
        count[channelName] = 1;
      }
    }
  }

  // loop through the object and find the string with the highest count
  let mostFrequent;
  let highestCount = 0;
  for (const channel in count) {
    if (count[channel] > highestCount) {
      mostFrequent = channel;
      highestCount = count[channel];
    }
  }

  const sortedCount = sortObjectByValue(count);
  return { "mostFrequent": mostFrequent, "count": sortedCount, "mostViewed": sortedCount[0][0] };
}

function findMostViewedVideo(videos) {
  // create an object to keep track of the count for each string
  const count = {};
  // loop through the array and count the occurences of each string
  for (const video of videos) {
    if (video.titleUrl) {
      videoUrl = video.titleUrl;
      if (count[videoUrl]) {
        count[videoUrl]++;
      } else {
        count[videoUrl] = 1;
      }
    }
  }
  // loop through the object and find the string with the highest count
  let mostViewed;
  let highestCount = 0;
  for (const url in count) {
    if (count[url] > highestCount) {
      mostViewed = url;
      highestCount = count[url];
    }
  }

  const sortedCount = sortObjectByValue(count);
  return { "count": sortedCount, "mostViewed": sortedCount[0][0], "list": count };
}

async function topCreators(history) {
  let mostViewedChannel = findMostFrequentChannel(history)
  let topCreatorsDivs = [];
  for (var i = 0; i < 5; i++) {
    topCreatorsDivs.push(`
    <div class="creator">
    <img class="creator-image" src="${await getPP(mostViewedChannel.count[i][0], history)}" alt="creator 1">
    <div class="creator-name">#${i + 1} ${mostViewedChannel.count[i][0]} (${mostViewedChannel.count[i][1]}x)</div>
    </div>
    `)
  }
  const topCreators = `
  <h1>Your Top Youtuber of 2022</h1>
  <div class="top-creators">
    ${topCreatorsDivs.join('')}
  </div>
  `;

  $(".top-creators").replaceWith(topCreators);
}

async function topVideos(history) {
  var mostViewedVideo = findMostViewedVideo(history)
  let topVideosDivs = [];
  for (var i = 0; i < 3; i++) {
    videoURL = mostViewedVideo.count[i][0]
    videoID = videoURL.split("?v=")[1]
    videoName = history.find(x => x.titleUrl == mostViewedVideo.count[i][0]).title.split("Watched ")[1]
    topVideosDivs.push(`
    <div class="video">
      <div class="video-rank">${i + 1}.</div>
      <div class="video-name">
        <img src="https://i.ytimg.com/vi/${videoID}/hqdefault.jpg"/>
        <br/>
        <a href="${videoURL}">
          ${videoName}
        </a>
        <br/>
        <a>
        Watched ${mostViewedVideo.count[i][1]} times
        </a>
      </div>
    </div>
    `)
  }
  const topVideo = `
  <h1>Most Viewed Video of 2022</h1>
  <div class="top-videos">
    ${topVideosDivs.join('')}
  </div>
  `;

  $(".top-video").replaceWith(topVideo);
}

async function topSummary(history) {
  let firstVideoOfYear = history[history.length - 1]
  let firstVideoName = firstVideoOfYear.title.length < 57 ? firstVideoOfYear.title.split("Watched ")[1] : firstVideoOfYear.title.split("Watched ")[1].slice(0, 50) + "..."
  let videoID = firstVideoOfYear.titleUrl.split("?v=")[1]
  let historylength = history.length
  let channelWatched = findMostFrequentChannel(history).count.length

  const topSummaryDiv = `
    <div class="top-summary">
      <div>
        <h2>Videos watched in 2022</h2>
        <a style="justify">${historylength}</a> <br/>
      </div>
      <div class="firstVideoOfYear">
        <h2>First video watched of the year</h2>
        <img href="${firstVideoOfYear.titleUrl}" src="https://i.ytimg.com/vi/${videoID}/hqdefault.jpg"/><br/>
        <a href="${firstVideoOfYear.titleUrl}">${firstVideoName}</a><br/>
        <a> by ${firstVideoOfYear.subtitles[0].name}</a> <br/>
      </div>
      <div>
        <h2>Channels watched</h2>
        <a>${channelWatched}</a> <br/>
      </div>
    </div>
  `;
  $(".top-summary").replaceWith(topSummaryDiv);
}

function getMostCommentedChannel(history, comments) {

}

async function topComments(commentsList) {
  let numberOfComments = commentsList.length
  let firstCommentOfYear = commentsList[numberOfComments - 1]
  const topCommentDiv = `
    <div class="top-comment">
      <div>
        <h2>Number of comment in 2022</h2>
        <a style="justify">${numberOfComments}</a> <br/>
      </div>
      <div>
        <h2>Channel most commented on in 2022</h2>
        <div class="creator">
          <img class="creator-image" src="" alt="creator 1">
          <div class="creator-name"> (x)</div>
        </div>
      </div>
      <div class="firstVideoOfYear">
        <h2>First comment of 2022</h2>
        <img href="${firstCommentOfYear.commentURL}" src="${firstCommentOfYear.videoThumbnail}"/><br/>
        <a href="${firstCommentOfYear.commentURL}">${firstCommentOfYear.comment}</a><br/>
      </div>
    </div>
  `;
  console.log(topCommentDiv)
  $(".top-comments").replaceWith(topCommentDiv);
}


function getCommentsList(comments){
  let commentsList= [];
  for (let i = 0; i < comments.length; i++) {
    let commentText = comments[i].innerText.split(" UTC.")[1]
    let commentTime = new Date(comments[i].innerText.split(" UTC.")[0].split("video at ")[1])
    let commentURL = comments[i].innerHTML.split('"')[1].replace("&amp;","&")
    let videoID = commentURL.split("&")[0].split("?v=")[1]
    let videoThumbnail = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`
    let commentUrl = comments[i].innerHTML.split('"')[1]
    
    let commentObj = {
      "comment": commentText,
      "time": commentTime,
      "commentURL" : commentURL,
      "videoThumbnail" : videoThumbnail
    }
    if (!comments[i].innerHTML.includes("\">post</a>")){
      commentsList.push(commentObj)
    }
  }

  commentsList = commentsList.filter(filterCurrentYear)
  console.log(commentsList)

  return commentsList;
}

async function getPP(channelName, history) {
  channelURL = history.find(video => video.subtitles[0].name === channelName).subtitles[0].url
  channelID = channelURL.split("youtube.com/")[1].split("channel/").reverse()[0]
  url = "https://bd78-207-134-103-162.ngrok.io/channel-picture?channel_id=" + channelID
  return fetch(url,
    {
      headers: {
        "ngrok-skip-browser-warning": true
      }
    })
    .then((response) => response.json())
    .then((data) => data.picture_url)
    .catch((error) => {
      console.error('Error:', error);
      return "defaultpp.png";
    });
}



// TODO
// in python app if id start with @ use search :
// https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=channel&q=DrippedShorts
// et garder le 1er result
