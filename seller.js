var mysql = require('mysql');
var inquirer = require('inquirer');

var con = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'password',
	database: 'bamazon'
});

// con.connect(err => {
// 	if(err) throw err;
// 	console.log("Connected: " + con.threadId);
// 	input();
// });

module.exports = function input() {
		inquirer.prompt([
		{
			message: 'Enter name of item you would like to sell',
			name: 'item'
		},
		{
			message: 'Enter department for item (clothing, electronics)',
			name: 'department'
		},
		{
			message: 'Enter price of item',
			name: 'price'
		},
		{
			message: 'Enter quantity to sell',
			name: 'quant'
		}
		]).then(input => {
			var price = Number(input.price);
			var quantity = Number(input.quant);
			con.query("INSERT INTO products(product_name, department_name, price, stock_quantity)" +
				" VALUES(?,?,?,?)", [input.item, input.department, price, quantity], (err, data) => {
					if(err) throw err;
					console.log(data);
			});
		}).then(() => {
			console.log("Thanks for selling your stuff");
			con.end();
		});
	}


// function input() {
// 	inquirer.prompt([
// 	{
// 		message: 'Enter name of item you would like to sell',
// 		name: 'item'
// 	},
// 	{
// 		message: 'Enter department for item (clothing, electronics)',
// 		name: 'department'
// 	},
// 	{
// 		message: 'Enter price of item',
// 		name: 'price'
// 	},
// 	{
// 		message: 'Enter quantity to sell',
// 		name: 'quant'
// 	}
// 	]).then(input => {
// 		var price = Number(input.price);
// 		var quantity = Number(input.quant);
// 		con.query("INSERT INTO products(product_name, department_name, price, stock_quantity)" +
// 			" VALUES(?,?,?,?)", [input.item, input.department, price, quantity], (err, data) => {
// 				if(err) throw err;
// 				console.log(data);
// 		});
// 	}).then(() => {
// 		console.log("Thanks for selling your stuff");
// 		con.end();
// 	});
// }
