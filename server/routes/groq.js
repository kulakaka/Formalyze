const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});



// https://formalyze-client.vercel.app
// https://formalyze-client-kulakakas-projects.vercel.app/
// https://formalyze-client-git-main-kulakakas-projects.vercel.app/

router.post('/generate-questions', async (req, res) => {
  const { message } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
            role: "user",
            content: `Generate 5-10 questions for a survey form in JSON format: {"questions":[{"id": 0, "type": ENUM("radio", "checkbox", "slider", "open-ended"), "question": "", "options": [{"key": 0, "value": ""}]}]}. Purpose of the form: ${message}.`,
            },
        ],
        model: "llama3-8b-8192", 
        temperature: 1,
        max_tokens: 8192,
        top_p: 1,
        stream: false,
        response_format: {
            type: "json_object"
        },
        stop: null
    });    
    const responseMessage =
      chatCompletion.choices[0]?.message?.content || 'No response';

    const firstBraceIndex = responseMessage.indexOf('{');
    const lastBraceIndex = responseMessage.lastIndexOf('}');
    const jsonString = responseMessage.substring(firstBraceIndex, lastBraceIndex + 1);
    const jsonParsed = JSON.parse(jsonString);
    console.log(jsonParsed)
    res.json({ message: jsonParsed });
  } catch (error) {
    console.error('Error generating chat:', error);
    res.status(500).json({ error: 'Error generating chat' });
  }
});

router.post('/analyze-sentiment', async (req, res) => {
  const { responses, formQuestions } = req.body;

  try {
    const promptContent = `
      Perform in-depth analysis on the following survey responses for overall sentiment and analysis on each question. 
      Responses: ${JSON.stringify(responses)}.
      Form Questions: ${JSON.stringify(formQuestions)}.
      Return a JSON object strictly in the below structure:
      {
        "overallSentiment": {
          "positive": "percentage",
          "negative": "percentage",
          "neutral": "percentage",
          "trend": "positive/negative/neutral"
        },
        "questions": [
          {
            "questionId": "string",
            "text": "string",
            "sentiment": {
              "positive": "percentage",
              "negative": "percentage",
              "neutral": "percentage"
            },
            "responsePatterns": {
              "mostCommonKeywords": ["string", "string", "string"],
              "distribution": {
                "option1": "percentage",
                "option2": "percentage",
                "option3": "percentage"
              }
            }
          }
        ],
        "commonThemes": ["string", "string"],
        "actionableInsights": [
          "string",
          "string"
        ]
      }
    `;
    console.log('Prompt Content: ' + promptContent);

    const sentimentAnalysis = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: promptContent, 
        },
      ],
      model: "llama3-8b-8192", 
        temperature: 1,
        max_tokens: 8192,
        top_p: 1,
        stream: false,
        response_format: {
            type: "json_object"
        },
        stop: null
    });

    const responseMessage =
      sentimentAnalysis.choices[0]?.message?.content || 'No sentiment analysis result';

    const firstBraceIndex = responseMessage.indexOf('{');
    const lastBraceIndex = responseMessage.lastIndexOf('}');
    const jsonString = responseMessage.substring(firstBraceIndex, lastBraceIndex + 1);
    const jsonParsed = JSON.parse(jsonString);
    console.log(jsonParsed)
    res.json({ analysis: jsonParsed });
  } catch (error) {
    console.error('Error performing sentiment analysis:', error);
    res.status(500).json({ error: 'Error performing sentiment analysis' });
  }
});




router.post('/generate-questions-title', async (req, res) => {
  const { message } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
            role: "user",
            content: `Generate a title for a survey form, the purpose of the form is ${message}. The title should be a short, concise, and informative title. Respond with only the title. remove any quotes marks.`,
            },
        ],
        model: "llama3-8b-8192", 
        temperature: 1,
        max_tokens: 8192,
        top_p: 1,
        stream: false,
        stop: null
    });
    
    const responseMessage = chatCompletion.choices[0].message.content || 'No Title Generated';
    // console.log(responseMessage)
      res.json({ title: responseMessage });
  } catch (error) {
    console.error('Error generating chat:', error);
    res.status(500).json({ error: 'Error generating chat' });
  }
});


router.post('/poking-questions',async(req,res)=>{
  const { question } = req.body;
  const {answer} = req.body;
  // console.log(question);
  // console.log(answer);
  try {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
            role: "user",
            content: `Generate only one open end follow up question base on the question and user's answer. Use their answer to ask futher question to find their motivation of their answer.Only generate one line of question, without add other things
            the question is ${question} and answer is ${answer}`
            },
        ],
        model: "llama3-8b-8192", 
        temperature: 1,
        max_tokens: 8192,
        top_p: 1,
        stream: false,
        stop: null
    });     
    const promptQuestion =
      chatCompletion.choices[0]?.message?.content || 'No response';
    // console.log(promptQuestion);
    res.json({ message: promptQuestion });
  } catch (error) {
    console.error('Error generating chat:', error);
    res.status(500).json({ error: 'Error generating chat' });
  }
});



module.exports = router;