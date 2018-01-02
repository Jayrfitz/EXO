sudo service postgresql start
python -c "import models
models.db.drop_all()"
python inserts.py