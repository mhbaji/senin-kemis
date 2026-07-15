import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()
basepath = os.path.abspath(__name__)
SETTING = {
    "UPLOAD_FOLDER" : os.path.join(basepath, "static", "dokumen-pendukung")
}
os.makedirs(SETTING["UPLOAD_FOLDER"], exist_ok=True)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    from app.routes.admin import admin, setting as adset
    from app.routes.poverty import poverty
    from app.routes.public import public, setting as pubset
    from app.routes.strategy import strategy
    
    adset(SETTING)
    pubset(SETTING)
    app.register_blueprint(admin)
    app.register_blueprint(poverty)
    app.register_blueprint(public)
    app.register_blueprint(strategy)

    return app
