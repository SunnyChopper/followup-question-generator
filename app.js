let secretKey = "";
let systemMessage = "You are a job interviewer for Take Command, which is a health-tech startup focusing on creating a software " +
    "platform that can handle administering a QSEHRA or ICHRA for small businesses to large enterprises. Your goal is to generate " +
    "follow-up questions based on the answers that a candidate gives to a question. The follow-up questions must be returned in HTML" +
    "format, wrapped in <p> tags, so that they can be rendered by a final application. The following is the full job description for " +
    "the position.";

let savedJobDescription = '';
let jobDescription = "";
let destroyedQuestionCount = 0;
let questionCount = 0;
let interviewCount = 0;
let interviews = [];

const templates = {
    'Senior Full-Stack Engineer': {
        jobDescription: `<p>Keywords: java, hibernate, sql, aws lambda, react, reactjs, microservices, mentoring</p>
        <p><strong>About Take Command</strong></p>
        <p>Take Command is a start-up on a mission to improve the healthcare system, starting with health insurance. Pragmatically speaking, we help employers reimburse employees for individual insurance instead of offering a traditional one-size-fits-all group plan. We believe this model can empower employees (when they have the right support) to be savvy healthcare consumers and have a transformative impact on the entire healthcare system.</p>
        <p>Let&rsquo;s be honest&mdash;health insurance is usually a confusing, frustrating, and even emotional experience for people. We want to fix that with a new model, great technology, and a superior user experience. We have made a great start, but we need your help to fully realize our long-term vision.</p>
        <p>As a part of the dev team, you&#39;ll build the framework for both our clients and our team to succeed. You will be a pillar in our company as we grow and make our product the best product on the market!&nbsp;</p>
        <p>In this role, you will:</p>
        <ul>
            <li>Take ownership for delivering multiple features, their quality and assist team members in delivering their features.</li>
            <li>Designing and writing code that others can mimic for a web application built on Java, Hibernate ORM with a Postgres database on AWS Aurora, AWS services (including Lambda, SQS, SNS, API Gateway, Cognito, etc.).</li>
            <li>Recommend code improvements to make the product easier to use, manage and maintain.</li>
            <li>Provide recommendations in sprint planning and refinement. Assist teammates in estimating their work.</li>
            <li>Spend time directly with team members to support them in understanding tasks, brainstorm solutions, mentor them on development best practices and review their work to ensure the best product makes it to the customer.</li>
            <li>Be product-minded; focus not only on what needs to be built but why something needs to be built. Explain the why to teammates so they are able to build and test their deliverables.</li>
        </ul>
        <p>You may be a great fit for this role if you have:</p>
        <ul>
            <li>At least 5 years of professional experience in software development</li>
            <li>Product Development Methodologies: Agile, Scrum / Lean</li>
            <li>Object-oriented languages: Java</li>
            <li>Database technologies: Hibernate ORM (Object-relational mappers), SQL, RDBMS / Relational databases</li>
            <li>Cloud infrastructure: AWS, particularly using Lambdas in a micro-services architecture</li>
            <li>Source control: Git</li>
        </ul>`,
        questions: [
            'Can you briefly describe your journey?',
            'Could you elaborate on the type of challenges you are looking for from your team?',
            'Are there specific technologies/languages that you are the most comfortable with? Do you prefer front-end or back-end or does it not matter?',
            'Can you speak to your experience mentoring other developers?',
            'Can you speak to some security best practices?',
            'How would you ensure that what is delivered meets a certain level of quality?',
            'Tell me about a time you designed and presented an ERD.'
        ]
    },
    'Sample Template': {
        jobDescription: `<p>This is the content for a sample template. This is where your job description would go.</p>`,
        questions: [
            'What is the answer to the first question?',
            'What is the answer to the second question?',
            'What is the answer to the third question?',
            'What is the answer to the fourth question?',
            'What is the answer to the fifth question?',
            'What is the answer to the sixth question?',
            'What is the answer to the seventh question?'
        ]
    }
};

