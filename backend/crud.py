from sqlalchemy.orm import Session

import models


def get_animes(db: Session, offset: int = 0, limit: int = 50, ids: list[int] = []):
    if ids:
        return db.query(models.Anime).filter(models.Anime.id.in_(ids)).offset(offset).limit(limit).all()

    return db.query(models.Anime).offset(offset).limit(limit).all()
