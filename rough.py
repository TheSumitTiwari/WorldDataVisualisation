from flask import Flask, jsonify
import pymssql

app = Flask(__name__)

# Database connection function
def get_db_connection():
    # Replace with your SQL Server details
    conn = pymssql.connect(
        server='your_server_address',  # e.g., localhost or IP
        port=1433,  # Default SQL Server port
        user='your_username',
        password='your_password',
        database='your_database_name'
    )
    return conn

@app.route('/data', methods=['GET'])
def get_data():
    # Connect to the database and execute query
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM your_table_name"  # Replace with your query
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    # Convert rows to a list of dictionaries
    columns = [column[0] for column in cursor.description]
    data = [dict(zip(columns, row)) for row in rows]

    # Return data as JSON
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
