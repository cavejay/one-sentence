## Unfortunately this project is no longer active

It might be revisited one day but if looking for something similar I would suggest you try [daylio](https://play.google.com/store/apps/details?id=net.daylio) on the Android appstore

---

[![Build Status](https://travis-ci.org/cavejay/one-sentence.svg?branch=server)](https://travis-ci.org/cavejay/one-sentence)
# one-sentence
A easy to use implementation for a '1 sentence diary' that uses telegram and node to store sentences in a mongoDB

### Installation

- Clone Repo
- Run setup.sh
- Provided setup.sh succeeded launch tg using tg.sh
- Sign in to telegram
- close telegram-cli
- Run node app.js

### Use

The application is currently running on the 1sentencediary telegram account. Feel free to check it out but unfortunately messages are not encrypted yet and you will have no way to recover the data kept in the database.

Both of these features are being planned and should be implemented relatively soon, Uni and life allowing.

####Current Features
- Pushes unencrypted diary entries through to a mongodb instance (mongoKey.js holds the URI)
- Simple commands are recognised.
  - &#60;help> provides a general overview of the app and lists other commands. When sent with another command ie '&#60;help> &#60;stats>' it gives specific information about the other command.
  - &#60;removeAllData>, &#60;generateview>, &#60;stats> and &#60;date> are all currently recognised but not implemented.
- When a command is recognised in a message the message is considered a query and thus isn't sent to the database as a diary entry.

####To-do Feature list/Ideas

- Recognition of new users with a welcome message and explanation.
- When recieving image upload to imgur and host link in db
- Webserver access for users to view diary w/browser
