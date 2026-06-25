from fastapi import FastAPI
from routers import users, groups, expenses, balances
from routers import settlements

app = FastAPI()

app.include_router(users.router)
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(settlements.router)

@app.get("/")
def root():
    return {"message": "SplitTab Backend Running"}