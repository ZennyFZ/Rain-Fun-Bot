const SteamUser = require('steam-user')
      SteamTotp = require('steam-totp')
      SteamCommunity = require('steamcommunity')
      SteamStore = require('steamstore')
      SteamID = require('steamid')
      fs = require('fs')
      Axios = require('axios')
      Child_Process = require('child_process');
      BotConfig = require('./Setting/config.js')
      UserDataPath = './Setting/UserData.json'
      Bot = new SteamUser()
      Community = new SteamCommunity()
      Store = new SteamStore()
      AccountDetails = {
        accountName: BotConfig.AccountName,
        password: BotConfig.Password,
        twoFactorCode: SteamTotp.generateAuthCode(BotConfig.SharedSecret),
        rememberPassword: BotConfig.rememberPassword,
        machineName: BotConfig.machineName
      }

var userData = JSON.parse(fs.readFileSync(UserDataPath, 'utf8'))

if (BotConfig.AccountName && BotConfig.Password && BotConfig.SharedSecret) {
  Bot.setOption("promptSteamGuardCode", false)
  Bot.logOn(AccountDetails)
} else {
  console.log('Failed to login, please check your botconfig.js again');
}

Bot.on('loggedOn', () => {
  Bot.setPersona(BotConfig.Status)
  Bot.setUIMode(BotConfig.ui)
  console.log('Rain is online')
  //Bot.gamesPlayed('Link Start!!')
});

Bot.on("error", function (e) {
    console.log(e);
    process.exit(1);
});

Bot.on("steamGuard", function(domain, callback, lastCodeWrong) {
	if(lastCodeWrong) {
		console.log("Last code wrong, try again!");
	}
  setTimeout(function() {
    callback(SteamTotp.generateAuthCode(BotConfig.SharedSecret));
  }, 30000)
})

Bot.on('friendRelationship', (steamID, relationship) => {
    if (BotConfig.AutoAcceptFriend == 'True') {
      if (relationship == 2) {
        Bot.addFriend(steamID);
        Bot.chatMessage(steamID, BotConfig.Welcome);
    }
  }
})

Bot.on('webSession', (sessionid, cookies) => {
Community.setCookies(cookies)
if (BotConfig.AutoAcceptFriend == 'True') {
  for (let i = 0; i < Object.keys(Bot.myFriends).length; i++) {
      if (Bot.myFriends[Object.keys(Bot.myFriends)[i]] == 2) {
          Bot.addFriend(Object.keys(Bot.myFriends)[i]);
      }
  }
}
Store.setCookies(cookies)
})

