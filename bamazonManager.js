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
    managerSelect();
});

//bamazonUpdate function selects all products from database bamazon
function managerSelect() {
    inquirer.prompt([
        {
            //inquirer type is list
            type: "list",
            //name of variable is userCommand
            name: "userCommand",
            //choices for product list
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            //message for user
            message: "Choose item to buy"
        }
    ]).then(function (userSelect) {
        switch (userSelect.userCommand) {
            case "View Products for Sale":
                displayAllProducts();
                break;
            case "View Low Inventory":
                displayLowInventory();
                break;
            case "Add to Inventory":
                addInventoryChoice();
                break;
            case "Add New Product":

                break;
            case "Quit":
                connection.end();
                break;
        }
    })
}

function displayTable(res) {
    var table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity"]
    })
    for (let index = 0; index < res.length; index++) {
        table.push([res[index].itemID, res[index].itemName, res[index].itemDepartment, "$" + res[index].itemPrice.toFixed(2), res[index].itemStockQuantity]);
    }
    console.log(table.toString());
    managerSelect();
}

function displayAllProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        displayTable(res);
    });
}

function displayLowInventory() {
    connection.query("SELECT * FROM products WHERE itemStockQuantity < 5", function (err, res) {
        if (err) throw err;
        displayTable(res);
    });
}

//addInventory function allows user to select the item they want to buy
function addInventoryChoice() {
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer.prompt([
            {
                //inquirer type is list
                type: "list",
                //name of variable is userCommand
                name: "userCommand",
                //choices for product list
                choices: res.map(e => e.itemID + " - " + e.itemName + " (" + e.itemDepartment + ") - Price: " + e.itemPrice + " - Quantity: " + e.itemStockQuantity),
                //message for user
                message: "Choose item to add inventory too"
            }
        ]).then(function (userSelect) {
            //saves variable for the selected item
            var selectedItem = userSelect.userCommand;
            //pulls out itemID from selected item
            var itemID = selectedItem.substr(0, selectedItem.indexOf('-') - 1);
            //pulls out stockQuantity from selecteditem
            var stockQuantity = selectedItem.substr(selectedItem.indexOf("Quantity: ") + 10, selectedItem.length);
            //calls chooseQuantity function where user selects the quantity to buy
            chooseInventoryQuantity(itemID, selectedItem, stockQuantity);
        })
    });
}

//function chooseQuantity allows user to select quantity to buy
function chooseInventoryQuantity(itemID, selectedItem, stockQuantity) {
    inquirer.prompt([
        {
            //inquirer prompt type input
            type: "input",
            name: "userQuantity",
            message: "What quantity of inventory would you like to add?"
        }
    ]).then(function (userSelect) {
        //saves userQuantity entered into variable userQuantity
        var userQuantity = userSelect.userQuantity;
        //checks to make sure that user entry is a number
        if (isNaN(parseFloat(userQuantity))) {
            //console logs user error
            console.log("Entry is not a number - Try Again");
            chooseInventoryQuantity(itemID, selectedItem, stockQuantity);
        } else {
            //calculates new stock quantity
            var newStockQuantity = parseInt(stockQuantity) + parseInt(userQuantity);
            //calls function to update database with new stock quantity
            updateDatabaseQuantity(itemID, selectedItem, newStockQuantity);
        }
    })
}

//updateDatabaseQuantity function to update mysql database for selected item
function updateDatabaseQuantity(itemID, selectedItem, newStockQuantity) {
    //calls sql query to update table products with new stock quantity
    connection.query("UPDATE products SET ? WHERE ?", [{ itemStockQuantity: newStockQuantity }, { itemID: itemID }], function (err, res) {
        if (err) throw err;

        connection.query("SELECT * FROM products WHERE ?", [{itemID:itemID}],function (err, res) {
            if (err) throw err;
            displayTable(res);
        });
    });
}