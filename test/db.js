var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

var userSchema = new mongoose.Schema({
    name:        { type: String},
	  age:        { type: Number},
	//info:     { type: Schema.Types.Mixed}
});

mongoose.model('User', userSchema);

var UserModel = mongoose.model('User');


var mUser = 'marry';
var mAge = 20;

var userEntity = new UserModel({name:mUser,age:mAge});

console.log(userEntity.name);

UserModel.find(function(err,users){
	//查詢到的所有user
	if(err){
		console.log("查詢到所有user err!\n")
	}
	console.log("查詢到所有user");
	console.log(users+"\n");
});

/*userEntity.save(function(error){
	if(error){
		console.log('save fail!');
	}else{
		console.log('save success!');
		UserModel.find(function(err,users){
		  //查詢到的所有user
		  if(err){
			  console.log("查詢到所有user err!\n")
		  }
		  console.log("查詢到所有user");
		  console.log(users+"\n");
		});
	}
});*/


/*UserModel.find({ name: 'marry' }, function(err,users){
	if(err){
		console.log("查詢到所有user err!\n");
	}else{
		console.log(JSON.stringify(users));
		console.log(users+"\n");
	}
	var userID = users[0]._id;
	UserModel.update({_id : userID},
		{age: 35},
		{safe : true, upsert : true},
		(err, rawResponse)=>{
		    	if (err) {
		        console.log('Debug : update user : '+ err);

			} else {
		        console.log('Debug : update  user : success');
		    }
			UserModel.find(function(err,users){
			  //查詢到的所有user
			  if(err){
				  console.log("查詢到所有user err!\n")
			  }
			  console.log("查詢到所有user");
			  console.log(users+"\n");
			});
		}
	);
});*/

/*UserModel.remove({name:'wall'}, (err)=>{
  console.log('---remove Users ---------------------------------------');
  if (err) {
    console.log('Debug : User remove occur a error:', err);

  } else {
    console.log('Debug : User remove success.');
    UserModel.find(function(err,users){
	  //查詢到的所有user
	  if(err){
		  console.log("查詢到所有user err!\n");
	  }
	  console.log("查詢到所有user");
	  console.log(users+"\n");
	});
  }
});*/


