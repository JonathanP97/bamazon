var mysql = require('mysql');
var inquirer = require('inquirer');

var con = mysql.createConnection({
	host:'localhost',
	port: 3306,

	user: 'root',
	password: 'password',
	database: 'bamazon'
});

display(); 
function display() {

	con.connect(function(err) {
		if(err) throw err;

		con.query("SELECT * FROM products", function(err, res) {
			if(err) throw err;

			console.log("id  Product   department   price   current_stock");
			for(var i=0; i<res.length; i++) {
				console.log(res[i].item_id + "  " + res[i].product_name + "  " + res[i].department_name + 
						"  " + res[i].price + "  " + res[i].stock_quantity);
			}
			 
		});
		getInput();
	});

}

function getInput() {
  
  con.connect( function(err, input) {
  	var quantity;
	inquirer.prompt([
	  {
	  	message: 'Enter the id of item you would like to purchase',
	  	name: 'item'
	  },
	  {
	  	message: 'Enter quantity you would like to purchase',
	  	name: 'amount'
	  }
	  ]).then( 
	  		function(input) {
				con.query("SELECT stock_quantity FROM products WHERE item_id=?", [input.amount], function(err, res) {
						console.log(input.amount);
						if(err) throw err;
						quantity = res[0].stock_quantity;
						return quantity;	
				});
			}
	   ).then(
			function(quantity) {
				if(input.amount < quantity) {

					con.query("UPDATE products SET stock_quantity=? WHERE id=", [leftover , input.item], function(err, res) {
						if(err) throw err;
						console.log("worked");

						con.end();
					});

				}

			}
	   );

		// con.query("SELECT stock_quantity FROM products WHERE item_id=?", [input.amount] ).then(
		// 	function(err, res) {
		// 		console.log(input.amount);
		// 		if(err) throw err;
		// 		quantity = res[0].stock_quantity;
		// 		return quantity;	
		// 	}



		// if(input.amount < quantity) {

		// 	con.query("UPDATE products SET stock_quantity=? WHERE id=", [leftover , input.item], function(err, res) {
		// 		if(err) throw err;
		// 		console.log("worked");

		// 		con.end();
		// 	});

		// }
		
		
	  

	
	
  });
}