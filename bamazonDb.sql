DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  itemID INT NOT NULL AUTO_INCREMENT,
  itemName VARCHAR(100) NULL,
  itemDepartment VARCHAR(50) NULL,
  itemPrice DECIMAL(10,2) NULL,
  itemStockQuantity INT NULL,
  itemSales DECIMAL(10,2) NULL DEFAULT 0.00,
  PRIMARY KEY (itemID)
);

INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Jenga", "Toys", 7.00, 50);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Connect 4", "Toys", 9.00, 50);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Uno", "Toys", 5.00, 80);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Echo Dot", "Electronics", 30.00, 25);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Fire TV", "Electronics", 40.00, 20);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Roku", "Electronics", 28.00, 30);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Wooden Hangers", "Home", 14.00, 80);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Bed Sheets", "Home", 25.00, 50);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Shower Curtain", "Home", 9.00, 100);
INSERT INTO products (itemName, itemDepartment, itemPrice, itemStockQuantity) VALUES ("Kitty Litter", "Pets", 18.00, 60);

CREATE TABLE departments (
  departmentID INT NOT NULL AUTO_INCREMENT,
  departmentName VARCHAR(100) Not NULL,
  departmentOverhead DECIMAL(10,2) NULL DEFAULT 0.00,
  PRIMARY KEY (departmentID)
);

INSERT INTO departments (departmentName, departmentOverhead) VALUES ("Toys", 500.00);
INSERT INTO departments (departmentName, departmentOverhead) VALUES ("Electronics", 750.00);
INSERT INTO departments (departmentName, departmentOverhead) VALUES ("Home", 300.00);
INSERT INTO departments (departmentName, departmentOverhead) VALUES ("Pets", 250.00);