/** 
* **Description**: Add a question-answer input and submit button form to the page.
* @param {string} prefilledQuestion - The question to be prefilled in the question input. This parameter is 
    optional and can be selected from one of the follow-up questions generated by the previous question.
* @return {void} Returns nothing.
*/
function addQuestionForm(prefilledQuestion = '') {
    questionCount++;

    const questionHtml = `
        <div class="form-group questionContainer" id="question${questionCount}">
            <input type="text" class="form-control questionInput" data-question-id="${questionCount}" id="questionInput${questionCount}" placeholder="Enter your question" value="${prefilledQuestion}">
            <h4 class="mb-0" id="questionText${questionCount}" style="display: none;"></h4>
            <div class="mt-2">
                <textarea class="form-control mt-2" id="answerInput${questionCount}" placeholder="Enter your answer"></textarea>
                <p class="mb-2 mt-4" class="answerText" id="answerText${questionCount}" style="display: none;"></p>
            </div>
            <!-- Div to hold the buttons horizontally -->
            <div class="d-flex justify-content-between mt-3">
                <button class="btn btn-primary generate-questions" id="submitBtn${questionCount}" disabled>Generate Follow-up</button>
                <button class="btn btn-danger btn-sm delete-question-btn" id="deleteBtn${questionCount}" data-question-id="${questionCount}">Delete Question</button>
            </div>
            <div class="responseContainer" id="responseContainer${questionCount}" style="display: none;"></div>
            <div class="overlay" id="overlay${questionCount}">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    `;

    $('#questionContainer').append(questionHtml);

    // Initialize CKEditor for the new answer input
    CKEDITOR.replace(`answerInput${questionCount}`);

    // Enable the submit button when the question and answer inputs are not empty
    $('.questionInput').on('input blur', function () { 
        let questionId = $(this).attr('id').replace('questionInput', '');
        if ((this.value.trim() !== '' || $(`#questionText${questionId}`).text().trim() !== '') &&
            (CKEDITOR.instances[`answerInput${questionId}`].getData().trim() !== '' || $(`#answerText${questionId}`).html().trim() !== '')) {
            $(`#submitBtn${questionId}`).prop('disabled', false);
        } else {
            $(`#submitBtn${questionId}`).prop('disabled', true);
        }
    });

    // Hide the question input and show the question text when the question input is blurred
    $('.questionInput').on('blur', function () { 
        const questionId = $(this).attr('id').replace('questionInput', '');
        const question = $(this).val();
        if (question.trim() !== '') {
            $(this).hide();
            $(`#questionText${questionId}`).text(question).show();
        }
    });

    // Show the question input and hide the question text when the question text is clicked
    $(`#questionText${questionCount}`).click(function() {
        const questionId = $(this).attr('id').replace('questionText', '');
        $(this).hide();
        $(`#questionInput${questionId}`).show().focus();
    });

    // Enable the submit button when the answer inputs are not empty
    CKEDITOR.instances[`answerInput${questionCount}`].on('change', function() {
        if ((this.getData().trim() !== '' || $(`#answerText${questionCount}`).html().trim() !== '') && 
            ($(`#questionInput${questionCount}`).val().trim() !== '' || $(`#questionText${questionCount}`).text().trim() !== '')) {
            $(`#submitBtn${questionCount}`).prop('disabled', false);
        } else {
            $(`#submitBtn${questionCount}`).prop('disabled', true);
        }
    });

    // Hide the answer input and show the answer text when the answer input is blurred
    CKEDITOR.instances[`answerInput${questionCount}`].on('blur', function () {
        if ((this.getData().trim() !== '' || $(`#answerText${questionCount}`).html().trim() !== '') && 
            ($(`#questionInput${questionCount}`).val().trim() !== '' || $(`#questionText${questionCount}`).text().trim() !== '')) {
            $(`#submitBtn${questionCount}`).prop('disabled', false);
        } else {
            $(`#submitBtn${questionCount}`).prop('disabled', true);
        }

        const answerId = this.name.replace('answerInput', '');
        const answer = this.getData();
        if (answer.trim() !== '') {
            this.container.hide();
            $(`#answerText${answerId}`).html(answer).show();
        }
    });

    // Show the answer input and hide the answer text when the answer text is clicked
    $(`#answerText${questionCount}`).click(function() {
        const answerId = $(this).attr('id').replace('answerText', '');
        $(this).hide();
        CKEDITOR.instances[`answerInput${answerId}`].container.show();
        CKEDITOR.instances[`answerInput${answerId}`].focus();
    });

    // Add event listener to the new submit button
    $(`#submitBtn${questionCount}`).click(function () { 
        const questionId = $(this).attr('id').replace('submitBtn', '');
        const question = $(`#questionInput${questionId}`).val() || $(`#questionText${questionId}`).text();
        const answer = CKEDITOR.instances[`answerInput${questionId}`].getData() || $(`#answerText${questionId}`).html();
        if (question.trim() !== '' && answer.trim() !== '') {
            $(this).prop('disabled', true); // Disable the button
            $(`#overlay${questionId}`).show(); // Show the overlay
            generateFollowUp(questionId, jobDescription, question, answer);
        }
    });

    // Add event listener to the edit button
    $(`#editBtn${questionCount}`).click(function() {
        $(`#collapse${questionCount} .edit-mode`).show();
        $(`#collapse${questionCount} .display-mode`).hide();
    });

    // Add event listener to the delete button using the data-question-id attribute
    $(`#deleteBtn${questionCount}`).click(function () {
        const questionId = $(this).data('question-id');
        $(`#question${questionId}`).remove();
        CKEDITOR.instances[`answerInput${questionId}`].destroy();
        destroyedQuestionCount++;
    });

    $('#collapse' + questionCount).collapse('show');
}

