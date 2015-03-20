var express = require('express');
var app = express();
var io=require('socket.io').listen(app.listen(8080));
/*
app.set('views',__dirname+'/tpl');
app.set('view engine','jade');
app.engine('jade',require('jade').__express);
app.use(express.static(__dirname + '/public'));
*/

app.get('/',function(req,res){
	//res.render('page');
	res.sendfile(__dirname+'/index.html');
});
var users = {};
function getUsers(obj){
	var tmp=[];
	for(var i in obj)tmp.push(obj[i]);
	return tmp.join(', ');
}
io.sockets.on('connection',function(client){
	//client.emit('message',{message:'Welcome to chat!'});
	client.on('send',function(data){
		io.sockets.emit('message',{message:data.message});
	});
	client.on('hello',function(data){
		client.set('nickname',data.name);
		client.emit('message',{message:'---Welcome to chat, '+data.name+'!---'});
		client.broadcast.emit('message',{message:'--- '+data.name+' connected to chat ---'});
		
		if(Object.keys(users).length > 0){
			var userList = getUsers(users);
			client.emit('message',{message:'---Already in chat: '+userList+'!---'});
		
		}else{
			client.emit('message',{message:'--- Thera are nobody in the chat: !---'});
		
		}
		users[client.id] = data.name;
	});
	client.on('disconnect',function(){
		if (Object.keys(users).length > 1){
			client.get('nickname',function(err,name){
				client.broadcast.emit('message',{message:'--- '+name+' comes out ---'});
			});
		}
		delete users[client.id];
	});
});