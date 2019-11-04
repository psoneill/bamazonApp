//require all of mysql, inquirer, dotenv, and the local keys file
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
require("dotenv").config();
var keys = require("./keys.js");

//sets mySql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    // Links to env password password
    password: keys.mySql.password,
    database: "bamazon"
});

//connects to database on load
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    //initiates first product list load
    supervisorSelect();
});

//bamazonUpdate function selects all products from database bamazon
function supervisorSelect() {
    inquirer.prompt([
        {
            //inquirer type is list
            type: "list",
            //name of variable is userCommand
            name: "userCommand",
            //choices for product list
            choices: ["View Product Sales by Department", "Create New Department", "Quit"],
            //message for user
            message: "Choose function to perform"
        }
    ]).then(function (userSelect) {
        //switch function to route user to correct function
        switch (userSelect.userCommand) {
            case "View Product Sales by Department":
                //displays all products by department
                displayProductsByDepartment();
                break;
            case "Create New Department":
                //allows user to create new department
                addNewDepartment();
                break;
            case "Quit":
                //ends program
                connection.end();
                break;
        }
    })
}

function displayTable(res) {
    //creates new table for displaying to user
    var table = new Table({
        head: ["Department ID", "Department", "Items", "Overhead Costs", "Total Sales", "Profit"]
    })
    //loop through results array provided to function to push each array element to table
    for (let index = 0; index < res.length; index++) {
        //push each element of result row into table
        table.push([res[index].departmentID, res[index].departmentName, res[index].itemCount, "$" + res[index].departmentOverhead.toFixed(2)
            , "$" + res[index].departmentSales.toFixed(2), "$" + res[index].totalProfit.toFixed(2)]);
    }
    //console log table and a divider
    console.log(table.toString());
    console.log("---------------------------------------------------------------------");
    //recursively run supervisorSelect
    supervisorSelect();
}

function displayProductsByDepartment() {
    //runs mysql query to select all products and joins departments table
    connection.query('SELECT IFNULL(dept.departmentID,"missing") AS departmentID, departmentName, COUNT(itemID) AS itemCount, IFNULL(dept.departmentOverhead,0.00) AS departmentOverhead, IFNULL(SUM(itemSales),0.00) AS departmentSales, IFNULL(SUM(itemSales) - dept.departmentOverhead,0.00) AS totalProfit FROM bamazon.products RIGHT JOIN departments dept on dept.departmentName = itemDepartment GROUP BY itemDepartment', function (err, res) {
        if (err) throw err;
        //displays response table
        displayTable(res);
    });
}

//function for adding a new department
function addNewDepartment() {
    //prompts user to enter a department name and overhead costs
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter Name of new department:"
        },
        {
            type: "input",
            name: "overhead",
            message: "Enter Overhead Costs of the new department:"
        }
    ]).then(function (newDepartment) {
        //calls function createDepartment with response data
        createDepartment(newDepartment.name, newDepartment.overhead);
    });
}
//function createDepartment inserts the department into mysql
function createDepartment(newDepartment, newOverhead) {
    //mysql query to insert new department
    connection.query("INSERT INTO departments SET ?",
        {
            departmentName: newDepartment,
            departmentOverhead: newOverhead
        }, function (err, res) {
            if (err) throw err;
            console.log(newDepartment + " has been added to the department list");
            //displays updated products by department
            displayProductsByDepartment();
        }
    );
}