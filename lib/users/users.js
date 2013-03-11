// # Users Module
// This is a module for accessing user data. We are using
// [Docker](https://github.com/jbt/docker), a documentation generation
// library, that will convert the inline documentation in [Markdown
// format](http://daringfireball.net/projects/markdown/syntax) into
// HTML that can be used to display documentation alongside the source
// code. You will use this to document your projects.

// ## In Memory User Database
// We will use a simple array `users` to record user data.
// We could easily replace this with calls to a *database layer*
var userdb = [
  new User('Tim Berners-Lee' ,'tim',   'mit', 1, "aqua_manga@yahoo.com", "Massachusetts", "amazon.com", "", ["caleb","hazel"],["caleb","hazel"],[123,456] ),
  new User('Hazel Rozetta', 'hazel', 'lezah', 2, "ysasaki2014@gmail.com", "United States", "petco.com", "", ["tim","caleb"], ["tim", "caleb"], [324]),
  new User('Caleb Marks', 'caleb', 'belac', 3, "ysasaki@smith.edu", "Florida", "ebay.com", "", ["hazel","tim"], ["hazel","tim"], [234])
];
exports.userdb = userdb;

function User(name, username, password, uid, email, location, website, profileImage, follower, following, tweets) {
  this.name     = name;
  this.username = username;
  this.password = password;
  this.uid      = uid;
  this.email    = email; 
  this.location = location;
  this.website  = website;
  this.profileImage =  profileImage;
  this.follower = follower;
  this.following = following;
  this.tweets   = tweets;
}

//List of usernames that are pending verification codes
var codeUserList = [];
exports.codeUserList = codeUserList;

//Contains objects with username and matching code
var emailVerUsers = []
exports.emailVerUsers = emailVerUsers;
// ## Exported Functions

// ### *function*: addUser
/**
 * Adds a user to the "database". The `userData` is an object with
 * the following properties:
 *
 * - `fname` The user's first name
 * - `lname` The user's last name
 * - `pass` The user's password
 * - `sex` The user's gender (male|female)
 *
 * @param {object} userData The user data
 */
 //****
//Function to delete a user from the codeUserList
function delFromCodeList(username){
    for(var i = 0; i < codeUserList.length; i++){
        if(codeUserList[i] === username){
            delete codeUserList[i];
            codeUserList.splice(i,1);
            break;
        }
    }
}
exports.delFromCodeList = delFromCodeList; 
 //*****
//Function to get the user
function get_user(user) {
    var u = undefined;
    for (var i = 0; i < userdb.length; i++) {
        if (userdb[i].username === user) {
            u = userdb[i];
            break;
        }
    }
    return u;
}

exports.get_user = get_user;

//Function to lookup username and password for login/logout
exports.lookup = function(username, password, cb) {
  var len = userdb.length;
  console.log(cb);
  console.log(username);
  console.log(password);
  if ((username == '' || password == '')){
       cb('Enter both the username and password.');
  }else{
     for (var i = 0; i < len; i++) {
       var u = userdb[i];
       if (u.username === username) {
         if (u.password === password) {
            cb(undefined, u);
         }
         else {
            cb('Password is not correct.');
         }
         return;
       }
     }
     cb('User not found');
  }
};


function addUser(userData) {
    userData.date = new Date();
    userdb.push(userData);
    userdb.sort(function (u1, u2) {
	return u1.lname < u2.lname;
    });
}

// Export the `addUser` function.
exports.addUser = addUser;

// ### *function*: getUserInfo
/**
 * Gets the information for all users. This function expects a callback
 * to be received with the signature: `function (array)`, where the `array`
 * is a populated array of strings containing each user's information.
 * @param {array} list An empty list
 * @param {callback} callback function to receive the populated array
 */
function getUserInfo(list, callback) {
    var len = userdb.length;
    for (var i = 0; i < len; i++) {
	var u = userdb[i];
	list.push(u.fname + ' ' + u.lname);
    }
    callback(list);
}

// Export the `getUserInfo` function.
exports.getUserInfo = getUserInfo;

////////////

//function that checks to see if the username is already existant in the userlist
function checkUsername(username){
    var b = false;
    for (var i=0;i<userdb.length;i++){
        if(userdb[i].username==username || containsChar(username,' ')){
            //if a usrename is found that is already in the database
            b = true;
            break;
        }
    }
    for (var j=0;j<userdb.length;j++){
        if(codeUserList[j]==username){
            //if a username is found that is already in the pending verification list
            b = true;
            break;
        }
    }
    return b
    //returns boolean true or false depending on whether it exists
}
exports.checkUsername = checkUsername;

//function that checks if the email is valid
function checkEmail(email){
    var b = containsChar(email, '@')
    return !b;
  //returns boolean true false if the email is existant
}
exports.checkEmail = checkEmail;

//function that checks if the password is long enough
function checkPassword(password,retypeP){
    var b = false
    if(password != retypeP || password.length < 6){ b=true };
    return b;
}
exports.checkPassword = checkPassword

function containsChar(string, char){
   var b = false;
   for(var i=0; i<string.length; i++){
      var l = string.charAt(i);
      if(l == char){
         b = true;
      }
    }
    return b
}