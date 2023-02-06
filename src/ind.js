const fast2sms = require('fast-two-sms')
const YOUR_API_KEY='f2aSYIwcoHCDjyeZrp4F1kvBT8EhAXmzUJRWLN5l0sxg67t9QKilG9KHdMhFk8QLvXVZmrwcWUPTya1O';
var options = {authorization : YOUR_API_KEY , message : 'deepu' ,  numbers : ['8433355000']} 
fast2sms.sendMessage(options)