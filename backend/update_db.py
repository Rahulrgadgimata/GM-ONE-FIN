from app import app, db
from database import Entity

with app.app_context():
    entity = Entity.query.get(1)
    if entity:
        entity.secretary_id = 6  # rahulrgadgimata
        db.session.commit()
        print("Updated entity secretary to rahulrgadgimata")
    else:
        print("Entity not found")