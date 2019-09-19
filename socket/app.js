const MongoClient = require("mongodb").MongoClient;
const https = require("https");
const fs = require("fs");
require("dotenv").config();

/* ----------------- .env ---------------------*/
const port = process.env.ServerPort;
const DBport = process.env.DBport;
const DBhost = process.env.DBhost;
const DBname = process.env.DBname;
const DBuser = process.env.DBuser;
const DBpass = process.env.DBpass;
// const MongoUrl = `mongodb://${DBuser}:${DBpass}@${DBhost}:${DBport}/${DBname}`;
const MongoUrl= `mongodb+srv://${DBuser}:${DBpass}@cluster0-nmkja.mongodb.net/test?retryWrites=true&w=majority`
const AtlasClient= new MongoClient(MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
/* ----------------- .env Ends ---------------------*/

/* ---------------- Mongo Connection -------------------*/
AtlasClient.connect(
  // MongoUrl,
  // { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) throw err;
    db = module.exports = client.db(DBname);
  }
);
/* ---------------- Mongo Connection Ends -------------------*/

/* ---------------- Globals  -------------------*/
ObjectId = module.exports = require("mongodb").ObjectID;
UserLogin = module.exports = require("./class/UserLogin");
logger = module.exports = require("./class/log");
common = module.exports = require("./common/mongoOp");
/* ---------------- Globals Ends -------------------*/

/* ---------------- SSL Certificate Files  -------------------*/
let options = {
  // key: fs.readFileSync("./certificate/ca.pem", "utf8"),
  key: fs.readFileSync("/etc/letsencrypt/live/ls.shwetarewatkar.com/privkey.pem", "utf8"),
  cert: fs.readFileSync("/etc/letsencrypt/live/ls.shwetarewatkar.com/fullchain.pem", "utf8")
  // cert: fs.readFileSync("./certificate/ca.crt", "utf8")
};
/* ---------------- SSL Certificate Files Ends  -------------------*/

/* ---------------- Creating Https Server -------------------*/
let app = https.createServer(options, (req, res) => {
  console.log("started");

  if (req.url === "/") {
    res.end("Socket Running ");
  }
});
/* ---------------- Creating Https Server Ends -------------------*/

/* ---------------- Creating Socket Server  -------------------*/
io = module.exports = require("socket.io")(app, { origins: "*:*" });
/* ---------------- Creating Socket Server Ends  -------------------*/

/* ---------------- Handel Socket Events  -------------------*/

