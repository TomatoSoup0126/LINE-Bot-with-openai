import express from 'express'
import dotenv from 'dotenv'
import line from '@line/bot-sdk'
import { Configuration, OpenAIApi } from 'openai'
import prompt from './prompt/astrologer.js'

dotenv.config()

const app = express()

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
}

const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(openaiConfig)

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
})

const client = new line.Client(lineConfig)
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        ...prompt,
        { role: "user", content: event.message.text }
      ]
    })

    if (completion.data.choices[0]?.message?.content) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: completion.data.choices[0].message.content
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`)
})