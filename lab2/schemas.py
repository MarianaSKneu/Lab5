
from pydantic import BaseModel, ConfigDict
from typing import Optional

class BookBase(BaseModel):
    title: str
    author: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None
    rating: Optional[int] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BookBase):
    pass

class BookOut(BookBase):
    id: int 

    model_config = ConfigDict(from_attributes=True)
    
    #class Config:
        #orm_mode = True
