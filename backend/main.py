from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, groups, expenses, balances, settlements, dashboard

app = FastAPI(title="SplitTab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tightened per-environment in Phase 4
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(settlements.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "SplitTab Backend Running"}