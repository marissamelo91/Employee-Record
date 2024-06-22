DROP DATABASE if EXISTS employee_db;

CREATE DATABASE employee_db;
\c employee_db;

CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
 id SERIAL PRIMARY KEY,
 title VARCHAR(30) NOT NULL,
 salary DECIMAL(10,2) NOT NULL,
 department_id INTEGER,
 FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
id SERIAL PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INTEGER,
manager_id INTEGER,
FOREIGN KEY (role_id) REFERENCES role(id),
FOREIGN KEY (manager_id) REFERENCES employee(id)
);


