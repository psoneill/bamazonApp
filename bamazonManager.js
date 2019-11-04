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
            message: "Choose function to perform"
        }
    ]).then(function (userSelect) {
        //switch function to route the right function
        switch (userSelect.userCommand) {
            case "View Products for Sale":
                //displays all products currently in the product table
                displayAllProducts();
                break;
            case "View Low Inventory":
                //displays all items with low inventory
                displayLowInventory();
                break;
            case "Add to Inventory":
                //adds inventory to items
                addInventoryChoice();
                break;
            case "Add New Product":
                //allows user to add new items
                addNewItem();
                break;
            case "Quit":
                //quit out of program
                connection.end();
                break;
        }
    })
}

function displayTable(res) {
    //create new table for display in CLI
    var table = new Table({
        head: ["Item ID", "Name", "Department", "Price", "Quantity"]
    })
    //loop through results of each query and display table
    for (let index = 0; index < res.length; index++) {
        table.push([res[index].itemID, res[index].itemName, res[index].itemDepartment, "$" + res[index].itemPrice.toFixed(2), res[index].itemStockQuantity]);
    }
    //console log table with divider
    console.log(table.toString());
    console.log("---------------------------------------------------------------------");
    //recursively call initial select menu
    managerSelect();
}

function displayAllProducts() {
    //mysql query to select all products
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //display table results
        displayTable(res);
    });
}

function displayLowInventory() {
    //mysql query to select all products with low inventory <5 units
    connection.query("SELECT * FROM products WHERE itemStockQuantity < 5", function (err, res) {
        if (err) throw err;
        //display table results
        displayTable(res);
    });
}

//addInventory function allows user to select the item they want to buy
function addInventoryChoice() {
    //mysql query to select all products to show in inquirer list
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
        //mysql query to select product with itemID
        connection.query("SELECT * FROM products WHERE ?", [{ itemID: itemID }], function (err, res) {
            if (err) throw err;
            //display table with updated itemID
            displayTable(res);
        });
    });
}

//function to allow user to add a new item
function addNewItem() {
    //prompts user for name, department, price, and quantity for new item
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter Name of new item:"
        },
        {
            type: "input",
            name: "department",
            message: "Enter Deparment of new item:"
        },
        {
            type: "input",
            name: "price",
            message: "Enter Price of new item:"
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter Stock Quantity of new item:"
        }
    ]).then(function (newItem) {
        //checks to make sure both price and quantity are numbers
        if (isNaN(parseFloat(newItem.price)) || isNaN(parseInt(newItem.quantity))) {
            //reroutes user back to input if numbers are not in correct format
            console.log("Your Price or Quantity inputs were not in the correct format.  Please try again.");
            addNewItem();
        } else {
            //call function to create new item
            createItem(newItem.name, newItem.department, newItem.price, newItem.quantity);
        }
    });
}

//function for creating new products item
function createItem(newItem, newDepartment, newPrice, newQuantity) {
    //mysql query to insert new item into products table
    connection.query("INSERT INTO products SET ?",
        {
            itemName: newItem,
            itemDepartment: newDepartment,
            itemPrice: newPrice,
            itemStockQuantity: newQuantity
        }, function (err, res) {
            if (err) throw err;
            //console logs to user that the new item has been successfully added
            console.log(newItem + " has been inserted into inventory");
            //mysql query to select new product ID
            connection.query("SELECT * FROM products WHERE ?", [{ itemID: res.insertId }], function (err, res) {
                if (err) throw err;
                //display table with new product listing
                displayTable(res);
            });
        }
    );
}