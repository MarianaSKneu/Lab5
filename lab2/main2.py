from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from databasetwo import engine, Base
import models                       # ensure models are imported before create_all
from routers.items import router as items_router

app = FastAPI()

# list the origins you want to allow (your frontend urls)
origins = [
    "http://127.0.0.1:5500",   # сервер LocalHost
    "http://localhost:5500",
    "http://127.0.0.1:5173",   # example: Vite dev server
    "http://localhost:3000",   # example: React dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # <- only these origins allowed
    allow_credentials=True,
    allow_methods=["*"],          # allow GET, POST (create), PUT(update), DELETE
    allow_headers=["*"],          # allow any headers (like Content-Type, Authorization)
)

# Create tables (if they don't exist). Safe to call even if DB already has data.
Base.metadata.create_all(bind=engine)

# include books router
app.include_router(items_router)









@app.get("/_routes")
def list_routes():
    routes = []
    for r in app.router.routes:
        # route.path is maybe r.path for APIRoute or str() for other types
        try:
            path = r.path
            name = r.name
            methods = list(r.methods) if hasattr(r, "methods") else []
        except Exception:
            path = str(r)
            name = ""
            methods = []
        routes.append({"path": path, "name": name, "methods": methods})
    return {"routes": routes}