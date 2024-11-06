# Usa una imagen base de Python
FROM python:3.9-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . /app/

# Instala las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Expón el puerto donde la aplicación escuchará (por ejemplo, puerto 5000 para Flask)
EXPOSE 5000

# Define el comando por defecto para ejecutar la aplicación
CMD ["python", "app.py"]