// Function to generate follow-up questions
function generateFollowUp(questionId, jobDescription, question, answer) {
    // Show the overlay and spinner
    $(`#overlay${questionId}`).show();

    // Send the API request
    $.ajax({
        url: 'https://api.openai.com/v1/chat/completions',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + secretKey,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [{
                'role': 'system',
                'content': systemMessage
            }, {
                'role': 'system',
                'content': `"""\n${jobDescription}\n"""`
            }, {
                'role': 'user',
                'content': `Question to candidate: ${question}\nAnswer from candidate: ${answer}\n\nFollow-up Questions wrapped in <p> tags:`
            }]
        }),
        success: function(response) {
            // Try to parse the response as a list of follow-up questions
            const followUpQuestions = response.choices[0].message.content.replace('<br>', '\n')
                .replace('\n', '').replace('<p>', '').split('</p>');
            // Replace all HTML tags
            let followUpHtml = '<h5 class="mt-3">Follow-up Questions:</h5>';
            followUpQuestions.forEach((question, index) => {
                const sanitizedQuestion = question.replace(/<[^>]*>?/gm, ''); 
                if (sanitizedQuestion.trim() !== '') {
                    followUpHtml += `
                        <div class="d-flex justify-content-between align-items-center mb-2" style="width: 100%">
                            <p class="mb-0">${sanitizedQuestion}</p>
                            <button class="btn btn-link ml-2 use-question-btn" style="font-size: 0.8em; white-space: nowrap;" data-question="${sanitizedQuestion}">Use this question</button>
                        </div>
                    `;
                }
            });
            $(`#responseContainer${questionId}`).html(followUpHtml).show();

            // Add event listener to the "Use this question" buttons
            $('.use-question-btn').click(function() {
                let question = $(this).data('question');
                question = question.replace(/^\d+\.\s+/, ''); // Remove number prefix
                question = question.replace(/<br>/g, ' '); // Remove line breaks
                question = question.replace(/<[^>]*>/g, ''); // Remove HTML tags
                addQuestionForm(question);

                // Collapse the prior question-answer pair
                const questionId = $(this).closest('.form-group').attr('id').replace('question', '');
                console.log(`Question ID: ${questionId}`);
                $(`#questionInput${questionCount}`).blur();
                $(`#collapse${questionId}`).collapse('hide');
                $('.accordion-collapse.show').collapse('hide');

                // Move the window to the top of the new question in a smooth animation
                // that follows the laws of physics and is pleasing to the eye
                const newQuestionId = questionCount;
                const newQuestionTop = $(`#question${newQuestionId}`).offset().top;
                const windowScrollTop = $(window).scrollTop();
                const scrollDistance = newQuestionTop - windowScrollTop;
                const scrollDuration = Math.min(1000, Math.max(500, Math.abs(scrollDistance) * 0.5));
                const scrollDelay = 100;
                $('html, body').animate({
                    scrollTop: newQuestionTop - 50
                }, scrollDuration);
                setTimeout(function () {
                    CKEDITOR.instances[`answerInput${newQuestionId}`].focus();
                }, scrollDuration + scrollDelay);

                // Hide the overlay
                $(`#overlay${newQuestionId}`).hide();
            });
        },
        error: function() {
            // Show an error message
            $(`#responseContainer${questionId}`).html('<p class="text-danger">An error occurred while generating the follow-up questions.</p>');
        },
        complete: function() {
            $(`#submitBtn${questionId}`).prop('disabled', false);
            $(`#overlay${questionId}`).hide();
        }
    });
}

