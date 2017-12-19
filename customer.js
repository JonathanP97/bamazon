var mysql = require('mysql');
var inquirer = require('inquirer');

var con = mysql.createConnection({
	host:'localhost',
	port: 3306,

	user: 'root',
	password: 'password',
	database: 'bamazon'
});

con.connect(function(err) {
	if(err) throw err;

	console.log("connected as " + con.threadId);
	display();
});

// display(); 
function display() {
	con.query("SELECT * FROM products", function(err, res) {
		if(err) throw err;

		console.log("id  Product   department   price   current_stock");
		for(var i=0; i<res.length; i++) {
			console.log(res[i].item_id + "  " + res[i].product_name + "  " + res[i].department_name + 
					"  " + res[i].price + "  " + res[i].stock_quantity);
		}
		getInput(); 
	});
}

function getInput() {
	inquirer.prompt([
	  {
	  	message: 'Enter the id of item you would like to purchase',
	  	name: 'item'
	  },
	  {
	  	message: 'Enter quantity you would like to purchase',
	  	name: 'amount'
	  }
	]).then( function(input) {
		var id = input.item;
	  	var userAmount = input.amount;
	  	con.query("SELECT * FROM products WHERE item_id=?",[id], function(err, data) {
	  		console.log("\n");
			if(err) throw err;

			console.log(data);
			if(data.length !== 0) {
				var currentStock = data[0].stock_quantity;
		  	  	var cost = data[0].price;
		  	  	transaction(id, cost, currentStock, userAmount);	
			}
			
	  	}); 
	});
};

function transaction(id, cost, stock, buyAmount) {
	if(buyAmount < stock) {
		
		var remainingStock = stock - buyAmount;
		var total = buyAmount * cost;
		console.log("\nThe total cost of your transaction was $" + total);
		console.log("Amount: " + buyAmount);
		con.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [remainingStock , id], function(err, res) {
			if(err) throw err;
			console.log("Your transaction is complete");

			con.end();
		});
	}
};