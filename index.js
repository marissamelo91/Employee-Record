const inquirer = require("inquirer");
const { type } = require("os");
const { Pool } = require("pg");
let pool = null

//Array of options
const options = ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "exit"];

//asynchronous function menu that uses the inquirer library to prompt the user to select an option from a list. 
const menu = async () => {
    const res = await inquirer.prompt([
        {
            type: "list",
            name: "option",
            message: "What would you like to do?",
            choices: options
        }
    ]);

    return res.option;
}

//Asynchronous function psqlAccount that uses the inquirer library to prompt the user to enter their PostgreSQL username and password. The function returns an object with the username and password properties
const psqlAccount = async () => {
    const res = await inquirer.prompt([
        {
            type: "input",
            name: "username",
            message: "Enter your PostgreSQL username"
        },
        {
            type: "password",
            name: "password",
            message: "Enter your PostgreSQL password"
        },
    ]);

    //Creates a new instance of a Pool class, passing an object with connection settings to the PostgreSQL database. The user and password properties are set using the values from the res object, which is assumed to be the result of the psqlAccount function.
    pool = new Pool(
        {
            user: `${res.username}`,
            password: `${res.password}`,
            host: "localhost",
            database: "employee_db"

        }
    );
    //Connects to the PostgreSQL database using the pool instance. If the connection is successful, message prompts message below and returns true. If an error occurs, it logs an error message and returns false.
    try {
        await pool.connect();
        console.log("Connected to PostgreSQL database");
        return true;
    } catch (err) {
        console.log("Failed to connect to PostgreSQL database");
        return false;
    }

}
//Initializes the application and returns a promise 
const init = async () => {
    //Calls the psqlAccount function then waits for the promise returned by psqlAccount
    let running = await psqlAccount();
    //while loop
    while (running) {
        // displays a menu to the user and returns the user's selection as a promise
        const option = await menu();
        //If true, the code inside the if statement will be executed.
        if (option === "view all departments") {
            //Retrieve a list of department names from Postgres SQL
            const { rows } = await pool.query("SELECT department.name FROM department");
            console.table(rows);
        }
        else if (option === "view all roles") {
            const { rows } = await pool.query("SELECT role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id");
            console.table(rows);
        }
        else if (option === "view all employees") {
            const { rows } = await pool.query("SELECT e.first_name, e.last_name, r.title, r.salary, d.name AS department, COALESCE(m.first_name || ' ' || m.last_name, 'NULL') AS manager FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id");
            console.table(rows);
        }
        else if (option === "add a department") {
            const res = await inquirer.prompt([
                {
                    type: "input",
                    name: "department",
                    message: "Enter the department name",
                    validate: async (input) => {
                        return input.length <= 30;
                    }
                }]);

            const values = [res.department];
            const newData = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', values);
            console.log(`${newData.rows[0].name} is added`)
        }

        else if (option === "add a role") {
            const { rows } = await pool.query("SELECT * FROM department");
            const res = await inquirer.prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the role title",
                    validate: async (input) => {
                        return input.length <= 30;
                    }
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the role salary",
                    validate: async (input) => {
                        return !isNaN(parseFloat(input));
                    }
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select the department",
                    choices: rows
                }

            ]);
            const departmentId = rows.find(department => department.name === res.department).id;
            const values = [res.title, parseFloat(res.salary), departmentId];
            const newData = await pool.query(`INSERT INTO role (title, salary, department_id) VALUES ($1,$2,$3) RETURNING *`, values);
            // console.log(`${newData[0].title} is added`);
            console.log(`${newData.rows[0].name} added successfully`);

        }
        else if (option === "add an employee") {
            const roleList = await pool.query("SELECT r.id, r.title AS name FROM role r");
            const managerList = [{ id: null, name: "none" }];
            const { rows } = await pool.query("SELECT m.id, CONCAT(m.first_name, ' ', m.last_name ) AS name FROM employee m");
            for (let manager of rows) {
                managerList.push(manager);
            }
            const res = await inquirer.prompt([{
                type: "input",
                name: "firstName",
                message: "what is the first name of the new employee"
            }, {
                type: "input",
                name: "lastName",
                message: "what is the last name of the new employee"
            }, {
                type: "list",
                name: "role",
                message: "choose the role",
                choices: roleList.rows,
            }, {
                type: "list",
                name: "manager",
                message: "choose the manager",
                choices: managerList,
            }
            ]);
            const roleId = roleList.rows.find(role => role.name === res.role).id;
            const managerId = managerList.find(manager => manager.name === res.manager).id;
            const values = [res.firstName, res.lastName, roleId, managerId];
            const newData = await pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1,$2,$3,$4)RETURNING *`, values);
            console.log(`${res.firstName} ${res.lastName} is added`)


        }
        else if (option === "update an employee role") {
            const employeeList = await pool.query("SELECT e.id, CONCAT(e.first_name ,' ', e.last_name) AS name FROM employee e");
            const roleList = await pool.query("SELECT r.id, r.title AS name FROM role r");
            const res = await inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "choose the employee",
                    choices: employeeList.rows,
                },
                {
                    type: "list",
                    name: "role",
                    message: "choose the new role",
                    choices: roleList.rows,
                },
            ]);
            const roleId = roleList.rows.find(role => role.name === res.role).id;
            const employeeId = employeeList.rows.find(employee => employee.name === res.employee).id;
            const values = [roleId, employeeId];
            await pool.query(`UPDATE employee SET role_id = $1 WHERE id = $2`, values);
            console.log(`${res.employee} updated`);
        }
        else { running = false }

        // console.log(option);
        process.exit();
    }
}

init();


