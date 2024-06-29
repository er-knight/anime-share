from sqlalchemy.orm import Session

import models


def get_animes(db: Session, offset: int = 0, limit: int = 50, ids: list[int] = [], keyword: str = ''):
    if ids:
        return db.query(models.Anime).filter(
            models.Anime.id.in_(ids), models.Anime.rank != None, models.Anime.rating != None
        ).order_by(
            models.Anime.rank.asc(), models.Anime.rating.desc()
        ).offset(offset).limit(limit).all()

    if keyword:
        return db.query(models.Anime).filter(
            models.Anime.title.icontains(keyword), models.Anime.rank != None, models.Anime.rating != None
        ).order_by(
            models.Anime.rank.asc(), models.Anime.rating.desc()
        ).all()

    if offset > 100:
        return []

    return db.query(models.Anime).filter(
        models.Anime.rank != None, models.Anime.rating != None
    ).order_by(
        models.Anime.rank.asc(), models.Anime.rating.desc()
    ).offset(offset).limit(limit).all()
