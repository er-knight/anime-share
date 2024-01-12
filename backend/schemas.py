from pydantic import BaseModel


class AnimeBase(BaseModel):
    id: int
    title: str
    type: str
    episodes: int
    status: str
    season: str
    image_url: str
    ranking: int
    rating: float

class Anime(AnimeBase):
    id: int
    title: str
    type: str
    episodes: int
    status: str
    season: str
    image_url: str
    ranking: int
    rating: float
    
    class Config:
        from_attributes = True
