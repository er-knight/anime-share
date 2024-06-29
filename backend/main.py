import pathlib

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from sqlalchemy.orm import Session

import crud
import models
import schemas

from utils import get_ids, get_url
from database import SessionLocal, engine
from dbutils import create_table, insert_mapping, get_zip_from_hash


models.Base.metadata.create_all(bind=engine)
create_table()

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
def get_animes(hash: str = '', offset: int = 0, limit: int = 100, keyword: str = '', db: Session = Depends(get_db)) -> list[schemas.Anime]:
    if keyword:    
        animes = crud.get_animes(db, keyword=keyword)
        return animes

    zip = get_zip_from_hash(hash)
    ids = get_ids(zip) if zip else []
    animes = crud.get_animes(db, offset=offset, limit=limit, ids=ids)
    return animes

@app.post("/url")
async def get_shareable_url(request: Request):
    payload = await request.body()
    hash = get_url(payload)
    insert_mapping(hash, payload)
    return hash

@app.get("/")
def index():
    with (pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "index.html").open("r") as f:
        html_content = f.read()
    
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/icon.png")
def icon():
    return FileResponse(
        path=str(pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "icon.png")
    )

@app.get("/{hash}")
def index_with_hash(hash: str):
    with (pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "index.html").open("r") as f:
        html_content = f.read()
    
    return HTMLResponse(content=html_content)

@app.get("/assets/{file_name}")
def assets(file_name: str):
    return FileResponse(
        path=str(pathlib.Path(__file__).parent.parent / "frontend" / "dist" / "assets" / file_name)
    )
