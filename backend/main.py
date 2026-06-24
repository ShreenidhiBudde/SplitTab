from fastapi import FastAPI
from routers import users, groups
from routers import expenses

app = FastAPI()

app.include_router(users.router)
app.include_router(groups.router)
app.include_router(expenses.router)

@app.get("/")
def root():
    return {"message": "SplitTab Backend Running"}