# Interview Questions Tool
Purpose: Help brainstorm follow-up interview questions based on a candidate's response to a question. Meant to be used to keep the conversation flowing and to help the interviewer get a better understanding of the candidate's thought process.

## Getting Started
1. Clone the repo
2. Open the `index.html` file in your browser
3. Find and input your OpenAI API key
4. Provide a job description
5. Create questions and responses
6. Click the "Generate Questions" button
7. Use the generated follow-up questions to keep the conversation flowing by clicking the "Use this question" button
8. Repeat steps 5-7 until you're done

## How it works
In order to verify that your OpenAI secret key is valid, it sends a small valid request to the completions API using the "ada" model, which is cheapest to use. If the request is successful, it will display the portion of the web application. If the request fails, it will display an error message.

The tool uses the OpenAI API to generate questions based on the job description and the candidate's response to a question. The tool uses the GPT-3.5 Turbo model to generate the questions, which is more expensive than "ada" but a lot cheaper than using GPT-4. The prompt is engineered so that the response from the GPT model uses HTML tags to format the text. The tool then parses the HTML tags and displays the text in a more readable format.