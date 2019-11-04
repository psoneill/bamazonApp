//require all of mysql, inquirer, dotenv, and the local keys file
var mysql = require("mysql");
var inquirer = require("inquirer");
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
var currentInventory = [];

//connects to database on load
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    //initiates first product list load
    bamazonUpdate();
});

//bamazonUpdate function selects all products from database bamazon
function bamazonUpdate() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        currentInventory = res;
        //calls function where user desiredselects item
        chooseItem(res);
    });
}

//chooseItem function allows user to select the item they want to buy
function chooseItem(res) {
    //use inquirer to ask user to select an item from list to buy
    inquirer.prompt([
        {
            //inquirer type is list
            type: "list",
            //name of variable is userCommand
            name: "userCommand",
            //choices for product list
            choices: res.map(e => e.itemID + " - " + e.itemName + " (" + e.itemDepartment + ") - Price: " + e.itemPrice + " - Quantity: " + e.itemStockQuantity),
            //message for user
            message: "Choose item to buy"
        }
    ]).then(function (userSelect) {
        //saves variable for the selected item
        var selectedItem = userSelect.userCommand;
        //pulls out itemID from selected item
        var itemID = selectedItem.substr(0, selectedItem.indexOf('-') - 1);
        //pulls out stockQuantity from selecteditem
        var stockQuantity = selectedItem.substr(selectedItem.indexOf("Quantity: ") + 10, selectedItem.length);
        //pulls out itemPrice from selecteditem
        var itemPrice = selectedItem.substr(selectedItem.indexOf("Price: ") + 7, selectedItem.indexOf(" - Quantity: ") + 10, selectedItem.length);
        //calls chooseQuantity function where user selects the quantity to buy
        chooseQuantity(itemID, stockQuantity, itemPrice);
    })
}

//function chooseQuantity allows user to select quantity to buy
function chooseQuantity(itemID, stockQuantity, itemPrice) {
    inquirer.prompt([
        {
            //inquirer prompt type input
            type: "input",
            name: "userQuantity",
            message: "What quantity would you like?"
        }
    ]).then(function (userSelect) {
        //saves userQuantity entered into variable userQuantity
        var userQuantity = userSelect.userQuantity;
        //checks to make sure that user entry is a number
        if(isNaN(parseFloat(userQuantity))) {
            //console logs user error
            console.log("Entry is not a number - Try Again");
            chooseQuantity(itemID, stockQuantity, itemPrice);
        } else if (parseInt(userQuantity) > parseInt(stockQuantity)) {
            //console logs to user that not enough quantity is available for user selected item
            console.log("Sorry - not enough quantity available.  Try again");
            //recalls chooseQuantity function to allow user to select new quantity
            chooseQuantity(itemID, stockQuantity, itemPrice);
        } else {
            var userTotal = parseFloat(itemPrice) * parseFloat(userQuantity);
            //lets user know that they have successfully purchased item
            console.log("Congratulations you have bought " + userQuantity + " units for a total cost of $" + userTotal);
            //calculates new stock quantity
            var remainingStockQuantity = stockQuantity - userQuantity;
            //calls function to update database with new stock quantity
            updateDatabaseQuantity(itemID, remainingStockQuantity, userTotal);
        }
    })
}

//updateDatabaseQuantity function to update mysql database for selected item
function updateDatabaseQuantity(itemID, remainingStockQuantity, userTotal) {
    //calculate total sales using userTotal and the database current item total
    var totalSales = userTotal + currentInventory[itemID - 1].itemSales;
    //calls sql query to update table products with new stock quantity and updates total sales
    connection.query("UPDATE products SET ? WHERE ?", [{ itemStockQuantity: remainingStockQuantity,  itemSales: totalSales}, { itemID: itemID }], function (err, res) {
        if (err) throw err;
        //prompts user to either return to base menu or end session
        inquirer.prompt([
            {
                type: "input",
                name: "userReturn",
                message: "Enter Q to quit or any other character to return to the item select screen"
            }
        ]).then(function (userSelect) {
            //if statement for use select
            if (userSelect.userReturn.toLowerCase() !== "q") {
                //if user does not select q then recall initial page with new updated data
                bamazonUpdate();
            } else {
                //if user selects q then end connection
                connection.end();
            }
        })
    });
}