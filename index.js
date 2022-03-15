//Dependencies
const Base_64 = require("base-64")
const Request = require("request")
const Path = require("path")
const Os = require("os")
const Fs = require("fs")

//Variables
const Self_Args = process.argv.slice(2)

var Self = {
    homedir: Os.userInfo().homedir
}

//Functions
Self.get_name = async function(uuid){
    return new Promise((resolve, reject)=>{
        Request.get(`https://api.mojang.com/user/profiles/${uuid}/names`, function(err, res, body){
            if(err){
                console.log("It looks like Minecraft API is down, please try again later.")
                process.exit()
            }

            if(res.statusCode == 200){
                body = JSON.parse(body)

                resolve(body[0].name)
            }else{
                resolve(false)
            }
        })
    })
}

Self.get_token_data = function(){
    var result = Base_64.decode(`${Self_Args[0].split(".")[1]}=`)

    if(result.toString().indexOf("spr") === -1){
        return false
    }

    return JSON.parse(result)
}

Self.get_token_data = function(){
    var result = Base_64.decode(`${Self_Args[0].split(".")[1]}=`)

    if(result.toString().indexOf("spr") == -1){
        return false
    }

    return JSON.parse(result)
}

Self.inject_to_profile = function(profile){
    var launcher_profiles = Fs.readFileSync(`${Self.homedir}\\AppData\\Roaming\\.minecraft\\launcher_profiles.json`, "utf8")
    launcher_profiles = JSON.parse(launcher_profiles)

    launcher_profiles.authenticationDatabase[profile.uuid] = profile
    
    Fs.writeFileSync(`${Self.homedir}\\AppData\\Roaming\\.minecraft\\launcher_profiles.json`, JSON.stringify(launcher_profiles, null, 2), "utf8")
    console.log("Account successfully injected")
    process.exit()
}

Self.main = async function(){
    console.log("Checking if the token is valid & grabbing the token data.")
    const token_data = Self.get_token_data()

    if(!token_data){
        console.log("Invalid token.")
        process.exit()
    }
    console.log("Token valid.")

    console.log("Grabbing the account usernames.")

    const name = await Self.get_name(token_data.spr)

    if(!name){
        console.log("Unable to get the account username, something is wrong.")
        process.exit()
    }

    console.log("Account username successfully grabbed.")
    console.log("Injecting the account, please wait.")

    const profile = { "displayName": name, "userProperties": [], "accessToken": Self_Args[0], "userid": token_data.sub, "uuid": token_data.spr, "username": name }
    
    Self.inject_to_profile(profile)
}

//Main
if(!Self_Args.length){
    console.log("node index.js <token>")
    process.exit()
}

if(!Self_Args[0]){
    console.log("Invalid token.")
    process.exit()
}

console.log("Checking if you have Minecraft installed in your computer.")

if(Fs.existsSync(!Path.resolve(Self.homedir, "\\AppData\\Roaming\\.minecraft"))){
    console.log("Unable to find Minecraft installed in your computer.")
    process.exit()
}

Self.main()
