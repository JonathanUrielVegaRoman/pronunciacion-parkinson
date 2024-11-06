from flask import Flask, request, jsonify, render_template
import librosa
import numpy as np
import os
import requests
import json

import matplotlib.pyplot as plt
import pyAudioAnalysis as paa

app = Flask(__name__, static_folder='static', template_folder='.')

# Carpeta donde se almacenarán los audios subidos
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def analyze_audio(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None)
        pitches, _ = librosa.piptrack(y=y, sr=sr)

        pitches = pitches[pitches > 0]

        if pitches.size == 0:
            raise ValueError("No se pudieron encontrar frecuencias en el audio.")

        meanF0 = np.mean(pitches)
        jitter = np.std(pitches) / meanF0 if meanF0 else 0
        rms = librosa.feature.rms(y=y)[0]
        shimmer = np.std(rms) / np.mean(rms) if np.mean(rms) else 0
        return meanF0, jitter, shimmer
    except Exception as e:
        print(f"Error en el análisis del audio: {e}")
        return None, None, None 

def send_to_wit_ai(file_path):
    wit_ai_token = "S6CFAUPYXSQBIICQXNTF4PXCNFYRUB52"  # Reemplaza con tu token de servidor de Wit.ai
    headers = {
        'Authorization': f'Bearer {wit_ai_token}',
        'Content-Type': 'audio/wav'
    }

    try:
        with open(file_path, 'rb') as audio_file:
            response = requests.post('https://api.wit.ai/speech', headers=headers, data=audio_file)
            
            if response.status_code != 200:
                print(f"Error: {response.status_code} - {response.text}")
                return None

            response_text = response.text.strip()
            json_blocks = response_text.split("\n")

            final_response = None
            for block in json_blocks:
                try:
                    parsed_block = json.loads(block)
                    if parsed_block.get("is_final", False):
                        final_response = parsed_block
                except json.JSONDecodeError:
                    print("Valores obtenidos:", block)
                    continue

            return final_response
    except Exception as e:
        print(f"Error procesando el archivo de audio: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'audio' not in request.files:
        return jsonify({'error': 'No se proporcionó un archivo de audio.'}), 400

    audio = request.files['audio']

    if audio.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo.'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, audio.filename)
    audio.save(file_path)

    # Analizar audio para obtener métricas de tono y variación
    meanF0, jitter, shimmer = analyze_audio(file_path)
    
    if meanF0 is None:
        os.remove(file_path)
        return jsonify({'error': 'Error al procesar el audio.'}), 500

    # Enviar el archivo de audio a Wit.ai para la detección de entidades
    wit_response = send_to_wit_ai(file_path)
    os.remove(file_path)  # Eliminar el archivo después de procesarlo

    # Verificar si Wit.ai ha detectado alguna de las vocales "a", "e", "i", "o", "u"
    vowels = ["a", "e", "i", "o", "u"]
    is_valid = False
    if wit_response and "entities" in wit_response and "vocal" in wit_response["entities"]:
        for entity in wit_response["entities"]["vocal"]:
            if entity.get("value") in vowels:
                is_valid = True
                break

    # Devolver el resultado en formato JSON
    if is_valid:
        return jsonify({
            'status': 'Validación Exitosa',
            'filename': audio.filename,
            'meanF0Hz': float(meanF0),
            'jitter': float(jitter),
            'shimmer': float(shimmer)
        })
    else:
        return jsonify({
            'status': 'Hubo un error',
            'error': 'Ninguna de las vocales "a", "e", "i", "o", "u" fue detectada en el audio.',
            'meanF0Hz': float(meanF0),
            'jitter': float(jitter),
            'shimmer': float(shimmer)
        })

if __name__ == '__main__':
    app.run(debug=True)
