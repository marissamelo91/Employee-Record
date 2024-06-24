INSERT INTO department (name)
VALUES ('Engineer'),
       ('Finance'),
       ('Planning Office'),
       ('Fabricator'),
       ('Quality'),
       ('Project Management'),
       ('IT');

INSERT into role (title, salary, department_id)  
VALUES 
('Aersospace Engineer', 100000, 1),
('Accountant 1', 80000, 2),
('Accountant 2', 80000, 2),
('Project Lead', 120000, 3),
('Machinist 1', 60000, 4),
('Machinist 2', 60000, 4),
('Quality Management', 90000, 5),
('Estimator', 70000, 6),
('IT Specialist', 110000, 7),
('IT', 110000, 7);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES
('Don', 'Morr', 1, NULL),
('Jane', 'Doe', 2, 1),
('Jon', 'Sasaki', 3, 1),
('Marisa', 'Melo', 4, 1),
('Nick', 'Crowley', 5, 2),
('Shawn', 'Meszaros', 6, 3),
('Alex', 'Murphy', 7, 4),
('John', 'Doherty', 8, 5),
('Tony', 'Ly', 9, 6),
('Sue', 'Doe', 10, 7);








