import pathlib

from fastapi import Depends, FastAPI, Request, Response, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

import crud
import models
import schemas

from utils import get_ids, get_url
from database import SessionLocal, engine


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]

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

@app.get("/")
def index():
    with (pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "index.html").open("r") as f:
        html_content = f.read()
    
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/{_}")
def index(_: str):
    with (pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "index.html").open("r") as f:
        html_content = f.read()
    
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/assets/{file_name}")
def index(file_name: str):
    content_type = ''
    if file_name.endswith('.js'):
        content_type = 'text/javascript; charset=utf-8'
    elif file_name.endswith('.css'):
        content_type = 'text/css; charset=utf-8'
    headers = {'Content-Type': content_type}

    with (pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "assets" / file_name).open("r") as f:
        file_content = f.read()
    
    return Response(content=file_content, status_code=200, headers=headers)
