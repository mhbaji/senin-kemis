from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    from app.routes.admin import admin
    from app.routes.poverty import poverty
    from app.routes.public import public
    from app.routes.strategy import strategy
    
    app.register_blueprint(admin)
    app.register_blueprint(poverty)
    app.register_blueprint(public)
    app.register_blueprint(strategy)

    return app
