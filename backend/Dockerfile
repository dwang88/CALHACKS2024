FROM python:3.9
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY main.py server.py start.sh .env ./

EXPOSE 5000 8000
RUN chmod +x start.sh
CMD ["bash", "start.sh"]