// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();
const url = require('url');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// file upload functionality
var fileupload = require("express-fileupload");

// helps in managing user sessions
var session = require('express-session');

// include the mysql module
var mysql = require("mysql");

//include db_conn utility
var dbCon = require("./db_conn.js");

// helpful for reading, compiling, rendering pug templates
const pug = require("pug");  

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// A  library that can help read uploaded file for bonus.
// var formidable = require('formidable')


// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// apply file upload middleware
app.use(fileupload());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}
));

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));
app.use('/views', express.static(__dirname + '/views'));

// function to return the welcome page
app.get('/',function(req, res) {
  //res.sendFile(__dirname + '/client/welcome.html');
  res.render("welcome");
});

// function to return the login page
app.get('/login',function(req, res) {
  //res.sendFile(__dirname + '/client/login.html');
  res.render("login");
});

// Access Schedule page with GET method
app.get('/schedule',function(req, res) {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    //res.sendFile(__dirname + '/client/schedule.html');
    res.render("schedule");
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.render("login");
  }
});

// get's the schedule for a given day
app.get('/getSchedule', (req, res) => {
  console.log("in getSchedule");
  let day = req.query.day;
  console.log('query.day: ', day);
  var evt_qry = "select event_id as id, event_event as name, event_start as start, event_end as end, event_location as location," + 
                " event_phone as phone, event_info as info, event_url as url from tbl_events where event_day = '" + day + "'";
  dbCon.get().query(evt_qry, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
  });
});

// Access addEvent page with GET method
app.get('/addEvent',function(req, res) {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    //res.sendFile(__dirname + '/client/addEvent.html');
    res.render("addEvent");
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.render("login");
  }
});

// Handles deleteEvent with GET method
app.get('/deleteEvent/:id', (req, res) => {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  let rowID = req.params.id;
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    console.log('deleting row with id: ', rowID);
    var delete_evt_sql = "DELETE FROM tbl_events WHERE event_id = " + rowID;
    dbCon.get().query(delete_evt_sql, function (err, rows) {
      if (err) {
        res.sendStatus(404);
        throw err;
      } else {
        console.log("Successfully deleted 1 event");
        res.sendStatus(200);
      }
    });
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.render("login");
  }
});


// Handles editEvent with GET method
app.get('/editEvent/:id', (req, res) => {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    let rowID = req.params.id;
    console.log('editing event with row id: ', rowID);
    var evt_qry = "SELECT event_id as id, event_day as day, event_event as name, event_start as start, event_end as end, event_location as location," + 
                  " event_phone as phone, event_info as info, event_url as url FROM tbl_events WHERE event_id = " + rowID;
    dbCon.get().query(evt_qry, function(err, rows) {
      if (err) {
        res.sendStatus(404);
        throw err;
      } else {
        console.log('Event found!');
        console.log(rows);
        eventToEdit = {
          id: rows[0].id,
          day: rows[0].day,
          name: rows[0].name,
          start: rows[0].start,
          end: rows[0].end,
          location: rows[0].location,
          phone: rows[0].phone,
          info: rows[0].info,
          url: rows[0].url
        }
        res.render("updateEvent", eventToEdit);
      }
    });
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.redirect(302, '/schedule');
  }
});

// POST method to handle event update
app.post('/postEventUpdate/:id', (req, res) => {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    let rowID = req.params.id;
    console.log('updating event with row id: ', rowID);
    var update_evt_sql = "UPDATE tbl_events set event_day = '" + req.body.day + "', event_event = '" + req.body.event + "', " +
                        "event_start = '" + req.body.start + "', event_end = '" + req.body.end + "', event_location = '" + req.body.location + "', " +
                        "event_phone = '" + req.body.phone + "', event_info = '" + req.body.info + "', event_url = '" + req.body.url + "'" +
                        " WHERE event_id = " + rowID;
    console.log(update_evt_sql);
    dbCon.get().query(update_evt_sql, function(err, rows) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        console.log('Row ' + rowID + ' updated!');
        res.redirect(302, '/schedule');
      }
    });
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.redirect(302,'/login');
  }
});

// POST method to handle create a new event
// then add to the schedule
app.post('/postEventEntry', (req, res) => {
  createNewEvent(req.body);
  //redirect to schedule page
  //res.sendFile(__dirname + '/client/schedule.html');
  res.render("schedule");
});

function createNewEvent(body) {
  let dayOfWeek = body.day.toLowerCase();
  console.log('day of week: ', dayOfWeek);
  var create_evt_sql = "INSERT INTO tbl_events (event_day, event_event, event_start, event_end, event_location, event_phone, event_info, event_url)" + 
  "VALUES ( '" + dayOfWeek + "', '" + body.event + "', '" + body.start + "', '" + body.end + "', '" + body.location + "', '" + body.phone + "', '" +
   body.info + "', '" + body.url + "')";
  console.log(create_evt_sql);
  dbCon.get().query(create_evt_sql, function (err, rows) {
    if (err) throw err;
    console.log("Successfully created 1 event");
  });
}

