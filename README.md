# bamazonApp

-------BAMAZON----------

Link: https://github.com/psoneill/bamazonApp

This app demonstrates the basic capabilities of an online retailer.  Products are stored in a mySql database and accessed through the CLI utilizing Node js.  There are three roles that the user can take: Customer, Manager, and Supervisor which each have their own unique options that all interact with the same bamazon database.

bamazonCustomer:
- Users can select an item that has been populated from the bamazon database.  Item data includes name, department, price, and stock quantity.
- Once the user selects an item they can inpu the quantity they want to buy
- If there is sufficient stock quantity to fulfill the order then it is processed and the user is alerted to the total price
- If there is not sufficient stock quantity to fulfill the order then the user is alerted to input a new quantity

bamazonManager:
- Managers have a list of 4 options they can select to perform administrative duties on the database
- 1 - Managers can view all products currently listed for sale in a table format
- 2 - Managers can view all products which currently have low inventory (less than 5 units left)
- 3 - Managers can add inventory to an existing item
- 4 - Managers can create a new item to add to the products table

bamazonSupervisor:
- Supervisors have a list of 2 options that they can select from
- 1 - Supervisors can view a table listing each department with the sales, overhead cost, and profits associated with those departments
- 2 - Supervisors can add a new department by providing a department name and an overhead cost

Technologies Used:
- Node JS
- DotEnv NPM
- mySql NPM
- Inquirer NPM
- cli-table NPM
- mySql Workbench

![Bamazon Customer Demo](./demos/bamazonCustomerDemo.webm);
![Bamazon Manager Demo](./demos/bamazonManagerDemo.webm);
![Bamazon Supervisor Demo](./demos/bamazonSupervisorDemo.webm);