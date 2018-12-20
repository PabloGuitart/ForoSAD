var dm = require ('./dm.js');

// true if already exists
//COMPLETADO
exports.addUser = function (u,p, cb) {
	var exists = dm.addUser(u,p);
	cb (exists);
}

// Adds a new subject to subject list. Returns -1 if already exists, id on success
//COMPLETADO
exports.addSubject = function (s, cb) {
	var id = dm.addSubject (s);
	cb (id);
}

//COMPLETADO
exports.getSubjectList = function (cb) {
	var list = dm.getSubjectList ();
	cb (list);
}

//COMPLETADO
exports.getUserList = function (cb) {
	var list = dm.getUserList ();
	cb (list);
}

// Tests if credentials are valid, returns true on success
//COMPLETADO
exports.login = function (u, p, cb) {
	var ok = dm.login (u,p);
	cb (ok);
}
//COMPLETADO A MEDIAS YA QUE NO SE UTILIZA ESTA FUNCION EN EL FORO
exports.addPrivateMessage = function (msg, cb){
	dm.addPrivateMessage (msg);
	cb();
}

//NO SE IMPLEMENTA EN EL FORO
exports.getPrivateMessageList = function (u1, u2, cb) {
	var list = dm.getPrivateMessageList (u1,u2);
	cb (list);
}
//NO SE IMPLEMENTA EN EL FORO
function getSubject (sbj, cb) {
	var id = dm.getSubject (sbj);
	cb (id);
}

// adds a public message to storage
//COMPLETADO
exports.addPublicMessage = function (msg, cb)
{
	dm.addPublicMessage (msg);
	cb ();
}
//COMPLETADO
exports.getPublicMessageList = function (sbj, cb) {
	var list = dm.getPublicMessageList (sbj);
	cb (list);
}

