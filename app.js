var express=require('express');
const bodyParser=require("body-parser");
var mysql=require("mysql");
var path = require('path');
const sessions = require('express-session');
const fileUpload = require('express-fileupload');
var app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    resave: false
}));
app.use(express.static(path.join(__dirname,'public')));
app.use(fileUpload());


var db = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "", // my password
    database: "mydata"
});
db.connect(function(error)
{
    if(error)
    {
        console.log(error);;
    }
    else
    console.log("my sql connected");
})
app.get("/",function(req,res)
{
    res.sendFile(__dirname + '/signup.html');
})

//register
app.post("/",function(req,res)
{
    // console.log(req.body);
    var firstName=req.body.firstName;
    // var lastName=req.body.lastName;
    var userName=req.body.userName;
    var password=req.body.password;
    // console.log(req.files);
    // // if (!req.file)
    // //             return res.status(400).send('No files were uploaded.');
    // var file=req.files.imga;
    // var img_name=file.name;
    
    
    var sql = `INSERT INTO myda (name,  email, password) VALUES ('${firstName}',  '${userName}', '${password} ')`;
    db.query(sql, function (err, result) {
        if (err){
            console.log(err);
        }else{
            // using userPage function for creating user page
            res.sendFile(__dirname+"/sucess.html");
            
        };
    

    });
   
})
app.get("/login",function(req,res)
{
    res.sendFile(__dirname+"/login.html")
})
app.post("/dashboard",  function(req, res){
    var userName = req.body.userName;
    var password = req.body.password;

    db.connect(function(err) {
        if(err){
            console.log(err);
        };
//get user data from MySQL database
        db.query(`SELECT * FROM myda WHERE email = '${userName}' AND password = '${password}'`, function (err, result) {
          if(err){
            console.log(err);
          };
// creating userPage function to create user page
          function userPage(){
            // We create a session for the dashboard (user page) page and save the user data to this session:
            req.session.user = {
                name: result[0].name, // get MySQL row data
                // get MySQL row dataa
                // email: email,
                // password: password 
            };

            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login and register form with Node.js, Express.js and MySQL</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
            <div class="container my-4">
            <div class="jumbotron">
                <h1 class="display-4"> HELLO <strong>${req.session.user.name}<strong> </h1>
                
                <a href="/">Log out</a>
                <hr class="my-4">
                <p>click on button to visit <strong>Admin page</strong> </p>
                <a class="btn btn-info btn-lg" href="/admin" role="button">Admin</a>
            </div>
        </div>
            </body>
            </html>
            `);
            
        }

        if(Object.keys(result).length > 0){
            userPage();
        }else{
            // res.sendFile(__dirname + '/failLog.html');
            // res.send(<a href ="/"></a>)
            res.redirect("/login");
        }

        });
    });
});
app.get("/admin",function(req,res)
{
   var query ='SELECT * FROM myda ORDER BY id DESC';
   db.query(query,function(error,data)
   {
    if(error)
    console.log(error);
    else
    {
        res.render('admin', {title:'Node.js MySQL CRUD Application', action:'list', sampleData:data});
    }
   })
})
app.listen(3000,function()
{
    console.log("port 3000");
})