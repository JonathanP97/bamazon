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
let name = 'bob';

con.connect( function(err) {
	if(err) throw err;
	console.log("connected to bamazon database");
});

// Displays menu descriptiion
function aboutDisplay() {
	console.log("\nI am a basic node & mysql app that connects to Bamazon's database to provide various functions");
	console.log("Admin - Controls for admin");
	console.log("Buy - Purchase items");
	console.log("Exit - Exit the app");
	console.log("Sell - Post your own items for sale");
	console.log("View - Displays all items currently in stock");
	prompts.onNext(makePrompt('\n| About | Admin | Buy | Exit | Sell | View | ' + ` prompt #${i}`));
}

// Displays items in stock
function viewItems() {
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

		console.log(t.toString());
		prompts.onNext(makePrompt('\n| About | Admin | Buy | Exit | Sell | View | ' + ` prompt #${i}`));
	});
}

function adminPrompt() {
	return {
		type: 'password',
		name: 'password',
		message: 'Enter admin password\n\n'
	};
}

function buyPrompt() {

}

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

function makePrompt(msg) {
  return {
    type: 'input',
    name: `userInput-${i}`,
    message: `${msg || 'What is your name?'}\n\n`,
  };
}

inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
  console.log('route');
  if (answer !== '' && i >= 1) {

  	if(name === 'bob') {
  		name = answer;
		console.log('\nWelcome ' + name + '!\nType one of the available options\n');
	}

	switch( answer ) {
		case 'about':
		  aboutDisplay();
		  break;
	  	case 'admin':
	  	  prompts.onNext(adminPrompt());
	  	  break;
	  	case 'buy':
	  	  buyPrompt();
	  	  break;
	  	case 'view':
	  	  viewItems();
	  	  break;
	  	case 'exit':
	  	  end();
	  	case 'sell':
	  	  sellerPrompt();
	  	  break;
	  	default: 
		  prompts.onNext(makePrompt('| About | Admin | Buy | Exit | Sell | View | ' + `prompt #${i}\n`));
	  	  break;
	};
  } else {
    prompts.onCompleted();
  }
}, (err) => {
  console.warn(err);
}, () => {
  console.log('Interactive session is complete. Good bye! 👋\n');
});

prompts.onNext(makePrompt());