const url = 'http://127.0.0.1:11434/api/chat'; 
let params = {
    "model": "dave",
    "messages": [
    ],
    "stream": false
};

async function getReplyFromDave(messageToSendToDave) {
    let message = {
        "role": "user",
        "content": messageToSendToDave
    };

    params.messages.push(message);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
  
      const data = await response.json();
      let content = data.message?.content || '';

    //   console.log("DEBUG RAW content: \n" + content);
    //   console.log("~~~~~~~~\n");

  
      // Remove everything between <think>\n and </think>\n including tags
      content = content.replace(/<think>\n[\s\S]*?\n<\/think>\n+/g, '');
      const index = content.indexOf("</think>");
      if (index !== -1) {
        content = content.slice(index + "</think>".length);
      }

      return content;

    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }

  function addAssistantResponse(daveResponse) {
    let message = {
        "role": "assistant",
        "content": daveResponse
    };

    params.messages.push(message);
  }
  
  let conversationTemplates = [
        {
            "tmplate_refference": "001",
            "sum_to_borrow": "I want to borrow XXX",
            "salary": "I make XXX",
            "age": "I am XXX years old",
            "married": "XXX married"
        }
  ];

  let scenarios = [
    {
        "scenario_refference": "23",
        "sum_to_borrow": "125",
        "salary": "101",
        "age": "25",
        "married": "Yes, I am",
        "expectedResult": ["Product_1"]
    }
  ];

  let topics = {    
    "salary": ["salary", "make", "income"], 
    "age": ["age", "old"], 
    "marriage status": ["married", "marital", "marital status"], 
    "amount to borrow": ["borrow", "loan"], 
    "Product_1": ["Product_1", "Product 1", "product_1", "product 1"], 
    "Product_2": ["Product_2", "Product 2", "product_2", "product 2"], 
    "Product_3": ["Product_3", "Product 3", "product_3", "product 3"], 
    "Product_4": ["Product_4", "Product 4", "product_4", "product 4"], 
    "Product_5": ["Product_5", "Product 5", "product_5", "product 5"]
  }

  // ids reffer to the number of the scenario in the array, not the scenario_refference or template_refference
  function combineConversationWithScenario(idTemplate, idScenario) {
    let localScenario = scenarios[idScenario];
    let localTemplate = conversationTemplates[idTemplate];

    return {
        "template_refference": localTemplate.tmplate_refference,
        "scenario_refference": localScenario.scenario_refference,
        "sum_to_borrow": localTemplate.sum_to_borrow.replace("XXX", localScenario.sum_to_borrow),
        "salary": localTemplate.salary.replace("XXX", localScenario.salary),
        "age": localTemplate.age.replace("XXX", localScenario.age),
        "married": localTemplate.married.replace("XXX", localScenario.married),
        "expectedResult": localScenario.expectedResult
    };
  }

  async function dumbApproach(currentSelection) {
    console.log("\t\t User:\t" + currentSelection.sum_to_borrow);
    let result = await getReplyFromDave(currentSelection.sum_to_borrow);
    addAssistantResponse(result);
    console.log("\t\t Dave:\t" + result);

    // AGE:
    console.log("\t\t User:\t" + currentSelection.age);
    result = await getReplyFromDave(currentSelection.age);
    addAssistantResponse(result);
    console.log("\t\t Dave:\t" + result);
    
    // SALARY:
    console.log("\t\t User:\t" + currentSelection.salary);
    result = await getReplyFromDave(currentSelection.salary);
    addAssistantResponse(result);
    console.log("\t\t Dave:\t" + result);

    // MARRIED:
    console.log("\t\t User:\t" + currentSelection.married);
    result = await getReplyFromDave(currentSelection.married);
    addAssistantResponse(result);
    console.log("\t\t Dave:\t" + result);
  }

  async function isThisQuestionAbout(question, topic) {
    const url = 'http://127.0.0.1:11434/api/generate'; 
    let params = {
        "model": "deepseek-r1:7b",
        "prompt": "answer only with YES or NO. Is the following text asking me about " + topic + " or to provide information about " + topic + "? TEXT: " + question,
        "stream": false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
  
      const data = await response.json();
      let content = data.response;
  
      //DEBUG before cleanup
    //   console.log("\t\tDEBUG: " + content);

      // Remove everything between <think>\n and </think>\n including tags
      content = content.replace(/<think>\n[\s\S]*?\n<\/think>\n+/g, '');
  
    //   console.log("\t\tDEBUG end result: \t isThisQuestionAbout " + content);

      return content.toUpperCase();
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }


  (async () => {
    const noOfTemplates = conversationTemplates.length;
    const noOfScenarios = scenarios.length;

    for (let templateNo = 0; templateNo < noOfTemplates; templateNo++) {
        for (let scenarioNo = 0; scenarioNo < noOfScenarios; scenarioNo++) {
            // have the conversation 

            const conversationSTART = Date.now();
            const currentSelection = combineConversationWithScenario(templateNo, scenarioNo);

            console.log("\n CONVERSATION TEMPLATE: " + currentSelection.template_refference);
            console.log("\t SCENARIO: " + currentSelection.scenario_refference);

            params = {
                "model": "dave",
                "messages": [
                ],
                "stream": false
            };

            // dumb approach, assuming the order is always: how much, age, salary, married 
            // await dumbApproach(currentSelection);
            console.log("\t\t User:\t" + "START NEW CONVERSATION.");
            let result = await getReplyFromDave("START NEW CONVERSATION.");
            addAssistantResponse(result);
            console.log("\t\t Dave:\t" + result);

            // // using another model, more basic, with fast response:
            // console.log("\t\t User:\t" + currentSelection.sum_to_borrow);
            // result = await getReplyFromDave(currentSelection.sum_to_borrow);
            // addAssistantResponse(result);
            // console.log("\t\t Dave:\t" + result);

            // let aboutSalary = await isThisQuestionAbout(result, "salary");
            // if (aboutSalary == "YES") {
            //     result = await conversation(currentSelection.salary);
            // }

            let continueConversation = true;
            let conversationSubject = "UNKNOWN";
            do {
                //let topic = ["amount to borrow", "salary", "age", "marriage status", "Product_1", "Product_2", "Product_3", "Product_4", "Product_5"];
                continueConversation = true;
                conversationSubject = await detectTopic(result);
                // console.log("DEBUG \t conversationSubject \t " + conversationSubject);
                switch (conversationSubject) {
                    case "salary":
                        result = await conversation(currentSelection.salary);
                        break;
                    case "age":
                        result = await conversation(currentSelection.age);
                        break;
                    case "marriage status":
                        result = await conversation(currentSelection.married);
                        break;
                    case "amount to borrow":
                        result = await conversation(currentSelection.sum_to_borrow);
                        break;
                    default:
                        continueConversation = false;
                }
                // console.log("DEBUG \t continueConversation \t " + continueConversation);
            } while (continueConversation);

            // let topic = ["Product_1", "Product_2", "Product_3", "Product_4", "Product_5"];
            // let endResult = await detectTopic(result, topic);

            console.log("\t ACTUAL RESULT: " + conversationSubject);
            console.log("\t EXPECTED RESULT: " + currentSelection.expectedResult);

            const conversationEND = Date.now();
            let duration = (conversationEND - conversationSTART) / 1000;
            console.log("\t Scenario duration: " + duration + " seconds");
        }
    }
  })();

  async function conversation(question) {
    console.log("\t\t User:\t" + question);
    result = await getReplyFromDave(question);
    addAssistantResponse(result);
    console.log("\t\t Dave:\t" + result);

    return result;
  }

  async function detectTopic(result) {
    let possibleTopics = [];

    let lowerInput = result.toLowerCase();

    for (let [key, keywords] of Object.entries(topics)) {
      for (let keyword of keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          possibleTopics.push(key);
          break; 
        }
      }
    }

 // console.log("DEBUG: possibleTopics \t " + possibleTopics);
    // const topicLen = topic.length;

    // for(let i = 0; i < topicLen; i++) {
    //   if (result.includes(topic[i])) {
    //     possibleTopics.push(topic[i]);
    //   };
    // }

    // topic.foreach((element) => {
    //   if (result.includes(element)) {
    //     possibleTopics.push(element);
    //   };
    // });
    
    if (possibleTopics.length == 1) {
      return possibleTopics[0];
    }

    return await askAi(result, possibleTopics);
  }

  async function askAi(result, topic) {

    // console.log("\n detectTopic");
    // console.log("DEBUG: \t result \t" + result);
    // console.log("DEBUG: \t topic \t" + topic);


    let topicNo = 0;
    let localTopic = topic;
    do {
        // console.log("DEBUG: \t topicNo \t" + topicNo);
        localTopic = topic;

       // for (let topicNo = 0; topicNo < localTopic.length; topicNo++) {

        //     console.log("DEBUG: \t topicNo \t" + topicNo);
        //    console.log("DEBUG: \t localTopic[topicNo] \t" + localTopic[topicNo]);

            let aboutTopic = await isThisQuestionAbout(result, localTopic[topicNo]);
            // console.log("DEBUG: \t aboutTopic b\t" + aboutTopic);
            while (aboutTopic.length > 3) {
                aboutTopic = await isThisQuestionAbout(result, localTopic[topicNo]);
            }
        //    console.log("DEBUG: \t aboutTopic a\t" + aboutTopic);
            
            if(aboutTopic == "YES") {
                localTopic = localTopic[topicNo];

            //    console.log("DEBUG: \t localTopic \t" + localTopic);

                break;
            }
        // )
    //    console.log("DEBUG: \t Array.isArray(localTopic) \t" + Array.isArray(localTopic));
       

       topicNo++;
    //    console.log("DEBUG: \t topicNo \t" + topicNo);
    } while (Array.isArray(localTopic) && (topicNo < localTopic.length));
    
    // console.log("DEBUG: \t topicNo \t" + topicNo);
    // console.log("DEBUG: \t this question is about \t" + localTopic);
    // console.log("\n detectTopic");
    if (topicNo > topic.length) {
        localTopic = "UNKNOWN";
        console.log("ERROR: UNKNOWN topic for " + result);
    }

    return localTopic;
  }