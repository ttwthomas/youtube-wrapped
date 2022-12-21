function filterCurrentYear(video) {
  return Date.parse(video.time) > Date.parse('2022');
}
function filterCurrentYearLikes(like) {
  return like[1] > Date.parse('2022');
}
function filternotAfter(video) {
  return Date.parse(video.time) < Date.parse('2021');
}
function filterRemovedVideos(video) {
  return video.subtitles !== undefined;
}
function filterRemoveNonVideoFromComments(comment) {
  const regex = /(un comentario a un vídeo el)|(a comment on a video)|(un commentaire sur une vidéo)/g;
  return comment.match(regex);;
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
  let loop;
  mostViewedChannel.count.length <= 20 ? loop = mostViewedChannel.count : loop = 20
  for (let i = 0; i < loop; i++) {
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
  $(".top-creators").show();
  $(".float").show();

}

async function topVideos(history) {
  let mostViewedVideo = findMostViewedVideo(history)
  let topVideosDivs = [];
  for (let i = 0; i < 10; i++) {
    let videoURL = mostViewedVideo.count[i][0]
    let videoID = videoURL.split("?v=")[1]
    let videoName = history.find(x => x.titleUrl == mostViewedVideo.count[i][0]).title.split("Watched ")[1]
    if (videoName === undefined){
      videoName = history.find(x => x.titleUrl == mostViewedVideo.count[i][0]).title.split("Vous avez regardé ")[1]
    } 
    if (videoName === undefined){
      videoName = history.find(x => x.titleUrl == mostViewedVideo.count[i][0]).title.split("Has visto ")[1]
    }
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
  $(".top-video").show();
}

async function topSummary(history) {
  let firstVideoOfYear = history[history.length - 1]
  let firstVideoName = firstVideoOfYear.title.length < 57 ? firstVideoOfYear.title.split("Watched ")[1] : firstVideoOfYear.title.split("Watched ")[1].slice(0, 50) + "..."
  if (firstVideoName === undefined){
    firstVideoName = firstVideoOfYear.title.length < 57 ? firstVideoOfYear.title.split("Vous avez regardé ")[1] : firstVideoOfYear.title.split("Vous avez regardé ")[1].slice(0, 50) + "..."
  } 
  if (firstVideoName === undefined){
    firstVideoName = firstVideoOfYear.title.length < 57 ? firstVideoOfYear.title.split("Has visto ")[1] : firstVideoOfYear.title.split("Has visto ")[1].slice(0, 50) + "..."
  }
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
  $(".top-summary").show();
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
  let loop;
  creators.length <= 5 ? loop = creators.length : loop = 5
  for (let i = 0; i < loop; i++) {
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
  $(".top-comments").show();
}


function getCommentsList(comments){
  let commentsList= [];
  for (let i = 0; i < comments.length; i++) {
    let commentText = comments[i].innerText.split(" UTC.")[1]
    let commentTime = comments[i].innerText.split(" UTC.")[0].split("video at ")[1]
    if (commentTime === undefined){
      commentTime = comments[i].innerText.split(" UTC.")[0].split("un vídeo el ")[1]
    }
    if (commentTime === undefined){
      commentTime = comments[i].innerText.split(" UTC.")[0].split("vidéo le")[1]
    }
    commentTime = new Date(commentTime)
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
      if (!comments[i].innerHTML.includes("\">publicación</a>")){
        if (!comments[i].innerHTML.includes("\">publication</a>")){
          commentsList.push(commentObj)
        }
      }
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

  // Next, create a map from creators to the number of likes they have
  const creatorToLikesCountMap = new Map();
  for (const like of likes) {
    let likeUrl = like[0]
    const creator = urlToCreatorMap.get(likeUrl);
    if (creator) {
      if (!creatorToLikesCountMap.has(creator)) {
        creatorToLikesCountMap.set(creator, 0);
      }
      creatorToLikesCountMap.set(creator, creatorToLikesCountMap.get(creator) + 1);
    }
  }

  // Finally, sort the creators by the number of likes they have and return the list
  const creators = [...creatorToLikesCountMap.keys()];
  creators.sort((a, b) => creatorToLikesCountMap.get(b) - creatorToLikesCountMap.get(a));
  return creators.map(creator => ({ creator, count: creatorToLikesCountMap.get(creator) }));
}


async function topLikes(likesList, history){
  likesList = likesList.filter(filterCurrentYearLikes)
  let numberOfLikes = likesList.length
  console.log(likesList)
  let firstLikeOfYearURL = likesList[numberOfLikes - 1][0]
  let firstLikeOfYearVideo = history.find(video => video.titleUrl === firstLikeOfYearURL);
  let firstLikeOfYearvideoID = firstLikeOfYearURL.split("?v=")[1]
  let videoTitle = firstLikeOfYearVideo.title.split("Watched ")[1]
  if (videoTitle === undefined){
    videoTitle = firstLikeOfYearVideo.title.split("Vous avez regardé ")[1]
  }
  if (videoTitle === undefined){
    videoTitle = firstLikeOfYearVideo.title.split("Has visto ")[1]
  }
  let firstLikeOfYear = {
    URL : firstLikeOfYearURL,
    channelName: firstLikeOfYearVideo.subtitles[0].name,
    videoTitle: firstLikeOfYearVideo.title.split("Watched ")[1],
    videoThumbnail: `https://i.ytimg.com/vi/${firstLikeOfYearvideoID}/hqdefault.jpg`
  }
  let creators = getMostLikedChannel(likesList, history)

  let topCreatorsLikes = [];
  let loop;
  creators.length <= 5 ? loop = creators.length : loop = 5
  for (let i = 0; i < loop; i++) {
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
  $(".top-likes").show();

}

async function getPP(channelName, history) {
  // let depaultPPURL = "defaultpp.png"
  let defaultPPURL = "https://ytrecap.com/defaultpp.png"
  channelURL = history.find(video => video.subtitles[0].name === channelName).subtitles[0].url
  if (channelURL){
    channelID = channelURL.split("youtube.com/")[1].split("channel/").reverse()[0]
  }else{
    return defaultPPURL; 
  }
  url = "https://api.ytrecap.com/channel-picture?channel_id=" + channelID
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
      return defaultPPURL;
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
    <div class="shareCreator">
    <img src="${await getPP(mostViewedChannel.count[i][0], history)}">
    <a style="vertical-align: super">#${i + 1} ${mostViewedChannel.count[i][0]}</a>
    </div>
    `)
  }
  
  const topSummaryDiv = `
    <div class="shareImage" style="width:900px ; ">
      <h1 style="margin-bottom: 30px; margin-top: 0px"><span style="color: red">YT</span>recap.com</h1>
      <div class="top-summary" style="margin: 10px">
        <div>
          <h3 style="margin: 10px">Videos watched in <span style="color: red">2022</span></h3>
          <h1 style="margin: 20px">${historylength}</h1>
        </div>
        <div>
        <h3 style="margin: 10px">Channels watched</h3>
        <h1 style="margin: 20px">${channelWatched}</h1>
        </div>
        ${topCreatorsDivs.join('')}
      </div>
    </div>
  `;

  $(".shareDiv").replaceWith(topSummaryDiv);

}


// TODO
// in python app if id start with @ use search :
// https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=channel&q=DrippedShorts
// et garder le 1er result
