from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import requests, os

app = Flask(__name__)
CORS(app)
API_KEY= os.environ.get('API_KEY')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route('/channel-picture', methods=['GET'])
def channel_picture():
  # Get the channel ID from the URL query string
  channel_id = request.args.get('channel_id')

  # Use the YouTube API to get the channel's picture profile URL
  url = f'https://www.googleapis.com/youtube/v3/channels?part=snippet&id={channel_id}&key={API_KEY}'
  response = requests.get(url)
  print(response.json())

  data = response.json()

  # Extract the picture profile URL from the API response
  if "items" in data:
    picture_url = data['items'][0]['snippet']['thumbnails']['high']['url']
    return jsonify({ 'picture_url': picture_url })
  else :
    return jsonify({ 'picture_url': "defaultpp.png" })

  # TODO
  # in python app if id start with @ use search :
  # https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=channel&q=DrippedShorts
  # et garder le 1er result

@app.route('/video-thumbnail', methods=['GET'])
def video_thumbnail():
  # Get the video URL from the URL query string
  video_url = request.args.get('video_url')

  # Extract the video ID from the URL
  video_id = video_url.split('v=')[1]
  print(video_id)

  # Use the YouTube API to get the video's thumbnail URL
  url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={API_KEY}'
  response = requests.get(url)
  print(response.json())

  data = response.json()

  # Extract the thumbnail URL from the API response
  thumbnail_url = data['items'][0]['snippet']['thumbnails']['maxres']['url']

  # Return the thumbnail URL as a JSON response
  return jsonify({ 'thumbnail_url': thumbnail_url })

