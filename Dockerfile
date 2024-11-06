# Usa una imagen base de Python
FROM python:3.9-slim

# Instala git (para clonar repositorios desde GitHub)
RUN apt-get update && apt-get install -y git

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . /app/

# Instala las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Expón el puerto donde la aplicación escuchará (asumido Flask en este caso)
EXPOSE 5000

# Define el comando por defecto para ejecutar la aplicación
CMD ["python", "app.py"]
