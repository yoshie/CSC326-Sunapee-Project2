
var users = require('../lib/users');
// Records the logged in user:
var userids = 0;
// A logged in "database":
var online = {};

// # User Server-Side Routes

//GET rsegister page
exports.register = function(req, res){
  res.render('register',{title: 'Tweetee', message: req.flash("error")});
};

//GET forgot login page
exports.forgotlogin = function(req, res){
  res.render('forgotlogin',{title: 'Tweetee', message: " "});
};

exports.forgotloginProcess = function(req, res){
  //
  var email = req.body.email.length
  if(email.length > 0){
    for(var i = 0; i < users.userdb.length; i++){
        if(users.userdb[i].email = email){
          var username = users.userdb[i].username;
          //Send Mail username, email, password reset page
          
          break;
        }
    }
    users.userdb
  }else{
    req.flash('message',"Please make sure that all of the required  are filled");
  }
  res.redirect('forgotlogin',{title: 'Tweetee', message: req.flash("message")});
};

exports.verifyCode = function(req, res){
  res.render('verifyCode',{title: 'Tweetee', message: req.flash("message")});
}

exports.verify = function(req, res){
  // Part 1: Check to see if the registration is ok

   /*Register Requirements - 
    *   1. The fields of: Name, Username, E-mail, Password, Retype P are filled (astarisk indicated)
    *   2. The username is not already taken and no spaces
    *   3. The email is valid (with @ symbol at least?)
    *   4. The password is a minimum of 6 characters and the retype matches
    *   People can reference any location and website
    * If requirements are not fulfiled then the respective error message is displayed
    */
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var retypeP = req.body.retypeP;
    var location = req.body.location;
    var website = req.body.website;
    if(name.length == 0 || username.length == 0 || email.length == 0 || password.length == 0){
      //If at least one of the necessary parameters do not exist, error posted
        req.flash('error',"Please make sure that all of the required fields are filled");
        res.redirect('/register?');
    }else if(users.checkUsername(username)){
        //If the username is taken, error. end
        req.flash('error',"The username is currently taken. Please chose another and try again.");
        res.redirect('/register?');
    }else if(users.checkEmail(email)){
        //Email missing a @?
        req.flash('error',"The email is invalid. Please try again.");
        res.redirect('/register?');
    }else if(users.checkPassword(password, retypeP)){
        //Password is less than 6 characters and match
        req.flash('error', "The passwords must match and be at least 6 characters long.");
        res.redirect('/register?');
    }else{
        //Form passed the check, so the registration code is gained
        //Construct the code
        var randVarCode = makeCode();
        var userVerObj = {
               name: name, username: username,
               password: password, 
               email:email, 
               code:randVarCode, 
               location:location, 
               website:website
        }; //Store the code and url for the user
        users.emailVerUsers.push(userVerObj);
        console.log(userVerObj.username + ' ' + userVerObj.code );
        //Send an email to the person with link and code
        emailCode(name, username, password, email, randVarCode);
        users.codeUserList.push(username);
        req.flash('message', "A code has been sent out to the email provided."
              +"Submit it to confirm the account and complete the registration.");
        res.render('verifyCode',{title:"Tweetee", message: req.flash("message"), email:email}); 
    }
}
exports.codeCheck = function(req,res){
    var b = false;
    var formCode = req.body.code;
    for(var i=0;i<users.emailVerUsers.length;i++){
        if(users.emailVerUsers[i].code == formCode){
          b = true;
          var userToVerify = users.emailVerUsers[i];
          break;
        }
    }
    if(b){
      //Create the new user
      users.delFromCodeList();
      var newUser = {
        name: userToVerify.name,
        username: userToVerify.username,
        password: userToVerify.password,
        email: userToVerify.email,
        location: userToVerify.location,
        website: userToVerify.website,
      };
      users.userdb.push(newUser);
      req.flash('msg', "The code is correct! Login to begin.");
      res.redirect('/')
    }else{
      req.flash('message', "The code is incorrect! Try Again.");
      res.redirect('verifyCode')
    }
}

