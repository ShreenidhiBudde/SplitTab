from fastapi import FastAPI
from routers import users, groups, expenses, balances

app = FastAPI()

app.include_router(users.router)
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)

@app.get("/")
def root():
    return {"message": "SplitTab Backend Running"}