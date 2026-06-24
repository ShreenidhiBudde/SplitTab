from fastapi import FastAPI
from routers import users, groups

app = FastAPI()

app.include_router(users.router)
app.include_router(groups.router)

@app.get("/")
def root():
    return {"message": "SplitTab Backend Running"}