from setuptools import setup, find_packages

setup(
    name="arealis-acc-service",
    version="1.0.0",
    description="ACC Agent Service for Arealis Gateway",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "pydantic==2.2.0",
        "requests==2.31.0",
        "psycopg2-binary==2.9.9",
        "neo4j==5.15.0",
        "python-dotenv==1.0.0",
        "sqlalchemy==2.0.23",
        "gunicorn==21.2.0"
    ],
)
