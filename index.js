const mysql = require('mysql');
const inquirer = require('inquirer'); 
const Table = require('easy-table');

const Rx = require('rx');
const prompts = new Rx.Subject();

const con = mysql.createConnection({
	host:'localhost',
	port: 3306,

	user: 'root',
	password: 'password',
	database: 'bamazon'
});

let i = 1;
let name = 'dude';

con.connect( function(err) {
	if(err) throw err;
	console.log("connected to bamazon database");
});

// Displays menu descriptiion
function aboutDisplay() {
	console.log("\nI am a basic node & mysql app that connects to Bamazon's database to provide various functions");
	// console.log("Admin - Controls for admin");
	console.log("Buy - Purchase items");
	console.log("Exit - Exit the app");
	console.log("Sell - Post your own items for sale");
	console.log("View - Displays all items currently in stock\n");
	prompts.onNext(makePrompt('| About | Buy | Exit | Sell | View | ' + ` `));
}

// Displays items in stock
function viewItems(flag, callback) {
	con.query("SELECT * FROM products", function(err, res) {
		if(err) throw err;

		var data = res;
		var t = new Table;

		data.forEach(product => {
			t.cell('Product id', product.item_id);
			t.cell('Product', product.product_name);
			t.cell('Department', product.department_name);
			t.cell('Price', product.price);
			t.cell('In-Stock', product.stock_quantity);
			t.newRow();
		});

		callback(t.toString());
		console.log('\n');
		if(flag) prompts.onNext(makePrompt('| About | Buy | Exit | Sell | View | ' + ` `));
	});
}

function adminPrompt() {
	return {
		type: 'password',
		name: 'password',
		message: 'not working atm...\n\n'
	};
}

function buyPrompt() {
	inquirer.prompt([
	  {
		type: 'input',
	  	message: 'Enter the id of item you would like to purchase',
	  	name: 'item'
	  },
	  {
	  	type: 'input',
	  	message: 'Enter quantity you would like to purchase',
	  	name: 'amount'
	  }
	]).then(input => {
		// console.log(input);
		var id = input.item;
	  	var userAmount = input.amount;
	  	con.query("SELECT * FROM products WHERE item_id=?",[id], function(err, data) {
			if(err) throw err;

			if(data.length !== 0) {
				var currentStock = data[0].stock_quantity;
		  	  	var cost = data[0].price;
		  	  	transaction(id, cost, currentStock, userAmount);	
			}
			
	  	}); 
	})
}

function transaction(id, cost, stock, buyAmount) {
	if(buyAmount <= stock) {

		var remainingStock = stock - buyAmount;
		var total = buyAmount * cost;
		console.log("\nThe total cost of your transaction was $" + total);
		console.log("Amount: " + buyAmount);

		if(remainingStock === 0) {
			con.query("DELETE FROM products WHERE item_id=?", [id], (err, res) => {
				if(err) throw err;
				console.log("No more item in database");
			});
		}
		con.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [remainingStock , id], function(err, res) {
			if(err) throw err;
			console.log("Your transaction is complete");

			con.end();
		});
	} else {
		console.log("\nNope sorry, not enough in stock to complete transaction\nPlease try again\n");
		viewItems(false, data => {
	  	  	console.log(data);
	  	  	buyPrompt();
		});
	}
};

// Prompts user to input data for item
// Adds item to sql DB
function sellerPrompt() {
	inquirer.prompt([
		{
			type: 'input',
			message: 'Enter name of item you would like to sell',
			name: 'item'
		},
		{
			type: 'input',
			message: 'Enter department for item (clothing, electronics)',
			name: 'department'
		},
		{
			type: 'input',
			message: 'Enter price of item',
			name: 'price'
		},
		{
			type: 'input',
			message: 'Enter quantity to sell',
			name: 'quant'
		}
	]).then(input => {
		var price = Number(input.price);
		var quantity = Number(input.quant);
		console.log(input);
		con.query("INSERT INTO products(product_name, department_name, price, stock_quantity)" +
			" VALUES(?,?,?,?)", [input.item, input.department, price, quantity], (err, data) => {
			if(err) throw err;
			console.log("Thank you\nYour product is now available to purchase\nCLosing app now...");
			con.end(); 
		});
		
	});
}

// Prompt that asks for users name
function starterPrompt() {
	return {
		type: 'input',
		name: `userInput-${i}`,
		message: 'What is your name?\n',
	};
}

// Prompt that is constantly displayed to user
function makePrompt(msg) {
  return {
    type: 'list',
    name: `userInput-${i}`,
    message: `${msg || 'What is your name?'}\n\n`,
    choices: ['About', 'Buy', 'Exit', 'Sell', 'View'],
  };
}

// Route system for prompts
inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
  if (i >= 1) {

  	// On first run through will display input from starterPrompt
  	if(name === 'dude') {
  		name = answer;
		console.log('\nWelcome ' + name + '!\nSelect one of the available options\n');
	// Converts the selection from list prompt to lowercase to route to  
	// requested function
	} else {
		let temp = answer.toLowerCase();
		answer = temp;
	}

	switch( answer ) {
		case 'about':
		  aboutDisplay();
		  break;
	  	// case 'admin':
	  	//   prompts.onNext(adminPrompt());
	  	//   break;
	  	case 'buy':
	  	  viewItems(false, data => {
	  	  	console.log(data);
	  	  	buyPrompt();
	  	  });
	  	  break;
	  	case 'view':
	  	  viewItems(true, data => {
	  	  	console.log(data);
	  	  });
	  	  break;
	  	case 'exit':
	  	  end();
	  	case 'sell':
	  	  sellerPrompt();
	  	  break;
	  	default: 
		  prompts.onNext(makePrompt('| About | Buy | Exit | Sell | View | ' + `\n`));
	  	  break;
	};
  } else {
    prompts.onCompleted();
  }
}, (err) => {
  console.warn(err);
}, () => {
  prompts.onNext(makePrompt('| About | Buy | Exit | Sell | View | ' + `\n`));
});

// App starts by sending first prompt to user
// Calls starterPrompt function which returns prompt object
prompts.onNext(starterPrompt());