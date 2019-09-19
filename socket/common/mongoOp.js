module.exports = {
  GetUserByInvite: (invite, Cb) => {
    db.collection("userdetails")
      .find({ invitecode: invite })
      .toArray((err, DbResp) => {
        if (err) throw err;
        Cb(DbResp);
      });
  },
  GetUserById: (MemberId, Cb) => {
    // console.log("$$$$$$$$$$$$$$$$", MemberId);

    db.collection("userdetails")
      .find({ $or: MemberId })
      .toArray((err, DbResp) => {
        if (err) throw err;
        // console.log(DbResp);
        let FinalMemeberList = DbResp.map(Member_Info => {
          delete Member_Info._id;
          delete Member_Info.date;
          delete Member_Info.invitecode;
          return Member_Info;
        });
        // console.log(FinalMemeberList);
        Cb(FinalMemeberList);
      });
  },
  CheckUserExsists: (UserId, Cb) => {
    db.collection("userdetails")
      .find({ uid: UserId })
      .toArray((err, DbResp) => {
        // console.log(DbResp.length);

        if (DbResp.length == 1) {
          Cb(true);
        } else {
          Cb(false);
        }
      });
  },
  EmailExsists: (UserEmail, Cb) => {
    db.collection("userdetails")
      .find({ email: UserEmail })
      .toArray((err, DbResp) => {
        // console.log(DbResp.length);

        DbResp.length == 1 ? Cb(true) : Cb(false);
      });
  },
  BroadcastMemberList: (UserId, Cb) => {
    db.collection("groups")
      .find({
        members: { $in: [UserId] }
      })
      .project({ _id: 1, uid: 1, groupname: 1 })
      .toArray((err, temp) => {
        // console.log(DbResp);
        let uid = [];
        let group = [];
        DbResp = temp.map(elem => {
          if (uid.includes(elem.uid) == false) {
            uid.push(elem.uid);
            let tmp = {};
            tmp[elem.groupname] = elem._id;
            group.push(tmp);
            return {
              uid: elem.uid
            };
          }
        });

        db.collection("userdetails").distinct(
          "socket_id",
          { $or: DbResp },
          (err, DbResp) => {
            Cb(DbResp);
            // console.log(DbResp);
          }
        );
      });
  },
  SocketDisconnect: (Socket_id, Socket_Uid, Cb) => {
    // console.log("Socket Disconnected", Socket_id);
    // console.log(
    //   "%%%%%%%%%%%%%%%%%%%%%%%%%% trying to delete socket id  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
    // );
    console.log({ $and: [{ socket_id: Socket_id }, { uid: Socket_Uid }] });

    db.collection("userdetails").findOneAndUpdate(
      { $and: [{ socket_id: Socket_id }, { uid: Socket_Uid }] },
      { $set: { socket_id: "" } },
      (err, DbResp) => {
        if (err) throw err;
        // console.log(DbResp);
        Cb(DbResp);
      }
    );
  },
  SocketDisconnect_err: (Socket_id, Cb) => {
    // console.log("Socket Disconnected", Socket_id);
    // console.log(
    //   "%%%%%%%%%%%%%%%%%%%%%%%%%% trying to delete socket id  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
    // );
    // console.log({ socket_id: Socket_id });

    db.collection("userdetails").findOneAndUpdate(
      { socket_id: Socket_id },
      { $set: { socket_id: "" } },
      (err, DbResp) => {
        if (err) throw err;
        console.log(DbResp);
        Cb(DbResp);
      }
    );
  }
};
