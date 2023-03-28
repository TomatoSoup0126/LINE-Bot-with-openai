import express from 'express'
import dotenv from 'dotenv'
import line from '@line/bot-sdk'

dotenv.config()

const app = express()

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
}

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
})

const client = new line.Client(lineConfig)
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  })
}

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`)
})