1.	New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
Post request user URL: localhost:3000/users
sample body parameters:
{
	
	"name": "Xavier",
	
	"email": "xavier@yahoo.com",
	
	"street_address": "Hollywood Califonia",
	
	"tosAgreement" : true

}

Note that Get, Put and Delete requests can't work without a token in the headers


Sample Get user request URL: localhost:3000/users?email=xavier@yahoo.com

Sample Put(Edit) user request URL: localhost:3000

{
	
	"name": "Xavier",
	
	"email": "xavier@yahoo.com",
	
	"street_address": "Hollywood Califonia",
	
	"tosAgreement" : true

}

Sample Delete User request URL: localhost:3000/users?email=xavier@yahoo.com

2. 	Users can log in and log out by creating or destroying a token.

Post request URL: localhost:3000/tokens
sample body parameters:
{
	
	"name": "Xavier",
	
	"email": "xavier@yahoo.com"

}

Sample Response:
{
    "email": "xavier@yahoo.com",
    "id": "9g1lp9dwhpwc8207dmbk",
    "expires": 1609893805453
}

Sample Get request URL: localhost:3000/tokens?id=xavier@yahoo.com
{
    "email": "xavier@yahoo.com",
    "id": "9g1lp9dwhpwc8207dmbk",
    "expires": 1609893805453
}

Sample Put request URL: localhost:3000/

sample body parameters:
{
	
	"name": "Xavier",
	
	"extend": true
}

Sample Delete token request URL: localhost:3000/tokens?id=9g1lp9dwhpwc8207dmbk

Note: Users can also logout using localhost:3000/logout?id=9g1lp9dwhpwc8207dmbk  token will also be deleted


3. 	When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).

Sample get all menu item request URL(Must be logged in): localhost:3000/menu?email=xavier@yahoo.com

Sample response:

{
    "1": "Margarita",
    "2": "Tikka Veg",
    "3": "Tikka Chicken",
    "4": "Chicken Supreme",
    "5": "Sweet Chilli Chicken",
    "6": "BBQ Chicken Suya",
    "7": "Smokey Chicken Sausage",
    "8": "Pepperoni Lovers",
    "9": "Sweet Chilli Chicken",
    "10": "Suya Triple Meat"
}


4. 	A logged-in user should be able to fill a shopping cart with menu items

Sample request URL: localhost:3000/cart
Note: User must be logged in to fill shoppong cart
sample body parameters:
{
	
	"email": "xavier@yahoo.com",
    
	"menu_item" : "Tikka Chicken",
    
	"menu_item_quantity": "4"

}




5. 	A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

Its only a get method that is implemented here, 
call URL localhost:3000/orders/?email=xavier@yahoo.com and 
make sure you have an active token and cart



6.	When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

Its only a get method that is implemented here, 
call localhost:3000/orders/?email=xavier@yahoo.com
make sure you have an active token and cart
and in the body of the request pass this:
{

	"send_email": true

}
















