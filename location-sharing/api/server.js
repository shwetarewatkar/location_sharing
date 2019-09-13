const { ObjectId } = require('mongodb');
var fs = require('fs');
var bcrypt = require('bcryptjs');

// Generate random number for invite code
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// Start Add 
exports.addLocation = function (req, res) {
    postdata = req.body;

    if (JSON.stringify(postdata) === '{}') {

        res.status(200).json({ status: false, message: 'Body data is required' });
        return;

    } else {

        x = postdata.keyword;

        switch (x) {

            // Registration api

            case 'registration':

                db.collection('userdetails').find({ "email": parseInt(postdata.email) }).toArray(function (err, getuser) {

                    if (getuser == "") {

                        var InRegistrationData = {
                            uid: postdata.uid,
                            email: postdata.email,
                            username: postdata.username,
                            latitude: postdata.latitude,
                            longitude: postdata.longitude,
                            invitecode: randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                            flage: postdata.flage,
                            socket_id: "",
                            date: new Date()
                        }

                        db.collection('userdetails').insertOne(InRegistrationData, function (err, result) {

                            if (err) {
                                res.status(200).json({ status: false, message: 'Error for Registration' });
                                return;
                            } else {

                                db.collection('userdetails').find({ _id: ObjectId(result.insertedId) }).toArray(function (err, alldata) {

                                    var ingroupdata = {
                                        uid: postdata.uid,
                                        groupname: "Default Group",
                                        default: true,
                                        members: [postdata.uid],
                                        date: new Date()
                                    }

                                    db.collection('groups').insertOne(ingroupdata, function (err, result) {
                                        if (err) {
                                            res.status(200).json({ status: false, message: 'Error for Created Group' });
                                            return;
                                        } else {
                                            res.status(200).json({ status: true, message: 'Registration succesfully', userdata: alldata });
                                            return;
                                        }

                                    });

                                });

                            }
                        });

                    } else {
                        res.status(200).json({ status: false, message: 'User allready exist!' });
                        return;
                    }

                });

                break;

            // login api ( When login with google at that time )

            case 'googlelogin':

                db.collection('userdetails').find({ "email": postdata.email }).toArray(function (err, getuser) {

                    if (getuser == "") {

                        var InRegistrationData = {
                            uid: postdata.uid,
                            email: postdata.email,
                            username: postdata.username,
                            latitude: postdata.latitude,
                            longitude: postdata.longitude,
                            invitecode: randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                            flage: postdata.flage,
                            socket_id: "",
                            date: new Date()
                        }

                        db.collection('userdetails').insertOne(InRegistrationData, function (err, result) {

                            if (err) {
                                res.status(200).json({ status: false, message: 'Error for Registration' });
                                return;
                            } else {

                                var locationdata = {
                                    uid: postdata.uid,
                                    latitude: postdata.latitude,
                                    longitude: postdata.longitude,
                                    cd: new Date()
                                }

                                db.collection('user_location').insertOne(locationdata, function (err, result) { });

                                db.collection('userdetails').find({ _id: ObjectId(result.insertedId) }).toArray(function (err, alldata) {

                                    var ingroupdata = {
                                        uid: postdata.uid,
                                        groupname: "Default Group",
                                        default: true,
                                        members: [postdata.uid],
                                        date: new Date()
                                    }

                                    db.collection('groups').insertOne(ingroupdata, function (err, result) {
                                        if (err) {
                                            res.status(200).json({ status: false, message: 'Error for Created Group' });
                                            return;
                                        } else {
                                            res.status(200).json({ status: true, message: 'Registration succesfully', userdata: alldata });
                                            return;
                                        }

                                    });

                                });

                            }
                        });

                    } else {

                        var locationdata = {
                            uid: postdata.uid,
                            latitude: postdata.latitude,
                            longitude: postdata.longitude,
                            cd: new Date()
                        }

                        db.collection('user_location').insertOne(locationdata, function (err, result) { });

                        res.status(200).json({ status: false, message: 'Login Successfully', userdata: getuser });
                        return;
                    }

                });

                break;

            default:

                res.status(200).json({ status: false, message: 'Something want to wrong' });
                return;

        }

    }
}
