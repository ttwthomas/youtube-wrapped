function filterCurrentYear(video) {
  return Date.parse(video.time) > Date.parse('2022 GMT+1');
}
function filterCurrentYearLikes(like) {
  return like[1] > Date.parse('2022 GMT+1');
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
  for (let i = 0; i < 10; i++) {
    topCreatorsDivs.push(`
    <div class="creator">
    <img class="creator-image" src="${await getPP(mostViewedChannel.count[i][0], history)}">
    <div class="creator-name">#${i + 1} ${mostViewedChannel.count[i][0]} (${mostViewedChannel.count[i][1]}x)</div>
    </div>
    `)
  }
  const topCreators = `
  <h1>Your Top Youtubers of <span style="color: red">2022</span></h1>
  <div class="top-creators">
    ${topCreatorsDivs.join('')}
  </div>
  `;

  $(".top-creators").replaceWith(topCreators);
}

async function topVideos(history) {
  let mostViewedVideo = findMostViewedVideo(history)
  let topVideosDivs = [];
  for (let i = 0; i < 10; i++) {
    videoURL = mostViewedVideo.count[i][0]
    videoID = videoURL.split("?v=")[1]
    videoName = history.find(x => x.titleUrl == mostViewedVideo.count[i][0]).title.split("Watched ")[1]
    topVideosDivs.push(`
    <div class="video">
      <div class="video-rank">${i + 1}.</div>
      <div class="video-name">
        <a href="${videoURL}">
          <img src="https://i.ytimg.com/vi/${videoID}/hqdefault.jpg"/>
          <br/>
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
  <h1>Most Viewed Video of <span style="color: red">2022</span></h1>
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
    <h1><span style="color: red">2022</span> Summary</h1>
    <div class="top-summary">
      <div>
        <h3>Videos watched in <span style="color: red">2022</span></h3>
        <h1>${historylength}</h1> <br/>
      </div>
      <div>
      <h3>Channels watched</h3>
      <h1>${channelWatched}</h1> <br/>
      </div>
      <div class="firstVideoOfYear">
        <h3>First video watched of the <span style="color: red">year</span></h3>
        <a href="${firstVideoOfYear.titleUrl}">
          <div class="thumbnail-container">
            <img src="https://i.ytimg.com/vi/${videoID}/hqdefault.jpg"/>
          </div>
          <br/>
          ${firstVideoName}<br/>
        </a>
        by ${firstVideoOfYear.subtitles[0].name}<br/>
      </div>
    </div>
  `;
  $(".top-summary").replaceWith(topSummaryDiv);
}

function getMostCommentedChannel(comments, history) {
  // First, create a map from URLs to creators
  const urlToCreatorMap = new Map();
  for (const video of history) {
    urlToCreatorMap.set(video.titleUrl, video.subtitles[0].name);
  }

  // Next, create a map from creators to the number of comments they have
  const creatorToCommentCountMap = new Map();
  for (const comment of comments) {
    let commentUrl = comment.videoURL.replace("http","https")
    const creator = urlToCreatorMap.get(commentUrl);
    if (creator) {
      if (!creatorToCommentCountMap.has(creator)) {
        creatorToCommentCountMap.set(creator, 0);
      }
      creatorToCommentCountMap.set(creator, creatorToCommentCountMap.get(creator) + 1);
    }
  }

  // Finally, sort the creators by the number of comments they have and return the list
  const creators = [...creatorToCommentCountMap.keys()];
  creators.sort((a, b) => creatorToCommentCountMap.get(b) - creatorToCommentCountMap.get(a));
  return creators.map(creator => ({ creator, count: creatorToCommentCountMap.get(creator) }));
}


async function topComments(commentsList, history) {
  let numberOfComments = commentsList.length
  let firstCommentOfYear = commentsList[numberOfComments - 1]
  let creators = getMostCommentedChannel(commentsList, history)

  let topCreatorsComment = [];
  for (let i = 0; i < 5; i++) {
    let channelName = creators[i].creator;
    topCreatorsComment.push(`
    <div class="commentCreator">
    <img src="${await getPP(channelName, history)}">
    <a>${i+1}.</a>
      <a>${channelName}</a>
      <div> ${creators[i].count} comments</div>
    </div>
  `)}
  
  const topCommentDiv = `
    <h1> Comments </h1>
    <div class="top-comments">
      <div class="comment">
        <h3>Number of comments</h3>
        <h1>${numberOfComments}</h1> 
      </div>
      <div class="comment">
        <h3>Channel most commented on</h3>
        ${topCreatorsComment.join('')}
      </div>
      <div class="comment">
        <h3>First comment of <span style="color: red">2022</span></h3>
        <a href="${firstCommentOfYear.commentURL}">
        <div class="thumbnail-container"><img src="${firstCommentOfYear.videoThumbnail}"/></div>
        <br/>
        ${firstCommentOfYear.comment}</a>
      </div>
    </div>
  `;
  $(".top-comments").replaceWith(topCommentDiv);
}


function getCommentsList(comments){
  let commentsList= [];
  for (let i = 0; i < comments.length; i++) {
    let commentText = comments[i].innerText.split(" UTC.")[1]
    let commentTime = new Date(comments[i].innerText.split(" UTC.")[0].split("video at ")[1])
    let commentURL = comments[i].innerHTML.split('"')[1].replace("&amp;","&")
    let videoURL = commentURL.split("&lc")[0]
    let videoID = videoURL.split("?v=")[1]
    let videoThumbnail = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`
    
    let commentObj = {
      "comment": commentText,
      "time": commentTime,
      "commentURL" : commentURL,
      "videoURL" : videoURL,
      "videoThumbnail" : videoThumbnail
    }
    if (!comments[i].innerHTML.includes("\">post</a>")){
      commentsList.push(commentObj)
    }
  }

  commentsList = commentsList.filter(filterCurrentYear)
  return commentsList;
}

function getMostLikedChannel(likes, history) {
  // First, create a map from URLs to creators
  const urlToCreatorMap = new Map();
  for (const video of history) {
    urlToCreatorMap.set(video.titleUrl, video.subtitles[0].name);
  }

  // Next, create a map from creators to the number of comments they have
  const creatorToCommentCountMap = new Map();
  for (const like of likes) {
    let likeUrl = like[0]
    const creator = urlToCreatorMap.get(likeUrl);
    if (creator) {
      if (!creatorToCommentCountMap.has(creator)) {
        creatorToCommentCountMap.set(creator, 0);
      }
      creatorToCommentCountMap.set(creator, creatorToCommentCountMap.get(creator) + 1);
    }
  }

  // Finally, sort the creators by the number of comments they have and return the list
  const creators = [...creatorToCommentCountMap.keys()];
  creators.sort((a, b) => creatorToCommentCountMap.get(b) - creatorToCommentCountMap.get(a));
  return creators.map(creator => ({ creator, count: creatorToCommentCountMap.get(creator) }));
}


async function topLikes(likesList, history){
  console.log(likesList)
  likesList = likesList.filter(filterCurrentYearLikes)
  console.log(likesList)
  let numberOfLikes = likesList.length
  let firstLikeOfYearURL = likesList[numberOfLikes - 1][0]
  let firstLikeOfYearVideo = history.find(video => video.titleUrl === firstLikeOfYearURL);
  let firstLikeOfYearvideoID = firstLikeOfYearURL.split("?v=")[1]
  let firstLikeOfYear = {
    URL : firstLikeOfYearURL,
    channelName: firstLikeOfYearVideo.subtitles[0].name,
    videoTitle: firstLikeOfYearVideo.title.split("Watched ")[1],
    videoThumbnail: `https://i.ytimg.com/vi/${firstLikeOfYearvideoID}/hqdefault.jpg`
  }
  let creators = getMostLikedChannel(likesList, history)

  let topCreatorsLikes = [];
  for (let i = 0; i < 5; i++) {
    let channelName = creators[i].creator;
    topCreatorsLikes.push(`
    <div class="commentCreator">
    <img src="${await getPP(channelName, history)}">
    <a>${i+1}.</a>
      <a>${channelName}</a>
      <div> ${creators[i].count} likes</div>
    </div>
  `)}
  
  const topLikesDiv = `
    <h1> Likes </h1>
    <div class="top-likes">
      <div class="comment">
        <h3>Video Liked</h3>
        <h1 style="justify">${numberOfLikes}</h1> 
      </div>    
      <div class="comment">
      <h3>Channels most liked</h3>
      ${topCreatorsLikes.join('')}
      </div>
      <div class="comment">
        <h3>First like of <span style="color: red">2022</span></h3>
        <a href="${firstLikeOfYearURL}">
        <div class="thumbnail-container">
          <img src="${firstLikeOfYear.videoThumbnail}">
        </div>
        <br/>
        ${firstLikeOfYear.videoTitle} by ${firstLikeOfYear.channelName}
        </a> 
      </div>
    </div>
  `;
  $(".top-likes").replaceWith(topLikesDiv);
}

async function getPP(channelName, history) {
  channelURL = history.find(video => video.subtitles[0].name === channelName).subtitles[0].url
  if (channelURL){
    channelID = channelURL.split("youtube.com/")[1].split("channel/").reverse()[0]
  }else{
    return "defaultpp.png"; 
  }
  url = "https://yt-wrapped-ttw.vercel.app/channel-picture?channel_id=" + channelID
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


async function shareDiv(history) {
  let firstVideoOfYear = history[history.length - 1]
  let firstVideoName = firstVideoOfYear.title.length < 57 ? firstVideoOfYear.title.split("Watched ")[1] : firstVideoOfYear.title.split("Watched ")[1].slice(0, 50) + "..."
  let videoID = firstVideoOfYear.titleUrl.split("?v=")[1]
  let historylength = history.length
  let channelWatched = findMostFrequentChannel(history).count.length


  let mostViewedChannel = findMostFrequentChannel(history)
  let topCreatorsDivs = [];
  for (let i = 0; i < 10; i++) {
    topCreatorsDivs.push(`
    <div class="commentCreator">
    <img src="${await getPP(mostViewedChannel.count[i][0], history)}">
    <div class="creator-name">#${i + 1} ${mostViewedChannel.count[i][0]}</div>
    </div>
    `)
  }
  
  const topSummaryDiv = `
    <div style="width:800px ; height: 800px">
      <h1><span style="color: red">YT</span>recap.com</h1>
      <div class="top-summary">
        <div>
          <h3>Videos watched in <span style="color: red">2022</span></h3>
          <h1>${historylength}</h1> <br/>
        </div>
        <div>
        <h3>Channels watched</h3>
        <h1>${channelWatched}</h1> <br/>
        </div>

        <div class="comment">
        ${topCreatorsDivs.join('')}
        </div>
      </div>
    </div>
  `;
  console.log(topSummaryDiv)



  $(".shareDiv").replaceWith(topSummaryDiv);
}


// TODO
// in python app if id start with @ use search :
// https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=channel&q=DrippedShorts
// et garder le 1er result
