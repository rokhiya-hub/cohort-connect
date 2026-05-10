import os
import sys
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(__file__))

from generators.video_generator import generate_video
from generators.poster_generator import generate_poster
from generators.caption_generator import generate_caption
from generators.thumbnail_generator import generate_thumbnail

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'cohort-connect-manim'})


@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'JSON body required'}), 400

    prompt = data.get('prompt', '').strip()
    gen_type = data.get('type', '').strip().lower()

    if not prompt:
        return jsonify({'success': False, 'message': 'prompt is required'}), 400
    if gen_type not in ('video', 'poster', 'caption', 'thumbnail'):
        return jsonify({'success': False, 'message': 'type must be video, poster, caption, or thumbnail'}), 400

    try:
        if gen_type == 'video':
            filepath = generate_video(prompt, OUTPUT_DIR)
            filename = os.path.basename(filepath)
            rel_path = os.path.relpath(filepath, OUTPUT_DIR).replace(os.sep, '/')
            url = f'/outputs/{rel_path}'
            return jsonify({'success': True, 'type': 'video', 'url': url, 'filename': filename})

        elif gen_type == 'poster':
            filepath = generate_poster(prompt, OUTPUT_DIR)
            filename = os.path.basename(filepath)
            rel_path = os.path.relpath(filepath, OUTPUT_DIR).replace(os.sep, '/')
            url = f'/outputs/{rel_path}'
            return jsonify({'success': True, 'type': 'poster', 'url': url, 'filename': filename})

        elif gen_type == 'caption':
            result = generate_caption(prompt)
            return jsonify({
                'success': True,
                'type': 'caption',
                'content': result['caption'],
                'hashtags': result['hashtags'],
                'category': result['category'],
            })

        elif gen_type == 'thumbnail':
            filepath = generate_thumbnail(prompt, OUTPUT_DIR)
            filename = os.path.basename(filepath)
            rel_path = os.path.relpath(filepath, OUTPUT_DIR).replace(os.sep, '/')
            url = f'/outputs/{rel_path}'
            return jsonify({'success': True, 'type': 'thumbnail', 'url': url, 'filename': filename})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/outputs/<path:filepath>', methods=['GET'])
def serve_output(filepath):
    full_path = os.path.join(OUTPUT_DIR, filepath)
    if not os.path.exists(full_path):
        return jsonify({'message': 'File not found'}), 404
    return send_file(full_path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
