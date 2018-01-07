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

// const choicesArray = ['View items up for sale', 'Purchase Item', 
// 					'Sell Item', 'Admin Login', 'End'];

// const questions = [
//   {
//  	when: function() {
//   		if(name !== undefined) return name;
//   	},
//  	type: 'input',
//  	name: 'name',
//  	message: 'What is your name?',
//   } , {	
// 	type: 'list',
//  	name: 'command',
//  	message: 'Select your option',	
//  	choices: choicesArray
//   }
// ];


 
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

function sellerPrompt(index) {
	// switch(index) {
	// 	case 2:
	// 	  return {
	// 	 	message: '\nEnter name of item you would like to sell',
	// 		name: 'item'
	// 	  }
	// 	  break;
	// 	case 3:
	// 	  return {
	// 		message: 'Enter department for item (clothing, electronics)',
	// 		name: 'department'
	// 	  }
	// 	  break;
	// }
	i += 1;
		return {
			type: 'input',
		 	message: 'Enter name of item you would like to sell',
			name: 'item'
		}
}

function makePrompt(msg) {
  return {
    type: 'input',
    name: `userInput-${i}`,
    message: `${msg || 'What is your name?'}\n\n`,
  };
}


let i = 1;
let name = 'bob';

inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
  
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
	  	case 'view':
	  	  viewItems();
	  	  break;
	  	case 'exit':
	  	  end();
	  	case 'sell':
	  	  prompts.onNext(sellerPrompt(i));
	  	  break;
	  	default: 
		  prompts.onNext(makePrompt('\n| About | Admin | Buy | Exit | Sell | View | ' + `prompt #${i}`));
	  	  break;
	};

	// i becomes 2 to reroute to handle selling an item
  	if (i >= 2) {
  		console.log(answer);
  		if(i === 2) {
  		  i = 3;
  		  rompts.onNext(sellerPrompt(i));
  		}
  		
  	}
  } else {
    prompts.onCompleted();
  }
}, (err) => {
  console.warn(err);
}, () => {
  console.log('Interactive session is complete. Good bye! 👋\n');
});

prompts.onNext(makePrompt());