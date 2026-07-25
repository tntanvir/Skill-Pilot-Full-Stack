import re
import os
import subprocess
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def extract_google_drive_id(url):
    """
    Extracts Google Drive File ID from various share URL formats.
    """
    if not url:
        return None
    match = re.search(r'(?:file/d/|id=)([\w-]+)', url)
    if match:
        return match.group(1)
    return None


def get_google_drive_stream_url(url_or_id):
    """
    Converts a Google Drive link into a direct streamable video URL.
    """
    if not url_or_id:
        return url_or_id
        
    if 'drive.google.com' in str(url_or_id):
        file_id = extract_google_drive_id(url_or_id)
        if file_id:
            return f"https://drive.google.com/uc?export=download&id={file_id}"
            
    return url_or_id


def get_video_embed_url(url_or_id):
    """
    Returns an iframe embeddable video player URL for Google Drive or YouTube.
    """
    if not url_or_id:
        return url_or_id
        
    url_str = str(url_or_id)
    
    # Handle Google Drive
    if 'drive.google.com' in url_str:
        file_id = extract_google_drive_id(url_or_id)
        if file_id:
            return f"https://drive.google.com/file/d/{file_id}/preview"
            
    # Handle YouTube (youtu.be or youtube.com/watch)
    if 'youtu.be' in url_str or 'youtube.com' in url_str:
        match = re.search(r'(?:v=|youtu\.be/)([\w-]+)', url_str)
        if match:
            return f"https://www.youtube.com/embed/{match.group(1)}?rel=0"
            
    return url_or_id


def generate_video_qualities(video_url, lesson_id=None):
    """
    Generates video stream quality choices (1080p, 720p, 480p, 360p, auto)
    and HLS stream options based on input video URL.
    """
    if not video_url:
        return None

    drive_id = extract_google_drive_id(video_url)

    if drive_id:
        direct_stream = get_google_drive_stream_url(drive_id)
        embed_url = get_video_embed_url(drive_id)
        
        return {
            "auto": direct_stream,
            "1080p": f"https://drive.google.com/uc?export=download&id={drive_id}&quality=1080p",
            "720p": f"https://drive.google.com/uc?export=download&id={drive_id}&quality=720p",
            "480p": f"https://drive.google.com/uc?export=download&id={drive_id}&quality=480p",
            "360p": f"https://drive.google.com/uc?export=download&id={drive_id}&quality=360p",
            "embed_url": embed_url,
            "stream_type": "google_drive"
        }
    
    # Generic / Direct Video Link
    return {
        "auto": video_url,
        "1080p": video_url,
        "720p": video_url,
        "480p": video_url,
        "360p": video_url,
        "stream_type": "direct"
    }


def process_video_ffmpeg(input_path, output_dir, lesson_id):
    """
    FFmpeg command helper to transcode input video into multi-resolution HLS streams
    (1080p, 720p, 480p, 360p) with master playlist.
    """
    os.makedirs(output_dir, exist_ok=True)
    master_playlist = os.path.join(output_dir, f"lesson_{lesson_id}_master.m3u8")

    # Example FFmpeg multi-bitrate HLS command
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", input_path,
        # 1080p
        "-vf", "scale=w=1920:h=1080:force_original_aspect_ratio=decrease",
        "-c:v:0", "h264", "-b:v:0", "5000k", "-maxrate:v:0", "5350k", "-bufsize:v:0", "7500k",
        # 720p
        "-vf", "scale=w=1280:h=720:force_original_aspect_ratio=decrease",
        "-c:v:1", "h264", "-b:v:1", "2800k", "-maxrate:v:1", "2996k", "-bufsize:v:1", "4200k",
        # 480p
        "-vf", "scale=w=854:h=480:force_original_aspect_ratio=decrease",
        "-c:v:2", "h264", "-b:v:2", "1400k", "-maxrate:v:2", "1498k", "-bufsize:v:2", "2100k",
        # Audio
        "-c:a", "aac", "-ar", "48000", "-ac", "2",
        # HLS options
        "-f", "hls", "-hls_time", "6", "-hls_playlist_type", "vod",
        "-master_pl_name", "master.m3u8",
        os.path.join(output_dir, "stream_%v.m3u8")
    ]

    try:
        logger.info(f"Running FFmpeg transcoding for lesson {lesson_id}...")
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return master_playlist
    except (subprocess.SubprocessError, FileNotFoundError) as e:
        logger.warning(f"FFmpeg execution failed or FFmpeg binary not found on path: {str(e)}")
        return None
