var mongoose = require('./mongoose.js');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: { type: String},
  password: { type: String},
  update_at: { type: Date},
  created_at: { type: Date}
});

// the schema is useless so far
// we need to create a model using it
var UserModel = mongoose.model('User', userSchema);

function saveUser (name,password,callback) {
  console.log('Debug saveUser -> name :'+name);
  var newUser = new UserModel({
    name: name,
    password: password,
    update_at  : new Date(),
    created_at: new Date()
  });
  newUser.save(function(err){
    if(err){
      console.log('Debug : User save fail!/n'+err);
      return callback(err);
    }
    console.log('Debug : User save success!');
      return callback(err,'success');
  });

};

/*
*Update name,password,authz
*json:{password : password, level : level ,autthz:authz }
*/
function updateUser (name,json,calllback) {

  json.update_at=new Date();

  if(name){
    UserModel.find({ name: name },function(err,users){
      if(err){
        console.log('Debug : updateUser find user by name =>'+err);
        return calllback(err);
      }
      if(users.length>0){
        var userId = users[0]._id;
        console.log('Debug : get User : ' + users);
        console.log('Debug : get User Id : ' +userId);
        UserModel.update({_id : userId},
          json,
          {safe : true, upsert : true},
          (err, rawResponse)=>{
            if (err) {
                      console.log('Debug : updateUser : '+ err);
                      return calllback(err);
            } else {
                      console.log('Debug : updateUser : success');
                return calllback(err,'success');
              }
            }
          );
      }else{
        console.log('Debug : update user can not find user!');
        return calllback('Can not find user!');
      }
    });
  }else{
    console.log('Debug : update user no referance');
        return calllback('Referance nul!');
  }
};


function removeUserByName (name,calllback) {
    UserModel.remove({name:name}, (err)=>{
      if (err) {
        console.log('Debug : User remove name :'+name+' occur a error:', err);
            return calllback(err);
      } else {
        console.log('Debug : User remove name :'+name+' success.');
            return calllback(err,'success');
      }
    });
};

/*Find all of users
*/
function findAllUsers (calllback) {
    UserModel.find((err, users) => {
      if (err) {
        console.log('Debug : findAllUsers err:', err);
            return calllback(err);
      } else {
            console.log('Debug : findAllUsers success\n:',users.length);
        return calllback(err,users);
      }
    });
};

function findUserByName (name,calllback) {
    UserModel.find({ name: name }, function(err,users){
      if(err){
        return callback(err);
      }
      if (users.length>0) {
        console.log('find '+users);
        return calllback(err,users[0]);
      }else{
        console.log('找不到資料!');
        return calllback(err,null);
      }
    });
};

module.exports = {
	saveUser,
	updateUser,
	removeUserByName,
	findAllUsers,
	findUserByName
}