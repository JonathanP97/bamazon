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


function viewItems() {
	con.query("SELECT * FROM products", function(err, res) {
		if(err) throw err;
		// console.log(res);

		// console.log("id  Product   department   price   current_stock");
		// for(var i=0; i<res.length; i++) {
		// 	console.log(res[i].item_id + "  " + res[i].product_name + "  " + res[i].department_name + 
		// 			"  " + res[i].price + "  " + res[i].stock_quantity);
		// }
		var data = res;
		var t = new Table;

		data.forEach(product => {
			t.cell('Product id', product.item_id);
			t.cell('Product', product.product_name);
			t.cell('Department', product.department_name);
			t.cell('Price', product.price);
			t.cell('In-Stock', product.stock_quantity);
			t.newRow();
		})

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
  
  if (answer !== '') {

  	if(name === 'bob') {
  		name = answer;
		console.log('\nWelcome ' + name + '!\nType one of the available options\n');
	}

	switch( answer ) {
	  	case 'admin':
	  	  prompts.onNext(adminPrompt());
	  	  break;
	  	case 'view':
	  	  viewItems();
	  	  break;
	  	case 'exit':
	  	  end();
	  	default: 
		  prompts.onNext(makePrompt('\n| About | Admin | Buy | Exit | Sell | View | ' + `prompt #${i}`));
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