io.sockets.on("connection", socket => {
  console.log("user Connected");
  socket.on("req", data => {
    let event = data.event;
    let value = data.data;
    switch (event) {
      case "Auth":
        UserLogin.CheckUser(socket, value, status => {
          logger(status.user_status);

          socket.emit("res", {
            event: "Auth_Status",
            data: {
              user_status: status.user_status,
              user_details: status.user_info
            }
          });
        });
        break;
      case "GetGroupsList":
        logger(
          "======================= GetGroupsList ========================="
        );
        UserLogin.GetUserGroups(socket, GroupsData => {
          if (GroupsData.error == null) {
            logger(
              "+++++++++++++++++++++ Response Sent GetGroupsList +++++++++++++++++++++"
            );
            socket.emit("res", { event: "GroupList", data: GroupsData.groups });
          }
        });
        break;
      case "AddGroup":
        logger("======================= AddGroup =========================");
        UserLogin.AddGroup(socket, value, GroupsData => {});
        break;
      case "DeleteGroup":
        logger("======================= DeleteGroup =========================");
        UserLogin.RemoveGroup(socket, value, resp => {});
        break;
      case "AddMember":
        logger("======================= AddMember =========================");
        UserLogin.AddMember(socket, value, GroupsData => {
          if (GroupsData.error == null) {
            logger(
              "+++++++++++++++++++++ Response Sent AddMember +++++++++++++++++++++"
            );
            socket.emit("res", {
              event: "AddMemebrResp",
              data: { error: null }
            });
          } else {
            logger(
              "+++++++++++++++++++++ Response Sent Member Not Exists AddMember +++++++++++++++++++++"
            );
            socket.emit("res", {
              event: "AddMemebrResp",
              data: { error: GroupsData.error }
            });
          }
        });
        break;
      case "GetMemeberList":
        logger(
          "======================= GetMemeberList ========================="
        );
        // console.log("@@@@@@@@@@ ", value);
        UserLogin.GetGroupMembers(socket, value, GroupsMembers => {
          if (GroupsMembers) {
            logger(
              "+++++++++++++++++++++ Response Sent GetMemeberList +++++++++++++++++++++"
            );
            socket.emit("res", {
              event: "GroupMemberList",
              data: GroupsMembers
            });
          }
        });
        break;
      case "RemoveMember":
        logger(
          "======================= RemoveMember ========================="
        );
        UserLogin.RemoveMember(socket, value, RemoveInfo => {
          if (RemoveInfo) {
            logger("Member Removed From Group", RemoveInfo);
            UserLogin.GetGroupMembers(
              socket,
              { uid: RemoveInfo.uid, GroupId: RemoveInfo.GroupId },
              GroupsMembers => {
                if (GroupsMembers) {
                  logger("Member Removed From Group response sent");
                  logger(
                    "+++++++++++++++++++++ Response Sent RemoveMember +++++++++++++++++++++"
                  );
                  socket.emit("res", {
                    event: "GroupMemberList",
                    data: GroupsMembers
                  });
                }
              }
            );
          }
        });
        break;
      case "GetPeopleList":
        logger(
          "======================= GetPeopleList ========================="
        );
        UserLogin.GetPopleList(socket, value, PeopleList => {
          logger("user List", PeopleList);
          if (PeopleList) {
            logger("pople listResponse sent");
            logger(
              "+++++++++++++++++++++ Response Sent GetPeopleList +++++++++++++++++++++"
            );
            socket.emit("res", {
              event: "PeopleList",
              data: PeopleList
            });
          }
        });
        break;
      case "UpdateLocation":
        // console.log("inside the UpdateLocation case ", data);
        db.collection("user_location")
          .find({
            uid: value.uid.toString(),
            latitude: value.latitude,
            longitude: value.longitude
          })
          .toArray(function(e, checkExistance) {
            if (e)
              console.log("Error in find location query before insert ", e);
            else {
              console.log("\nUpdateLocation CheckUserExsists ---------");
              // ,checkExistance
              if (checkExistance.length == 0) {
                db.collection("user_location").insertOne(
                  {
                    uid: value.uid.toString(),
                    latitude: value.latitude,
                    longitude: value.longitude,
                    cd: new Date()
                  },
                  function(er, inserted) {
                    if (er)
                      console.log("UpdateLocation error in insertation ", er);
                    else {
                      if (inserted.ops[0]) {
                        console.log(
                          "UpdateLocation data is inserted successfully"
                        );
                      }
                    }
                  }
                );
              }
            }
          });

        break;
      case "userDetails":
        console.log("\ninside the case userDetails ");
        // , data
        if (data.data.uid) {
          console.log("uid is define ", data.data.uid);
          db.collection("user_location")
            .find({ uid: data.data.uid.toString() })
            .sort({ cd: -1 })
            .limit(10)
            .toArray(function(error, location_details) {
              if (error)
                console.log("user_location history   details error ", error);
              else {
                console.log("\nfound data ");
                // , location_details
                if (location_details.length > 0) {
                  socket.emit("res", {
                    event: "userDetails",
                    data: location_details
                  });
                }
              }
            });
        } else {
          console.log("uid is not define");
        }
        break;
      case "RemovePeople":
        logger(
          "======================= RemovePeople ========================="
        );
        UserLogin.RemovePeople(socket, value, PeopleList => {
          logger("user deleted");
          if (PeopleList) {
            // console.log();

            UserLogin.GetPopleList(socket, value, PeopleList => {
              logger("user List", PeopleList);
              if (PeopleList) {
                logger("pople listResponse sent");
                logger(
                  "+++++++++++++++++++++ Response Sent RemovePeople +++++++++++++++++++++"
                );
                socket.emit("res", {
                  event: "PeopleList",
                  data: PeopleList
                });
              }
            });
          }
        });
        break;
      case "DeleteAccount":
        logger(
          "======================= DeleteAccount ========================="
        );
        UserLogin.DeleteAccount(socket, value, Deleted => {
          if (Deleted) {
            logger("Account Deleted");
            logger(
              "+++++++++++++++++++++ Response Sent DeleteAccount +++++++++++++++++++++"
            );
            socket.emit("res", {
              event: "AccountDeleted",
              data: { action: "Account Deleted" }
            });
          }
        });
        break;
      case "AddToDefult":
        UserLogin.AddToDefault(socket, value, Added => {
          if (Added) {
            console.log(
              "*********************** response sent add to efault ****************************t"
            );
            console.log(Added);

            socket.emit("res", {
              event: "AddDefaultMemebrResp",
              data: Added
            });
          }
        });
        break;

      case "CheckUserByEmail":
        UserLogin.CheckUserByEmail(socket, value, Response => {
          socket.emit("res", {
            event: "EmailExsists",
            data: { Exists: Response }
          });
        });
        break;
      case "LogoutEvent":
        // console.log("user id", data);
        console.log("socket uid", value.uid);
        console.log("socket id", socket.id);

        // if (value.id == socket.id) {
        common.SocketDisconnect(socket.id, value.uid, data => {
          console.log("Socket Id Deleted");
          socket.disconnect();
          delete socket.uid;
        });
        // }
        break;
    }
  });

  socket.on("disconnect", res => {
    console.log("------------------------ reason -----------------------");
    // console.log(res);

    common.SocketDisconnect_err(socket.id, data => {
      console.log(`Scoket Id deleted due to ${res}`);
      delete socket.uid;
    });
  });
});

/* ---------------- Handel Socket Events Ends  -------------------*/

/* ---------------- Https Server Listen Port  -------------------*/
app.listen(port, err => {
  if (err) throw err;
  console.log(`Socket Running on ${port}`);
});
/* ---------------- Https Server Listen Port Ends -------------------*/
