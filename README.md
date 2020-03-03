# session-keeper

Store question progress in session. Note, just for testing and only supports hardcoded question (1, 2, 3) for ClientId `123`.

# API

## `getNextQuestion`

Re-fetch current question for a given client/phone/locale:
* https://session-keeper.now.sh/api/getNextQuestion?ClientId=123&PhoneNumber=123-456-7890&Locale=en-US

Submit an answer to a question, and return the next question:
* https://session-keeper.now.sh/api/getNextQuestion?ClientId=123&PhoneNumber=123-456-7890&Locale=en-US&ThisQuestionId=1&ThisAnswer=19


## `getSessionAnswers`

Fetch all known answers from this session for a given client/phone:
* https://session-keeper.now.sh/api/getSessionAnswers?ClientId=123&PhoneNumber=123-456-7890


## `clearSession`

Clear session for the client/phone:
* https://session-keeper.now.sh/api/clearSession?ClientId=123&PhoneNumber=123-456-7890

