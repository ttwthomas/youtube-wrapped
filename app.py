from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import requests, os
import base64
import boto3
import uuid

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
    return jsonify({ 'picture_url': "https://rsddrsoebandi.jemberkab.go.id/assets/img/foto-default-pp.png" })

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


@app.route('/share', methods=['POST'])
def upload_image_to_s3():
    # Get the base64 image from the request
    print(request)
    image_base64 = request.json['image']
    image_base64 = image_base64[23:]

    # Decode the base64 image and save it to a file
    image_binary = base64.decodebytes(image_base64.encode('utf-8'))
    # Generate a unique identifier for the image
    image_uuid = str(uuid.uuid4())

    with open(f'{image_uuid}.jpg', 'wb') as f:
        f.write(image_binary)

    # Upload the image to S3 with public rights
    session = boto3.Session(profile_name='ttwthomas')
    s3 = session.client('s3')
    s3.upload_file(f'{image_uuid}.jpg', 'youtuberecap', f'share/{image_uuid}.jpg', ExtraArgs={'ACL': 'public-read', 'ContentType': "image/jpeg",})
    url = f'https://youtuberecap.s3.eu-west-3.amazonaws.com/share/{image_uuid}.jpg' 
     # Return the S3 URL of the image
    return jsonify({ 'sharePictureUrl': url })

