# Use official Python image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy everything from the backend directory into the container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Expose port 8000
EXPOSE 8000

# Start Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
