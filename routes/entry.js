
var users = require('../lib/users');
// Records the logged in user:
var userids = 0;
// A logged in "database":
var online = {};

// # User Server-Side Routes

//GET register page
exports.register = function(req, res){
  res.render('register',{title: 'Tweetee'});
};

//GET forgot login page
exports.forgotlogin = function(req, res){
  res.render('forgotlogin',{title: 'Tweetee'});
};

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
                          message : authmessage });//For login username and password
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
    res.redirect('/'+onlineUser.username+'/home'); ///?
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