// Function to start a new interview
function startNewInterview() {
    // Save the current interview
    if (jobDescription !== '') {
        interviews.push({
            id: interviewCount,
            jobDescription: jobDescription,
            questions: $('#questionContainer').html()
        });
        interviewCount++;

        // Add the interview to the interview menu
        const interviewHtml = `
            <div class="interview-item" id="interview${interviewCount}">
                <h5>Interview ${interviewCount}</h5>
                <button class="btn btn-link load-interview-btn" data-interview-id="${interviewCount}">Load this interview</button>
            </div>
        `;
        $('#interviewList').append(interviewHtml);        
    }

    // Reset the job description
    jobDescription = '';
    if (CKEDITOR.instances.jobDescriptionInput) {
        console.log('Resetting the job description...')
        CKEDITOR.instances.jobDescriptionInput.setData('');
    }
    $('#submitJobDescriptionBtn').prop('disabled', true);
    $('#jobDescriptionEditor').show();
    $('#jobDescriptionDisplay').hide();  

    const selectedTemplate = $('#jobDescriptionSelect').val();
    if (selectedTemplate !== 'Select a template') {
        jobDescription = templates[selectedTemplate].jobDescription;
        console.log(`Loading template ${selectedTemplate}...`);
        console.log(`Job description: ${jobDescription}`);
        if (CKEDITOR.instances.jobDescriptionInput && jobDescription && jobDescription !== '') {
            console.log('Setting the job description...');
            CKEDITOR.instances.jobDescriptionInput.setData(jobDescription);
            console.log('Set the job description.');
        }
    }

    // Reset the questions
    $('#questionContainer').html('');
    questionCount = 0;
    $('#addQuestionBtn').prop('disabled', true);
    console.log('Reset the questions.');
}

// Function to load an interview
function loadInterview(interviewId) {
    const interview = interviews[interviewId];
    jobDescription = interview.jobDescription;
    console.log(`Loading interview ${interviewId}...`);
    console.log(`Job description: ${jobDescription}`);

    console.log('Setting the job description...');
    CKEDITOR.instances.jobDescriptionInput.setData(jobDescription);
    $('#jobDescriptionDisplay').html(jobDescription);
    $('#jobDescriptionEdit').hide();
    $('#jobDescriptionDisplay').show();
    $('#editJobDescriptionBtn').show();
    $('#submitJobDescriptionBtn').hide();

    console.log('Setting the questions...');
    $('#questionContainer').empty();
    interview.questions.forEach((question, index) => {
        addQuestion(question.question);
        CKEDITOR.instances[`answerInput${index + 1}`].setData(question.answer);
        $(`#responseContainer${index + 1}`).html(question.followUp);
    });
    questionCount = interview.questions.length;
    $('.accordion-collapse').collapse('hide');
}

