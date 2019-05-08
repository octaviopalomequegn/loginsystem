const Pool = require('pg').Pool

const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'auth_sess',
    password: 'password',
    port: 5432,
  })

  const getUsers = (request, response) => {
    pool.query('SELECT * FROM usuarios ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM usuarios WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const createUser = (request, response) => {
    const { name, email } = request.body
  
    pool.query('INSERT INTO usuarios (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with ID: ${result.insertId}`)
    })
  }

  module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  }