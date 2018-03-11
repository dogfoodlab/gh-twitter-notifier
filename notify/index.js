'use strict'

require('dotenv').config()

const Twitter = require('twitter')
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const googlehome = require('google-home-notifier')
googlehome.device('Google-Home', process.env.GOOGLE_HOME_LANGUAGE)
googlehome.ip(process.env.GOOGLE_HOME_IP)

let last = 0

Promise.resolve().then(function loop () {
  return Promise.resolve()
    .then(search())
    .then(wait(process.env.SEARCH_INTERVAL))
    .then(loop)
})

function search () {
  return () => {
    return new Promise((resolve, reject) => {
      console.log('search start')
      let sequence = Promise.resolve()
      client.get(
      // 'statuses/home_timeline',
        'search/tweets',
        {
          q: process.env.SEARCH_QUERY,
          result_type: 'recent',
          tweet_mode: 'extended',
          count: process.env.TWEET_COUNT,
          since_id: last
        },
        (error, tweet, response) => {
          if (!error) {
            tweet.statuses.reverse().forEach((el, index, array) => {
              last = el.id

              console.log(el.id, el.created_at, el.user.screen_name)

              sequence = sequence
                .then(notify(el.full_text))
                .then(wait(process.env.WAIT_SECONDS))
            })
          } else {
            console.log(error)
          }
        }
      )
      console.log('search end')
      resolve()
    })
  }
}

function notify (text) {
  return () => {
    return new Promise((resolve, reject) => {
      console.log(`notify: ${text}`)
      googlehome.notify(
        text,
        (res) => { console.log(res) })
      resolve()
    })
  }
}

function wait (seconds) {
  return () => {
    return new Promise((resolve, reject) => {
      console.log(`wait: ${seconds}`)
      setTimeout(() => resolve(), seconds * 1000)
    })
  }
}