//quick setup
app.post('/quickSetup', (req, res) => {
  // When a file has been uploaded
  if (req.files && Object.keys(req.files).length !== 0) {
    // Uploaded path
    const uploadedFile = req.files.uploadFile;
    // Logging uploading file
    console.log(uploadedFile.name);
    var fileName = uploadedFile.name;
    //reading the uploaded file
    var data = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
    console.log(data);
    var jsonObjs = JSON.parse(data);
    for (var day in jsonObjs) {
      if (jsonObjs.hasOwnProperty(day)) {
        console.log(day);
        var eventsOfDay = jsonObjs[day];
        console.log('number of events', eventsOfDay.length);
        if (eventsOfDay.length !== 0) {
          for (let i = 0;i < eventsOfDay.length;i++){
            /*
            console.log(eventsOfDay[i].name);
            console.log(eventsOfDay[i].start);
            console.log(eventsOfDay[i].end);
            console.log(eventsOfDay[i].location);
            console.log(eventsOfDay[i].phone);
            console.log(eventsOfDay[i].info);
            console.log(eventsOfDay[i].url);
            */
            createEvent(day, eventsOfDay[i]);
          }
        }
      }
    }
  }
  //redirect to schedule page
  //res.sendFile(__dirname + '/client/schedule.html');
  res.redirect('/schedule');
});

function createEvent(day, eventObj) {
  var create_evt_sql = "INSERT INTO tbl_events (event_day, event_event, event_start, event_end, event_location, event_phone, event_info, event_url)" + 
  "VALUES ( '" + day + "', '" + eventObj.name + "', '" + eventObj.start + "', '" + eventObj.end + "', '" + eventObj.location + "', '" + eventObj.phone + "', '" +
  eventObj.info + "', '" + eventObj.url + "')";
  //console.log(create_evt_sql);
  dbCon.get().query(create_evt_sql, function (err, rows) {
    if (err) throw err;
    console.log("Successfully created 1 event");
  });
}

// login form POST to validate user login
// creates user session after successful login
app.post('/processLogin', (req, res) => {
  var acct_qry = "select acc_password from tbl_accounts where acc_login='" + req.body.username + "'";
  dbCon.get().query(acct_qry, function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    const hashedPasswd = rows[0]['acc_password'];
    console.log('hashedPasswd: ' + hashedPasswd);
    if (bcrypt.compareSync(req.body.password, hashedPasswd)) {
      console.log('password matches!');
      req.session.views = 1;
      //res.sendFile(__dirname + '/client/schedule.html');
      res.render("schedule");
    } else {
      console.log('Login failure! Please check your credentials and try again...');
      //res.sendFile(__dirname + '/client/loginFailure.html');
      res.render("loginFailure");
    }
  });
});

// function to return create account page
app.get('/createAccount', (req, res) => {
  let sess_views = req.session.views;
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    res.redirect('/schedule');
  } else {
    //res.sendFile(__dirname + '/client/createAccount.html');
    res.render("createAccount");
  }
});

// create accout form POST to creates a new account
// logs in the user and redirect to schedule page
app.post('/processNewAccount', (req, res) => {
  var username = req.body.useremail;
  var user_exist_qry = "SELECT COUNT(*) AS user_count FROM tbl_accounts WHERE acc_login='" + username + "'";
  dbCon.get().query(user_exist_qry, function(err, rows) {
    if (err) throw err;
    console.log(rows);
    let user_count = rows[0].user_count;
    if (user_count > 0) {
      console.log('FAILED: User with same account: ' + username + " already exist!");
      //res.sendFile(__dirname + '/client/createAccountFailure.html');
      res.render("createAccountFailure");
    } else {
      //create a new account here
      const saltRounds = 10;
      var passwordPlaintext = req.body.password;
      var passwordHash = bcrypt.hashSync(passwordPlaintext, saltRounds);
      var create_acct_qry = "INSERT INTO tbl_accounts(acc_name, acc_login, acc_password)" + 
      "VALUES('" + username + "', '" + username + "', '" + passwordHash + "')";
      console.log(create_acct_qry);
      console.log("Attempting to create a new account!");
      dbCon.get().query(create_acct_qry, function(err, rows) {
        if (err) {
          //res.sendFile(__dirname + '/client/createAccountFailure.html');
          res.render("createAccountFailure");
          throw err;
        }
        console.log('New account: ' + username + ", created!");
        //login the user and redirect to schedule page
        req.session.views = 1;        
        console.log('User: ' + username + ", logged in!");
        res.redirect('/schedule');
      });
    }
  });
})


//stock page
app.get('/stock', (req, res) => {
  let sess_views = req.session.views;
  console.log('session views: %d', sess_views);
  if (sess_views > 0) {
    console.log('You are logged in!');
    req.session.views += 1;
    //res.sendFile(__dirname + '/client/stock.html');
    res.render("stock");
  } else {
    console.log('You are NOT logged in!');
    //res.sendFile(__dirname + '/client/login.html');
    res.redirect("/login");
  }
});

//logout functionality
app.get('/logout', (req, res) => {
  console.log('processing logout');
  req.session.destroy();
  console.log('you are logged out!');
  res.redirect('/login');
});

// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});