Bot.on('friendMessage', function(steamID, message) {

  Bot.getPersonas([steamID], function(err, personas) {
    if (err) {console.log('error')}
    else {
      persona = personas[steamID.getSteamID64()];
      name = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
    }

  Respond = ['thanks for donation :D','aww.. thanks <3','i am appreciated, thanks >.<','1..2..3 Activated. Thanks!','Thanks good person >.O','se~no activated. love it :3']
  RandomRespond = Respond[Math.floor((Math.random()*Respond.length))]

  if (message.toLowerCase().startsWith('!help')) {
    if (steamID == BotConfig.AdminID) {
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, BotConfig.CommandAdmin);
  } else {
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, BotConfig.Command);
  }
}

  if (message.toLowerCase().startsWith('!owner')) {
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, BotConfig.Owner);
  }

  if (message.toLowerCase().startsWith('!redeemkey')) {
    Key = message.replace('!redeemkey', '')
    Bot.redeemKey(Key, (err) => {
      if (err) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'unable to active key :(');
      } else {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, RandomRespond)
      }
    })
  }

  if (message.toLowerCase().startsWith('!addlicense')) {
    License = message.replace('!addlicense ', '')
    Store.addFreeLicense(License, (err) => {
      if (err) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'invalid subid :(');
      } else {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, RandomRespond)
      }
    })
  }

  if (message.toLowerCase().startsWith('!redeemwallet')) {
    Wallet = message.replace('!redeemwallet', '')
    Store.redeemWalletCode(Wallet, (err, amount) => {
      if (err) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'unable to add wallet code, try again or invalid wallet code :(')
      } else {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, RandomRespond)
        Bot.chatMessage(BotConfig.AdminID, name + 'donated you ' + amount + ' wallet code')
      }
    })
  }

  function CommentError() {
    Bot.chatTyping(steamID)
    console.log(err)
    Bot.chatMessage(steamID, 'bot reach steam comment limit >.<')
  }

  if (message.toLowerCase().startsWith('!comment')) {
    Comment = message.replace('!comment', '')
    if (Comment.length === 0) {
      Bot.chatTyping(steamID)
      Bot.chatMessage(steamID, 'hey you didnt fill anything, i am a joke to you ? >.<')
    } else {
    Bot.chatTyping(steamID)
    Community.postUserComment(steamID, Comment, (err) => {
      if (err) {
        return CommentError()
      }
      else {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'commented on your profile ! >.O')
      }
    })
  }
}

 function cmt6x6Count() {
   fs.writeFile(UserDataPath, JSON.stringify(userData), (err) => {
     if (err) console.error(err)
   })
 }

  function x6() {
    var mcmt = ''
    var i = 0
    while (i < 7) {
      setTimeout(function(){
        mcmt += Community.postUserComment(steamID, Comments, (err) => {
          if (err) {
            console.log(err)
            return CommentError()
          }
        })
      }, BotConfig.x6CommentDelay)
      i++
      if (i == 6) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'commented on your profile ! >.O')
        userData[steamID].MessageCount++
        return cmt6x6Count()
        break;
      }
    }
  }

   function x6CoolDown() {
     Bot.chatTyping(steamID)
     Bot.chatMessage(steamID, 'you need to wait atleast 2 minute to use another !cmt6x6 \n i will send a message to let you know when you can use it again ^^)')
     setTimeout(function() {
       Bot.chatTyping(steamID)
       Bot.chatMessage(steamID, 'cooldown is reset. feel free to use !cmt6x6 again ^^')
       userData[steamID].MessageCount = 0
       return cmt6x6Count()
     }, BotConfig.x6TimeLimit)
   }

   if (message.toLowerCase().startsWith('!cmt6x6')) {
     Comments = message.replace('!cmt6x6 ','')
     if (Comments.toLowerCase().startsWith('!cmt6x6')) {
       Bot.chatTyping(steamID)
       Bot.chatMessage(steamID, 'invalid command. Example: !cmt6x6 test >.<')
     } else {
       if (!userData[steamID]) userData[steamID] = {
         MessageCount: 0
       }
       if (userData[steamID].MessageCount >= 1) {
         return x6CoolDown()
       }
       if (userData[steamID].MessageCount === 0) {
         Bot.chatTyping(steamID)
         Bot.chatMessage(steamID, `Progressing.... it's very slow command so please don't use another cmt6x6 until it's finished`)
         setTimeout(function() {
           return x6()
         },5000)
       }
     }
   }

  if (message.toLowerCase().startsWith('!chat')) {
    umessage = message.replace('!chat', '')
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID,'forward message to owner successfully')
    Bot.chatMessage(BotConfig.AdminID, name + ' (' + steamID + ')' + ': ' + umessage)
  }

  if (steamID == BotConfig.AdminID) {
    if (message.toLowerCase().startsWith('!send')) {
      msgp1 = message.slice(0,5).trim()
      msgp2 = message.replace('!send', '')
      msgp3 = msgp2.slice(0,17).trim()
      msgp4 = msgp2.slice(17)
      msgmerge = msgp1 + msgp3 + msgp4
      sid = msgmerge.slice(5,22)
      msg = msgmerge.slice(22)
      steamID = sid
      Bot.chatTyping(steamID)
      Bot.chatMessage(steamID, 'Owner: ' + msg)
      Bot.chatMessage(BotConfig.AdminID, 'Done!!!')
      /* console.log(msgmerge + '\n' + sid + '\n' + msg) */
    }
    if (message.toLowerCase().startsWith('!block')) {
      Id = message.replace('!block', '')
      Id2 = Id.trim()
      if (Id2 == BotConfig.AdminID) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'can not block you master :<')
      } else {
        steamID = new SteamID(`${Id2}`)
        Bot.getPersonas([steamID], function(err, personas) {
          if (err) {
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `oh no failed to block. we must do something ._.`)
          }
          else {
            persona = personas[steamID.getSteamID64()];
            uname = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
            Bot.blockUser(Id)
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `Blocked ${uname} (${Id2})`)
          }
        })
      }
    }
    if (message.toLowerCase().startsWith('!unblock')) {
      Id = message.replace('!unblock', '')
      Id2 = Id.trim()
      if (Id2 == BotConfig.AdminID) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'i did not block you master. i swear :<')
      } else {
        steamID = new SteamID(`${Id2}`)
        Bot.getPersonas([steamID], function(err, personas) {
          if (err) {
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `can't unblock. try again pls D:`)
          }
          else {
            persona = personas[steamID.getSteamID64()];
            uname = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
            Bot.unblockUser(Id)
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `Unblocked ${uname} (${Id2})`)
          }
        })
      }
    }
    if (message.toLowerCase().startsWith('!remove')) {
      Id = message.replace('!remove', '')
      Id2 = Id.trim()
      if (Id2 == BotConfig.AdminID) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, `>.< i can't do that master`)
      } else {
        steamID = new SteamID(`${Id2}`)
        Bot.getPersonas([steamID], function(err, personas) {
          if (err) {
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `aww man failed to remove .-.`)
          }
          else {
            persona = personas[steamID.getSteamID64()];
            uname = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
            Bot.removeFriend(Id)
            Bot.chatTyping(BotConfig.AdminID)
            Bot.chatMessage(BotConfig.AdminID, `Removed ${uname} (${Id2}) from friendlist`)
          }
        })
      }
    }
    if (message.toLowerCase().startsWith('!restart')) {
      Child_Process.exec("start " + BotConfig.RestartPath + "start " + BotConfig.StartBatch)
      setTimeout(function(){
        process.exit(1)
      }, 5000)
    }
    if (message.toLowerCase().startsWith('!acomment')) {
      msgp1 = message.slice(0,9).trim()
      msgp2 = message.replace('!acomment', '')
      msgp3 = msgp2.slice(0,17).trim()
      msgp4 = msgp2.slice(17)
      msgmerge = msgp1 + msgp3 + msgp4
      sid = msgmerge.slice(9,26)
      msg = msgmerge.slice(26)
      steamID = sid
      Community.postUserComment(steamID, msg, (err) => {
        if (err) {
          return CommentError()
        }
        else {
          steamID = new SteamID(steamID)
          Bot.getPersonas([steamID], function(err, personas) {
            if (err) {
              Bot.chatTyping(BotConfig.AdminID)
              Bot.chatMessage(BotConfig.AdminID, `failed to comment ><`)
            }
            else {
              persona = personas[steamID.getSteamID64()];
              uname = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
              Bot.chatTyping(BotConfig.AdminID)
              Bot.chatMessage(BotConfig.AdminID, `commented on ${uname}'s profile ! >.O`)
            }
          })
        }
      })
    }
} else if (steamID !== BotConfig.AdminID &&
    message.toLowerCase().startsWith('!send') ||
    message.toLowerCase().startsWith('!block') ||
    message.toLowerCase().startsWith('!unblock') ||
    message.toLowerCase().startsWith('!acomment') ||
    message.toLowerCase().startsWith('!remove') ||
    message.toLowerCase().startsWith('!restart'))
    {
      Bot.chatTyping(steamID)
      Bot.chatMessage(steamID, 'you dont have permission to use this command >.<')
    }

  async function NekoImage() {
  ImageUrl = await Axios.get('http://nekos.life/api/v2/img/neko')
  data = ImageUrl.data
  data2 = JSON.stringify(data)
  datap1 = data2.slice(8)
  datap2 = datap1.search('"')
  data3 = datap1.slice(0,datap2)
  Bot.chatMessage(steamID, data3)
}

 if (message.toLowerCase().startsWith('!neko')) {
   return NekoImage()
 }

 if (message.toLowerCase().startsWith('!hentai')) {
   Bot.chatMessage(steamID, 'Baka! Pervert! Reported and Logged your message as a proof (^=˃ᆺ˂)!..... haha just kidding, pls forgive o(=´∇｀=)o.')
 }

else {
  Er = BotConfig.CommandError
  ErrorRespond = Er[Math.floor((Math.random()*Er.length))]
  if  (!message.toLowerCase().startsWith('!chat') &&
      (!message.toLowerCase().startsWith('!cmt6x6')) &&
      (!message.toLowerCase().startsWith('!comment')) &&
      (!message.toLowerCase().startsWith('!neko')) &&
      (!message.toLowerCase().startsWith('!hentai')) &&
      (!message.toLowerCase().startsWith('!help')) &&
      (!message.toLowerCase().startsWith('!addlicense')) &&
      (!message.toLowerCase().startsWith('!chat')) &&
      (!message.toLowerCase().startsWith('!redeemkey')) &&
      (!message.toLowerCase().startsWith('!send')) &&
      (!message.toLowerCase().startsWith('!block')) &&
      (!message.toLowerCase().startsWith('!unblock')) &&
      (!message.toLowerCase().startsWith('!acomment')) &&
      (!message.toLowerCase().startsWith('!remove')) &&
      (!message.toLowerCase().startsWith('!restart')) &&
      (!message.toLowerCase().startsWith('!redeemwallet'))) {
  Bot.chatMessage(steamID, ErrorRespond)
}}
})})
