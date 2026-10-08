# One small image used by both the MLflow tracking server and the model server.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# MLflow 2.22 does not work with SQLAlchemy 2.1+, so pin it to the 2.0 series.
RUN pip install --no-cache-dir "sqlalchemy>=2.0,<2.1"

# MLflow 2.22's model server needs Starlette < 1.0 (it uses app.route, removed in 1.0).
RUN pip install --no-cache-dir "fastapi>=0.115,<0.116" "starlette>=0.40,<0.47"
