
from sqlalchemy import Column, Integer, String
from databasetwo import Base

class Book(Base):
    __tablename__ = "books"   # must match your actual table name in SQLite
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    genre = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)

