from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import models
import schemas

from utils import get_ids, get_url
from database import SessionLocal, engine


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

localdb = {}

@app.get("/anime", response_model=list[schemas.Anime])
def get_animes(hash: str = '', offset: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> list[schemas.Anime]:
    ids = get_ids(localdb[hash]) if hash else []
    animes = crud.get_animes(db, offset=offset, limit=limit, ids=ids)
    return animes

@app.post("/url")
async def get_shareable_url(request: Request):
    payload = await request.body()
    hash = get_url(payload)
    # TODO: insert hash, gzip to db
    localdb[hash] = payload
    print(hash)
    return hash
