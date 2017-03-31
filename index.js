const TeleBot = require('telebot')
const bot = new TeleBot('378248798:AAHBZ_T7cYAmjsMRGXR-73HRCHpWZyv8A6w')
const fs = require('fs')
const readline = require('readline')
const google = require('googleapis')
const googleAuth = require('google-auth-library')
const dateFormat = require('dateformat')
const now = new Date()

// Initiate Google Sheet compatible date format
dateFormat.masks.hammerTime = 'm/d/yyyy'
var dateNow = dateFormat(now, 'hammerTime')
dateFormat.masks.hammerTime = 'h:M:s TT'
var hourNow = dateFormat(now, 'hammerTime')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/'
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  var clientSecret = credentials.installed.client_secret
  var clientId = credentials.installed.client_id
  var redirectUrl = credentials.installed.redirect_uris[0]
  var auth = new googleAuth()
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(oauth2Client)
    }
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken (oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close()
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
    })
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token))
  console.log('Token stored to ' + TOKEN_PATH)
}

// On command "start"
let startMessage = 'Selamat datang di Bot Telegram Nusanet. Bot ini akan membantu Anda mengatur aktifitas kerja Anda. Bot bekerja secara otomatis, Anda cukup mengirimkan beberapa perintah\n \nSebagai contoh, kirim /help untuk mencari tahu cara menggunakan bot ini.'
bot.on('/start', function (msg) {
  return bot.sendMessage(msg.chat.id, startMessage)
})

// On command "help"
let helpMessage = 'Pelajari bagaimana cara menggunakan Bot Telegram Nusanet. \nAnda bisa berinteraksi dengan mengirimkan beberapa perintah berikut :\n \n/help - tampilkan menu bantuan \n \nHuman Resources\n/hr in \n/hr break-out\n/hr break-in\n/hr out'
bot.on('/help', function (msg) {
  return bot.sendMessage(msg.chat.id, helpMessage)
})

// read row Number Accumulation and assign to variable
fs.readFile('rowNumberAccumulation.txt', function (err, data) {
  if (err) {
    return console.error(err)
  }
})
var rowNumberAccumulation = parseInt(fs.readFileSync('rowNumberAccumulation.txt').toString())

bot.on('/hr', msg => {
  let [cmdName, hrMenu] = msg.text.split(' ')
  let firstName = msg.from.first_name
  let lastName = msg.from.last_name
  let telegramId = msg.from.id

  if (hrMenu == 'in') {
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets (err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err)
        return
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
      authorize(JSON.parse(content), listMajors)
    })
    function listMajors (auth) {
      var sheets = google.sheets('v4')
      rowNumberAccumulation += 1
      fs.writeFile('rowNumberAccumulation.txt', rowNumberAccumulation, function (err) {
        if (err) {
          return console.error(err)
        }
      })
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1YPgGqd_QYxat0jwhIj5Ur6o9ZxLnpkH-NOxa22E3Dmw',
        range: 'Class Data!A' + rowNumberAccumulation + ':H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [ ['-', telegramId, firstName + ' ' + lastName, dateNow, hourNow, '-', '-', '-']]
        }
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err)
        } else {
          return bot.sendMessage(msg.from.id, `Selamat datang ${firstName}, semoga hari Anda menyenangkan.`)
        }
      })
    }// end
  } else if (hrMenu == 'out') {
      // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets (err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err)
        return
      }
          // Authorize a client with the loaded credentials, then call the
          // Google Sheets API.
      authorize(JSON.parse(content), listMajors)
    })
    function listMajors (auth) {
      var sheets = google.sheets('v4')
      rowNumberAccumulation += 1
      fs.writeFile('rowNumberAccumulation.txt', rowNumberAccumulation, function (err) {
        if (err) {
          return console.error(err)
        }
      })
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1YPgGqd_QYxat0jwhIj5Ur6o9ZxLnpkH-NOxa22E3Dmw',
        range: 'Class Data!A' + rowNumberAccumulation + ':H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [ ['-', telegramId, firstName + ' ' + lastName, dateNow, '-', '-', '-', hourNow]]
        }
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err)
        } else {
          return bot.sendMessage(msg.from.id, `Sampai jumpa ${firstName}, terimakasih atas kerja kerasnya hari ini.`)
        }
      })
    }// end
  } else if (hrMenu == 'break-out') {
      // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets (err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err)
        return
      }
          // Authorize a client with the loaded credentials, then call the
          // Google Sheets API.
      authorize(JSON.parse(content), listMajors)
    })
    function listMajors (auth) {
      var sheets = google.sheets('v4')
      rowNumberAccumulation += 1
      fs.writeFile('rowNumberAccumulation.txt', rowNumberAccumulation, function (err) {
        if (err) {
          return console.error(err)
        }
      })
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1YPgGqd_QYxat0jwhIj5Ur6o9ZxLnpkH-NOxa22E3Dmw',
        range: 'Class Data!A' + rowNumberAccumulation + ':H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [ ['-', telegramId, firstName + ' ' + lastName, dateNow, '-', hourNow, '-', '-']]
        }
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err)
        } else {
          return bot.sendMessage(msg.from.id, `Selamat istirahat ${firstName}`)
        }
      })
    }// end
  } else if (hrMenu == 'break-in') {
      // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets (err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err)
        return
      }
          // Authorize a client with the loaded credentials, then call the
          // Google Sheets API.
      authorize(JSON.parse(content), listMajors)
    })
    function listMajors (auth) {
      var sheets = google.sheets('v4')
      rowNumberAccumulation += 1
      fs.writeFile('rowNumberAccumulation.txt', rowNumberAccumulation, function (err) {
        if (err) {
          return console.error(err)
        }
      })
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1YPgGqd_QYxat0jwhIj5Ur6o9ZxLnpkH-NOxa22E3Dmw',
        range: 'Class Data!A' + rowNumberAccumulation + ':H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [ ['-', telegramId, firstName + ' ' + lastName, dateNow, '-', '-', hourNow, '-']]
        }
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err)
        } else {
          return bot.sendMessage(msg.from.id, `Selamat datang kembali ${firstName}, mari kita kembali bekerja`)
        }
      })
    }// end
  }
})

bot.connect()
