import OpenAI from "openai";

const openai = new OpenAI({ apiKey: ""});

async function callOpenAI(prompt) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
    });
    
    // console.log(completion.choices[0]);
    return completion.choices[0]
}

export default callOpenAI