const express = require('express');
const {Pool} = require('pg');
const app = express();
const cors = require('cors');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))



const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mydb',
    password: '123456789',
    port: 5432,
});
const port = 3000;




// Create
app.post('/tasks', async (req, res) => {
    const { name, description, finish_time } = req.body;
    // Format the finish_time to 'YYYY-MM-DD' before inserting it into the database
    const formattedFinishTime = new Date(finish_time).toISOString().split('T')[0];
    const query = 'INSERT INTO tasks (name, description, finish_time) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, description, formattedFinishTime];

    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read (Get a single item by ID)
app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            // If no task is found for the given ID, return a 404 status code.
            res.status(404).json({ error: 'Task not found' });
        } else {
            // Return the task with finish_time formatted as 'YYYY-MM-DD'
            const task = result.rows[0];
            task.finish_time = new Date(task.finish_time).toISOString().split('T')[0];
            res.json(task);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read (Get all items)
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        const tasks = result.rows.map((task) => {
            // Format the finish_time for each task as 'YYYY-MM-DD'
            task.finish_time = new Date(task.finish_time).toISOString().split('T')[0];
            return task;
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, finish_time } = req.body;
    // Format the finish_time to 'YYYY-MM-DD' before updating the database
    const formattedFinishTime = new Date(finish_time).toISOString().split('T')[0];
    const query = 'UPDATE tasks SET name = $1, description = $2, finish_time = $3 WHERE id = $4 RETURNING *';
    const values = [name, description, formattedFinishTime, id];

    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Delete
app.delete('/tasks/:id', async (req, res) => {
    const {id} = req.params;
    const query = 'DELETE FROM tasks WHERE id = $1';

    try {
        await pool.query(query, [id]);
        res.json({message: 'Item deleted successfully'});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