//Send the following to the client (user's page)
exports.user = function (req, res) {
    var userid=req.cookies.userid;
    var onlineUser=online[userid];
    console.log(req.params.user);
    if (onlineUser.username == req.params.user){
      if (onlineUser) {
          res.send('<h3>User: ' + 
                   onlineUser.name +'</h3>');
      } else {
          res.send('<h3>Unknown User: ' + u + '</h3>');
      }
  }else{
        res.send('Page Access Not Authorized.');
  }
};

function flash(req, res, name, value) {
  // If `value` is not undefined we are *setting* a flash
  // value (i.e., setting a cookie).
  if (value !== undefined) {
    res.cookie(name, value);
    // We return the `value` to be consistent with the
    // alternative call - to retrieve the value.
    return value;
  }
  else {
    // Grab the `value` from the cookies sent along with
    // the request.
    value = req.cookies[name];
    // Clear the cookie in the response.
    res.clearCookie(name);
    // Return the `value`.
    return value;
  }
}

// ## login
// Provides a user login/register view.
exports.login = function(req, res){
  // Grab any messages being sent to use from redirect.
  var authmessage = flash(req, res, 'userAuth') || '';

  // TDR: redirect if logged in:
  var userid  = req.cookies.userid;
  console.log("Cookie userid:"+req.cookies.userid);

  // TDR: If the user is already logged in - we redirect to the
  // main application view. We must check both that the `userid`
  // and the `online[userid]` are undefined. The reason is that
  // the cookie may still be stored on the client even if the
  // server has been restarted.
  if (userid !== undefined && online[userid] !== undefined) {
    var onlineUser=online[userid] 
    res.redirect('/'+onlineUser.username+'/home');
  }
  else {
    // Render the login view if this is a new login.
    res.render('login', { title   : 'Tweetee',
                          message : authmessage,
                          msg: req.flash("msg") });//For login username and password
  }
};

// ## authentication
// Performs **basic** user authentication.
exports.userAuth = function(req, res) {
  // TDR: redirect if logged in:
  var userid = req.cookies.userid;

  // TDR: do the check as described in the `exports.login` function.
  if (userid !== undefined && online[userid] !== undefined) {
    var onlineUser=online[userid] 
    res.redirect('/'+onlineUser.username+'/home');
  }
  else {
    // Pull the values from the form.
    var username = req.body.username;
    var password = req.body.password;
    // Perform the user lookup.
    users.lookup(username, password, function(error, user) {
      if (error) {
        // If there is an error we "flash" a message to the
        // redirected route `/user/login`.
        flash(req, res, 'userAuth', error);
        res.redirect('/');
      }
      else {
        // TDR: use cookie to record stateful connection. Here
        // we record the generated userid as a cookie to be
        // passed back and forth between client and server.
        userid = ++userids;
        res.cookie('userid',
                   userid+'',
                   { maxAge : 900000 }); // 15 minutes

        // Store the user in our in memory database.
        online[userid] = user;
        // Redirect to main.
        var onlineUser=online[userid] 
        //var username = req.body.username;
        //temp = username;
        res.redirect('/'+onlineUser.username+'/home');
      }
    });
  }
};

// ## logout
// Deletes user info & cookies - then redirects to login.
exports.logout = function(req, res) {
  // TDR: handle cookies
  var userid = req.cookies.userid;
  if (online[userid] !== undefined) {
    res.clearCookie('userid');
    delete online[userid];
  }
  res.redirect('/');
};
//////////////////////Functions for verification////////////////////
//Creates a random 10 char code
function makeCode(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

function emailCode(name, username, password, email, code){
    var alphamail = require('alphamail');

    var emailService = new alphamail.EmailService("513cedbd564467-24442067");

    var message = {
       "name": name,
       "username": username,
       "code": code,
       "url": "http:\/\/localhost:3000/verifyCode\/"
    };

var payload = new alphamail.EmailMessagePayload()
    .setProjectId(1452) // ID of "Tweetee Registration Code" project
    .setSender(new alphamail.EmailContact("ysasaki2014@gmail.com", "ysasaki2014@gmail.com"))
    .setReceiver(new alphamail.EmailContact(email, email))
    .setBodyObject(message);

emailService.queue(payload, function(error, result){
    if(error){
        console.log("Error! " + result + " (" + error + ")");
    }else{
        console.log("Mail successfully sent! ID = " + result);
    }
});

};


