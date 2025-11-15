
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Any
from sqlalchemy.orm import Session


from databasetwo import get_db
import models, schemas

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/", response_model=List[schemas.BookOut])
def read_books(
      genre: Optional[str] = None,
      year: Optional[int] = None,
      rating: Optional[int] = None,
      db: Session = Depends(get_db)
    ):
    """
    Returns the list of books from the DB
    """
    
    query = db.query(models.Book)

    if genre:
        query = query.filter(models.Book.genre == genre)
    if year:
        query = query.filter(models.Book.year == year)
    if rating:
        query = query.filter(models.Book.rating == rating)
    
    books = query.all()

    return books

@router.get("/genres", response_model=List[str])
def get_genres_normalized(db: Session = Depends(get_db)):

    """
    Return unique genres normalized (strip whitespace, de-duplicate case-insensitively).
    """
    rows = db.query(models.Book.genre) \
             .filter(models.Book.genre.isnot(None)) \
             .all()

    # rows is a list of 1-tuples like [(' Fiction',), ('sci-fi',), ...]
    raw_genres = [g[0] for g in rows if g[0] and g[0].strip()]

    # Normalize: strip whitespace and lower-case for uniqueness, then title-case for display
    normalized_map = {}
    for g in raw_genres:
        key = g.strip().lower()
        if key not in normalized_map:
            normalized_map[key] = g.strip().title()  # or use original casing if you prefer

    # Return sorted display values
    genres = sorted(normalized_map.values())
    return genres



#, response_model=schemas.BookOut, status_code=status.HTTP_201_CREATED
@router.post('/', response_model=schemas.BookOut)
def create_new_book(
        book: schemas.BookCreate,
        db: Session = Depends(get_db)
    ):

    """
    Function to add a new book to DB.
    Body of a requset is a JSON.stringify(book) that should match the schemas.BookCreate.
    Return a new book with id
    """

    # validation
    if book.year is not None and (book.year < 0 or book.year > 2050):
        raise HTTPException(status_code=400, detail="year must be between 0 and 2050")
    if book.rating is not None and (book.rating < 1 or book.rating > 5):
        raise HTTPException(status_code=400, detail="rating must be between 1 and 5")

    # Create model instance from pydantic object
    db_book = models.Book(**book.model_dump())

    # Add to DB
    db.add(db_book)
    db.commit()

    db.refresh(db_book)
    # refresh to get an id that was set by autoincrement

    print(db_book)

    return db_book



@router.put('/{id}', response_model=schemas.BookOut)
def update_book_data(
        id : int,
        book_sent: schemas.BookCreate,
        db: Session = Depends(get_db)
    ):
    """
    Function to change data about the book by the id 
    """

    book = db.get(models.Book, id)
    
    if not book:
        raise HTTPException(status_code=404, detail=f"Book with id={id} not found")

    # update book values
    incoming = book_sent.model_dump(exclude_unset=True)
    for field, value in incoming.items():
        setattr(book, field, value)

    db.add(book)
    db.commit()
    db.refresh(book)

    return book



# for deletion - the frontend sends just the id of a book
@router.delete('/{id}')
def delete_book_data(
        id : int,
        db: Session = Depends(get_db)
    ) -> Any:
    """
    Function to delete the book by its id, that is send from the frontend
    """

    book = db.get(models.Book, id)  # SQLAlchemy Session.get

    if not book:
        raise HTTPException(status_code=404, detail=f"Book with id={id} not found")

    db.delete(book)
    db.commit()

    return {"detail": "Book deleted"}