function loadTemplateQuestions() {
    const template = $('#jobDescriptionSelect').val();
    $('#loadTemplateQuestionsBtn')
    if (template in templates && $('#loadTemplateQuestionsBtn').text() === 'Load Template Questions') {
        // Remove all existing questions
        for (let i = 1 + destroyedQuestionCount; i <= questionCount; i++) {
            console.log(`Removing question ${i}`);
            $(`#question${i}`).remove();
            CKEDITOR.instances[`answerInput${i}`].destroy();
            questionCount = 0;
            destroyedQuestionCount = 0;
        }
        console.log('Adding questions from template...');
        templates[template].questions.forEach(question => {
            addQuestionForm(question);
            $(`#questionInput${questionCount}`).blur();
        });
        $('#loadTemplateQuestionsBtn').text('Remove Template Questions');
    } else {
        console.log('Removing questions from template...');
        for (let i = 1 + destroyedQuestionCount; i <= questionCount; i++) {
            $(`#question${i}`).remove();
            CKEDITOR.instances[`answerInput${i}`].destroy();
        }
        questionCount = 0;
        $('#loadTemplateQuestionsBtn').text('Load Template Questions');
    }
}

$(document).ready(function () {
    // Hide the add question button
    $('#addQuestionBtn').hide();

    // Initialize CKEditor for the job description input
    CKEDITOR.replace('jobDescriptionInput');

    // Enable the job description submit button when the job description input is not empty
    CKEDITOR.instances['jobDescriptionInput'].on('change', function() {
        if (this.getData().trim() !== '') {
            $('#submitJobDescriptionBtn').prop('disabled', false);
        } else {
            $('#submitJobDescriptionBtn').prop('disabled', true);
        }
    });

    // Add event listener to the job description submit button
    $('#submitJobDescriptionBtn').click(function() {
        // Get the job description
        jobDescription = CKEDITOR.instances['jobDescriptionInput'].getData();

        // Log the job description
        console.log(jobDescription);

        // Disable the job description input and submit button
        CKEDITOR.instances['jobDescriptionInput'].setReadOnly(true);
        $(this).prop('disabled', true);

        // Show the job description
        $('#jobDescriptionText').html(jobDescription);
        $('#jobDescriptionEditor').hide();
        $('#jobDescriptionDisplay').show();

        // Enable the "Add Question" button
        $('#addQuestionBtn').prop('disabled', false).show();
        $('#loadTemplateQuestionsBtn').show();

        if (questionCount > 0) {
            if ($(`#questionInput${questionCount}`).val().trim() !== '' && CKEDITOR.instances[`answerInput${questionCount}`].getData().trim() !== '') {
                addQuestionForm();
            }
        } else {
            addQuestionForm();
        }
    });

    // Add event listener to the job description edit button
    $('#editJobDescriptionBtn').click(function() {
        // Enable the job description input
        CKEDITOR.instances['jobDescriptionInput'].setReadOnly(false);

        // Enable the job description submit button
        $('#submitJobDescriptionBtn').prop('disabled', false);

        // Show the job description editor
        $('#jobDescriptionEditor').show();
        $('#jobDescriptionDisplay').hide();
    });

    // Add event listener to the job description template select
    $('#jobDescriptionSelect').change(function() {
        const template = $(this).val();
        console.log(`Selected template: ${template}`);
        if (template in templates) {
            if (jobDescription !== '') {
                $('#loadTemplateQuestionsBtn').show();
            }
            savedJobDescription = CKEDITOR.instances['jobDescriptionInput'].getData();
            CKEDITOR.instances['jobDescriptionInput'].setData(templates[template].jobDescription);
        } else {
            $('#loadTemplateQuestionsBtn').hide();
            CKEDITOR.instances['jobDescriptionInput'].setData(savedJobDescription);
        }
    });

    // Add event listener to the "Show Interviews" button
    $('#showInterviewsBtn').click(function() {
        $('#interviewMenu').toggleClass('hide');
        if ($('#interviewMenu').hasClass('hide')) {
            $(this).text('Show Past Interviews');
        } else {
            $(this).text('Hide Past Interviews');
        }
    });

    // Add event listener to the "Load this interview" buttons
    $('.load-interview-btn').click(function() {
        const interviewId = $(this).data('interview-id');
        loadInterview(interviewId);
    });

    // Add a new question when the "Add Question" button is clicked
    $('#addQuestionBtn').click(() => { addQuestionForm('') });

    // Start a new interview when the "Start New Interview" button is clicked
    $('#newInterviewBtn').click(startNewInterview);

    // Add event listener to the question container to hide other questions when one is expanded
    $('#questionContainer').on('show.bs.collapse', '.accordion-collapse', function() {
        // Collapse all other question-answer pairs
        $('.accordion-collapse.show').collapse('hide');
        $('.accordion-collapse.show').each(function() {
            if (this !== event.target) {
                $(this).collapse('hide');
            }
        });
    
        $('.edit-mode').show();
        $('.display-mode').hide();
    });

    // Add event listener to the question container to show the question and answer when the question is collapsed
    $('#questionContainer').on('hide.bs.collapse', '.accordion-collapse', function() {
        const questionId = $(this).attr('id').replace('collapse', '');
        const question = $(`#questionInput${questionId}`).val();
        console.log(`Question ${questionId}: ${question}`);
        const answer = CKEDITOR.instances[`answerInput${questionId}`].getData();
        $(`#questionText${questionId}`).text(question);
        $(`#answerText${questionId}`).html(answer);
        $(`#collapse${questionId} .edit-mode`).hide();
        $(`#collapse${questionId} .display-mode`).show();
        $(`#heading${questionId} .accordion-button`).text(question);
    });

    // Add event listener to close the past interviews menu when the user clicks outside of it
    $(document).click(function (event) {
        if (!$(event.target).closest('#interviewMenu').length && !$(event.target).closest('#showInterviewsBtn').length) {
            $('#interviewMenu').addClass('hide');
            $('#showInterviewsBtn').text('Show Past Interviews');
        }
    });
        
    // Add event listener to the close button in the past interviews menu
    $('#closeInterviewsBtn').click(function() {
        $('#interviewMenu').addClass('hide');
        $('#showInterviewsBtn').text('Show Past Interviews');
    });

    // Add event listener to the "Load Template Questions" button
    $('#loadTemplateQuestionsBtn').click(function() {
        loadTemplateQuestions();
    });

    // Add event listener to the OpenAI key submit button
    $('#submitOpenAiKeyBtn').click(function() {
        secretKey = $('#openAiKeyInput').val();
        if (secretKey.trim() !== '') {
            // Send a request to the OpenAI API to check if the key is valid
            $.ajax({
                url: 'https://api.openai.com/v1/completions',
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + secretKey,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "model": "ada",
                    'prompt': 'Translate the following English text to French: "{}"',
                    'max_tokens': 60
                }),
                success: function() {
                    // If the request is successful, enable the job description input and submit button
                    $('#jobDescriptionForm').show();
                    $('#jobDescriptionInput').prop('disabled', false);
                    $('#jobDescriptionSelect').prop('disabled', false);
                    $('#openAiKeyError').hide();
                },
                error: function() {
                    // If the request fails, show an error message
                    $('#openAiKeyError').show();
                }
            });
        }
    });

});