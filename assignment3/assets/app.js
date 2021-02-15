


app_initializer = () => {
var xhttp = new XMLHttpRequest();
    if (sessionStorage.getItem("id") === null || sessionStorage.getItem("names") === null || sessionStorage.getItem("email") === null) {
        //... alert('yeah');
            
        if(window.location.pathname == "/account/menuitem"){
            document.getElementById("add2Cart").style.visibility = "hidden";
            document.getElementById("checkout_button").style.visibility = "hidden";
            document.getElementById("menu_items").style.visibility = "hidden";
        }
        if(window.location.pathname == '/account/dashboard'){
            document.getElementById("welcome_user").style.visibility = "hidden";
        }
        if(window.location.pathname == '/account/cart'){
            
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                    var r = JSON.parse(xhttp.responseText);
                    if(r.Error != undefined) {
                        sessionStorage.clear();
                        if(window.location.pathname != '/')//no need to check if already in the root directory
                        location.replace("http://localhost:3000");
                    }
                    //console.log("ok"+response);
                }
            };
            xhttp.open("GET", "http://localhost:3000/api/validtoken?id="+sessionStorage.getItem("id"), true);
            xhttp.send();
            
        }
        document.getElementById("cart_menu").style.visibility = "hidden";
        document.getElementById("logout").style.visibility = "hidden";
        
        //document.getElementById("logout").style.visibility = "hidden";
    }/**/
    else{
        document.getElementById("cart_email").innerHTML =  sessionStorage.getItem("email");
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
                var r = JSON.parse(xhttp.responseText);
                if(r.Error != undefined) {
                    sessionStorage.clear();
                    if(window.location.pathname != '/')//no need to check if already in the root directory
                        location.replace("http://localhost:3000");
                }
                //console.log("ok"+response);
            }
        };
        xhttp.open("GET", "http://localhost:3000/api/validtoken?id="+sessionStorage.getItem("id"), true);
        xhttp.send();
        


        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
                var r = JSON.parse(xhttp.responseText);
                if(r.Error == undefined) {
                    let content = rows.innerHTML;
                    let gtotal = 0;
                    for(var i = 0; i < r.menu_item.length; i++){
                        
                        content += '<tr>' +
                            '<th scope="row">' + i + '</th>' +
                            '<td class="tm-product-name">' + r.menu_item[i] + '</td>' +
                            '<td>' + r.quantity[i] + '</td>' +
                            '<td>' + number_format(r.price[i]) + '</td>' +
                            '<td>' +  number_format(r.quantity[i] * r.price[i])  + '</td>' +
                        '</tr>';
                        gtotal += (parseInt(r.quantity[i] * r.price[i]));
                    }
                    content += '<tr>' +
                        '<th colspan = "4"><center>Grand Total</center></th>' +
                        '<th><b>' + number_format(gtotal) + '</b></th>' +
                    '</tr>';
                    rows.innerHTML = content;
                }
                //console.log("ok"+response);
            }
        };
        xhttp.open("GET", "http://localhost:3000/api/cart?email="+sessionStorage.getItem("email"), true);
        xhttp.send();
                        
    }
}



create_new_user = () => {
    var name = document.getElementById("name").value;
    var email =  document.getElementById("email").value;
    var street_address = document.getElementById("street_address").value;
    var tosAgreement = document.getElementById("tosAgreement").checked;

    name = typeof(name) == 'string' && name.trim().length > 0 ? name.trim() : false;
    email = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;
    street_address = typeof(street_address) == 'string' && street_address.trim().length > 0 ? street_address.trim() : false;
    tosAgreement = typeof(tosAgreement) == 'boolean' && tosAgreement == true ? true : false;

    if(name && email && street_address && tosAgreement){
        var url = 'http://localhost:3000/api/users';
        var JSON_Data = JSON.stringify({
            'name' : name,
            'email' :email,
            'street_address' : street_address,
            'tosAgreement' : tosAgreement
        });
        
        var xhttp = new XMLHttpRequest();
        if(window.activexobject)
            xhttp = new activeXObject("Microsoft.XMLHttp");
        
    
        xhttp.onreadystatechange = function() {
             if (this.readyState === this.DONE){
                var r = JSON.parse(this.responseText);
                if(r.Error == undefined) {
                    document.getElementById("name").value = '';
                    document.getElementById("email").value = '';
                    document.getElementById("street_address").value = '';
                    document.getElementById("user_creation_response").innerHTML = 'New User Created, You may now login';
                }
                else
                    document.getElementById("user_creation_response").innerHTML = r.Error;
             }   
        };
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON_Data);
    }
}

