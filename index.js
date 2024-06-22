const inquirer = require("inquirer");
const { Pool } = require("pg");
const pool = new Pool({ user: "postgres", password: "Blue88", host: "localhost", database: "employee_db" });

const options = ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "exit"
];

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

const init = async () => {
    let running = true;
    while (running) {
        const option = await menu();
        if (option === "view all departments") {
            const { rows } = await pool.query("SELECT department.name FROM department");
            console.table(rows);
        }
        else if (option === "view all roles") {
            const { rows } = await pool.query("SELECT role.title, role.salary, department.id AS name FROM role JOIN department ON role.department_id = department.id");
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
            console.log(`${newData} is added`)


        }

        else if (option === "add a role") { }
        else if (option === "add an employee") { }
        else if (option === "update an employee role") { }
        else { running = false }

        console.log(option);

    }
}

init();