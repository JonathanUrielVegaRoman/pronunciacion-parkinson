// Elementos del DOM
const audioInput = document.getElementById('audioFile');
const uploadBox = document.getElementById('uploadBox');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsTable = document.getElementById('resultsTable');
const resultsBody = resultsTable.querySelector('tbody');
const executionTimeDiv = document.getElementById('executionTime');
const timeValue = document.getElementById('timeValue');
const resultMessage = document.getElementById('resultMessage'); // Nuevo elemento para mostrar mensajes de resultado

let selectedFile = null;

// Función para manejar arrastrar y soltar archivos
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('hover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('hover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('hover');
    if (e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
        handleFileSelect(selectedFile);
    }
});

// Función para manejar la selección de archivos mediante clic
audioInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
});

// Función para validar y mostrar el nombre del archivo
function handleFileSelect(file) {
    if (file && file.type.startsWith('audio/')) {
        console.log(`Archivo seleccionado: ${file.name}`);
        uploadBox.querySelector('p').textContent = `Archivo seleccionado: ${file.name}`;
        resultMessage.textContent = ''; // Limpiar mensaje anterior
    } else {
        alert('Por favor, selecciona un archivo de audio válido.');
        selectedFile = null;
        resultMessage.textContent = ''; // Limpiar mensaje anterior
    }
}

// Función para manejar el análisis
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Primero selecciona un archivo de audio.');
        return;
    }

    // Crear un objeto FormData para enviar el archivo al backend
    const formData = new FormData();
    formData.append('audio', selectedFile);
    console.log("Archivo enviado al servidor:", selectedFile);
    
    // Medir el tiempo de ejecución
    const startTime = performance.now();

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData,
        });
        console.log("Respuesta del servidor:", response);

        if (!response.ok) throw new Error('Error al analizar el archivo.');

        const data = await response.json();
        console.log("Datos recibidos del servidor:", data);
        
        // Calcular el tiempo de ejecución
        const endTime = performance.now();
        const executionTime = (endTime - startTime) / 1000; // Convertir a segundos

        // Mostrar resultados
        displayResults(data, executionTime);
    } catch (error) {
        console.error('Error:', error);
        resultMessage.textContent = 'Hubo un problema al analizar el audio.'; // Mensaje de error
    }
});

// Función para mostrar los resultados en la tabla
function displayResults(data, executionTime) {
    console.log("Mostrando resultados:", data);
    resultsBody.innerHTML = ''; // Limpiar resultados previos

    // Crear una nueva fila con los datos de análisis
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${data.fileName}</td>
        <td>${data.jitter.toFixed(4)}</td>
        <td>${data.shimmer.toFixed(4)}</td>
        <td>${data.meanF0Hz.toFixed(2)} Hz</td>
    `;

    resultsBody.appendChild(row);
    resultsTable.style.display = 'table';

    // Mostrar el tiempo de ejecución
    timeValue.textContent = `${executionTime.toFixed(5)} segundos`;
    executionTimeDiv.style.display = 'block';

    // Mostrar mensaje de éxito
    resultMessage.textContent = 'Análisis completado exitosamente.'; // Mensaje de éxito
}
