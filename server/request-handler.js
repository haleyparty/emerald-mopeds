var bcrypt = require('bcrypt-nodejs');
var util = require('./utility');
var mongoose = require('mongoose');
var request = require('request');
var db = require('./db/database');
var Job = require('./db/models/job');
var Client = require('./db/models/client');
var request = require('request');
var User = require('./db/models/user');


exports.fetchClients = function (req, res) {
  Client.find({}).exec(function (err, clients) {
    res.send(200, clients);
  });
};

exports.addClient = function (req, res) {
  var newClient = new Client({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone
  });
  newClient.save(function (err, newClient) {
    if (err) {
      res.send(500, err);
      console.log('error adding/saving client');
    } else {
      console.log('added new client: ', newClient);
      res.send(200, newClient);
    }
  });
};

/*
fetchJobs is called when /jobs path receives get request
Finds all jobs in the database, replaces client_id with object that include client Id and name
Responds with result of query
*/
exports.fetchJobs = function (req, res) {
  Job.find({})
              .populate('client', 'name')
              .exec(function (err, jobs) {
                  res.send(200, jobs);
              });
};

exports.updateJob = function (req, res) {
  console.log('updateJob id is:', req.body);
  util.creatJobDoc(req, res, function (newJob) {
    // console.log('is this happening?')
    Job.findOneAndUpdate({_id: req.body.id}, newJob, function(err, job) {
      if(err) {
        console.log('error updating job');
      } else {
        console.log('updatedJob id is:', req.body.id);
        res.redirect('/jobs');
      }
    });
  });
};

exports.addJob = function (req, res) {
  //call createJobDoc first to find client id to use to create job document
  console.log('req body in addJob: ', req.body);
  //check if id already exists
  Job.findById(req.body._id, function (err, job) {
    if (err) {
      console.error("error");
    } else {
      util.createOrUpdateJob(req, res, job);
    }
  });
};

  // if (err) {
  //   console.log('got an error');
  // }
  //call createJobDoc first to find client id to use to create job document
  // util.createJobDoc(req, res, function(newJob){
  //   Job.findOneAndUpdate({description:}, update, options, function(err, person) {
  // if (err) {
  //   console.log('got an error');
  // }




  //   newJob.save(function (err, newJob) {
  //     if (err) {
  //       res.send(500, err);
  //     } else {
  //       res.redirect('/jobs');
  //     }
  //   });
  // });

/*
loginUser
*/

exports.loginUser = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var auth = "Basic " + new Buffer(email + ":" + password).toString("base64");
  var options = {
    url: 'https://www.toggl.com/api/v8/me',
    headers: {
      "Authorization": auth
    }
  };

  User.findOne({ email: email })
    .exec(function (err, user) {
      if (user === null) {
        res.redirect('/login');
      } else {
        request.get(options, function (err, resp, body) {
          if (err) {
            return console.error('get failed:', err);
          }
          console.log('Request successful!  Server responded with:', body);
          util.createSession(req, res, user);
        });
      }
  });
};

exports.signupUser = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var options = {
    headers: {'Content-Type': 'application/json'},
    url: 'https://www.toggl.com/api/v8/signups',
    body: '{"user":{"email":"'+email+'","password":"'+password+'"}}'
  };

  User.findOne({ email: email })
    .exec(function (err, user) {
      if (user === null) {
        request.post(options, function (err, resp, body) {
          if (err) {
            return console.error('upload failed:', err);
          }
          parsed = JSON.parse(body);
          console.log('Request successful!  Server responded with:', parsed);
          var newUser = new User({
            email: email,
            password: password,
            api_token: parsed.data.api_token
          });
          newUser.save(function (err, newUser) {
            if (err) {
              res.send(500, err);
            } else {
              console.log(newUser);
              util.createSession(req, res, newUser);
            }
          });
        });
      } else {
        console.log('Account already exists');
        res.redirect('/login');
      }
    });
};