new_user_login = () => {
    var name = document.getElementById("username").value;
    var email =  document.getElementById("user_email").value;

    name = typeof(name) == 'string' && name.trim().length > 0 ? name.trim() : false;
    email = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;

    if(name && email){
        var url = 'http://localhost:3000/api/tokens';
        var JSON_Data = JSON.stringify({
            'name' : name,
            'email' :email
        });
        
        var xhttp = new XMLHttpRequest();
        if(window.activexobject)
            xhttp = new activeXObject("Microsoft.XMLHttp");
        
        xhttp.onreadystatechange = function() {
           if (this.readyState === this.DONE){
                var r = JSON.parse(this.responseText);
                if(r.Error == undefined) {
                   // alert(this.responseText);
                    if (typeof(Storage) !== "undefined") {
                        // Store
                        sessionStorage.setItem("id", r.id);
                        sessionStorage.setItem("names", r.name);
                        sessionStorage.setItem("email", r.email);
                        location.replace("http://localhost:3000/account/dashboard");
                        // Retrieve
                       //document.getElementById("names").innerHTML = sessionStorage.getItem("names");
                    } 
                    else 
                        document.getElementById("user_login_response").innerHTML = "Sorry, your browser does not support Web Storage...";
                    
                    /*document.getElementById("username").value = '';
                    document.getElementById("user_email").value = '';
                    document.getElementById("user_login_response").innerHTML = 'New User Created, You may now login';*/
                }
                else
                    document.getElementById("user_login_response").innerHTML = r.Error;/**/
            }   
        };
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON_Data);    
    }
}

addToCart = () => {
    if(document.getElementById("menu_item_quantity").value > 0){
            
        var url = 'http://localhost:3000/api/cart';
        
        var JSON_Data = JSON.stringify({
            'email' : sessionStorage.getItem("email"),
            'menu_item' : document.getElementById("menu_item").innerHTML,
            'menu_item_quantity' :  document.getElementById("menu_item_quantity").value,
            'token' : sessionStorage.getItem("id")
        });

        var xhttp = new XMLHttpRequest();
        if(window.activexobject)
            xhttp = new activeXObject("Microsoft.XMLHttp");
        
        xhttp.onreadystatechange = function() {
            if (this.readyState === this.DONE){
                var r = JSON.parse(this.responseText);
                if(r.Error == undefined) {
                    document.getElementById("td_menu_item").innerHTML = document.getElementById("menu_item").innerHTML;
                    document.getElementById("td_menu_item_quantity").innerHTML = document.getElementById("menu_item_quantity").value;
                    document.getElementById("td_price").innerHTML = document.getElementById("price").innerHTML;
                    document.getElementById("td_sub_total").innerHTML = document.getElementById("sub_total").innerHTML;
                    document.getElementById("myCart").showModal(); 
                }
                else{
                    document.getElementById("cart_error").innerHTML = 'Your loging session has expired'; /*r.Error;*/
                    document.getElementById("myCart").showModal(); 
                    location.replace("http://localhost:3000/");
                }
            }   
        };
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON_Data);/**/
    }
    else
        alert('Menu quantity not selected');
}

consumePostRequest = (url, JSON_Data)  => {
    var xhttp = new XMLHttpRequest();
    if(window.activexobject)
        xhttp = new activeXObject("Microsoft.XMLHttp");
    

    xhttp.onreadystatechange = function() {
         if (this.readyState === this.DONE){
            var r = JSON.parse(this.responseText);
            if(r.Error == undefined) {
                document.getElementById("name").value = '';
                document.getElementById("email").value = '';
                document.getElementById("street_address").value = '';
                document.getElementById("user_creation_response").innerHTML = 'New User Created, You may now login';
            }
            else
                document.getElementById("user_creation_response").innerHTML = r.Error;
         }   
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON_Data);
}

consumeGetRequest = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
            var response = xhttp.responseText;
            console.log("ok"+response);
        }
    };
    xhttp.open("GET", "your url", true);
    xhttp.send();
    /*
    $.ajax({
        url: 'http://jsonplaceholder.typicode.com/posts/1',
        method: 'GET',
    }).done(function(data, textStatus, jqXHR){
            console.log(data);
            console.log(jqXHR.responseText);
      });*/
}

place_order = () => {
    var url = "http://localhost:3000/api/orders?email="+sessionStorage.getItem("email") + 
              "&send_email=true&token=" + sessionStorage.getItem("id");
    var xhttp = new XMLHttpRequest();
    //alert(url);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
            //xhttp.responseText
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
    
    document.getElementById("fillOrder").showModal();
}

navigate_checkout = () => {
    location.replace("http://localhost:3000/account/cart");
}

number_format = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

app_initializer();