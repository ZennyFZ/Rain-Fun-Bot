const SteamUser = require('steam-user')
      SteamTotp = require('steam-totp')
      SteamCommunity = require('steamcommunity')
      SteamStore = require('steamstore')
      Axios = require('axios')
      BotConfig = require('./config.js')
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

if (BotConfig.AccountName && BotConfig.Password && BotConfig.SharedSecret) {
Bot.logOn(AccountDetails);
} else {
  console.log(' Failed to login, please check your botconfig.js again');
}


Bot.on('loggedOn', () => {
  Bot.setPersona(BotConfig.Status)
  Bot.setUIMode(BotConfig.ui)
  console.log('Successfully to login')
  Bot.gamesPlayed('Link Start!!')
});

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
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, BotConfig.Command);
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
        Bot.chatMessage('76561198349964534', name + 'donated you ' + amount + ' wallet code')
      }
    })
  }

  function CommentError() {
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, 'unable to comment on your profile, bot is overload or bot reach steam comment limit')
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

  function x6() {
    var mcmt = ''
    var i = 0
    while (i < 7) {
      mcmt += Community.postUserComment(steamID, Comments, (err) => {
        if (err) {
          return CommentError()
        }
      })
      i++
      if (i == 6) {
        Bot.chatTyping(steamID)
        Bot.chatMessage(steamID, 'commented on your profile ! >.O')
        break;
      }
    }
  }

  if (message.toLowerCase().startsWith('!cmt6x6')) {
    Comments = message.replace('!cmt6x6 ','')
    if (Comments.toLowerCase().startsWith('!cmt6x6')) {
      Bot.chatTyping(steamID)
      Bot.chatMessage(steamID, 'invalid command. Example: !cmt6x6 test >.<')
    } else {
    return x6()
  }
}

  if (message.toLowerCase().startsWith('!chat')) {
    umessage = message.replace('!chat', '')
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID,'forward message to owner successfully')
    Bot.chatMessage('76561198349964534', name + ' (' + steamID + ')' + ': ' + umessage)
  }

  if (message.toLowerCase().startsWith('!send')) {
    if (steamID == '76561198349964534') {
    // Example: !send ID: '76561198349964534' message: "abc"

    //parse ID
    idp1 = message.slice(11)
    idp2 = idp1.search(' message:')
    id = idp1.slice(0,idp2-1)
    steamID = id

    //parse message
    messagep1 = message.search(' "')
    messagep1v5 = message.slice(messagep1+2)
    messagep1v6 = messagep1v5.search('"')
    messagep2 = messagep1v5.slice(0,messagep1v6)

    //send message
    Bot.chatMessage(steamID, messagep2)
    Bot.chatTyping('76561198349964534')
    Bot.chatMessage('76561198349964534', 'send message to that ID successfully')
  }
  else {
    Bot.chatTyping(steamID)
    Bot.chatMessage(steamID, 'you dont have permission to use this command >.<')
  }
}

  async function NekoImage() {
  res = await Axios.get('http://nekos.life/api/v2/img/neko')
  data = res.data
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
  if ((!message.toLowerCase().startsWith('!chat')) &&
      (!message.toLowerCase().startsWith('!cmt6x6')) &&
      (!message.toLowerCase().startsWith('!comment')) &&
      (!message.toLowerCase().startsWith('!neko')) &&
      (!message.toLowerCase().startsWith('!hentai')) &&
      (!message.toLowerCase().startsWith('!help')) &&
      (!message.toLowerCase().startsWith('!addlicense')) &&
      (!message.toLowerCase().startsWith('!chat')) &&
      (!message.toLowerCase().startsWith('!redeemkey')) &&
      (!message.toLowerCase().startsWith('!redeemwallet'))) {
  Bot.chatMessage(steamID, ErrorRespond)
}}
})})
