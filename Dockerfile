# Usa una imagen base de Python
FROM python:3.9-slim

# Actualiza el sistema, instala git y las herramientas necesarias para instalar dependencias de Python
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*  # Limpiar la caché de apt

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . /app/

# Actualiza pip y setuptools antes de instalar las dependencias
RUN pip install --upgrade pip setuptools

# Instala las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Expón el puerto donde la aplicación escuchará (asumido Flask en este caso)
EXPOSE 5000

# Define el comando por defecto para ejecutar la aplicación
CMD ["python", "app.py"]
