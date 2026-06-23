import psycopg2
from psycopg2 import pool

# ConnectionPool holds multiple ready-made connections to PostgreSQL.
# min=1: at least one connection kept open always.
# max=10: never open more than 10 simultaneous connections.
connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host="localhost",
    port=5432,
    dbname="SplitTab",
    user="postgres",
    password="nidhi@55"
)

def get_connection():
    """Borrow a connection from the pool."""
    return connection_pool.getconn()

def release_connection(conn):
    """Return a connection to the pool after use."""
    connection_pool.putconn(conn)