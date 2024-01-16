from pydantic import BaseModel


class AnimeBase(BaseModel):
    id: int
    title: str
    type: str
    episodes: int
    status: str
    airing_period: str
    image_url: str
    rank: int
    rating: float

class Anime(AnimeBase):
    id: int
    title: str
    type: str
    episodes: int
    status: str
    airing_period: str
    image_url: str
    rank: int
    rating: float
    
    class Config:
        from_attributes = True
