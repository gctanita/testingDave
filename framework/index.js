import { SpeakToAi } from "./utils/SpeakToAi.js";
import { combineConversationWithScenario } from "./utils/obtainAConversationScenario.js";
import { topics } from "./data/topics.js";
import { LogLevel, Logger } from "./utils/Logger.js";
import { Metrics } from "./utils/Metrics.js";
import {scenarios} from './data/scenarios.js'


async function  detectTopic(answerFromDave, logger, metrics) {
    logger.log(LogLevel.DEBUG, `detectTopic function`);

    const askAi = new SpeakToAi();
    let possibleTopics = [];

    let lowerInput = answerFromDave.toLowerCase();

    for (let [key, keywords] of Object.entries(topics)) {
        logger.log(LogLevel.DEBUG, `\t key: \t ${key}`);

        for (let keyword of keywords) {
            logger.log(LogLevel.DEBUG, `\t keyword: \t ${keyword}`);

            if (lowerInput.includes(keyword.toLowerCase())) {
                possibleTopics.push(key);

                logger.log(LogLevel.DEBUG, `\t added to possibleTopics: \t ${key}`);

                break; 
            }
        }
    }
    logger.log(LogLevel.DEBUG, `\t possibleTopics: \t ${possibleTopics.toString()}`);
    logger.log(LogLevel.DEBUG, `\t possibleTopics.length: \t ${possibleTopics.length}`);

    if (possibleTopics.length == 1) {
        metrics.setDaveTopic(possibleTopics[0]);
      return possibleTopics[0];
    }

    let products = ["Product_1", "Product_2", "Product_3", "Product_4", "Product_5", "PRODUCT_X"];
    for (let i = 0; i < possibleTopics.length; i++) {
        if (products.includes(possibleTopics[i])) {
            logger.log(LogLevel.DEBUG, `\t detected: \t ${possibleTopics[i]}`);
            metrics.setDaveTopic(possibleTopics[i]);
            return possibleTopics[i];
        }
    }
    
    let finalTopics = [];
    for (let i = 0; i < possibleTopics.length; i++) {
        const prompt = 
            "answer only with YES or NO. Is the following text asking to provide information about " 
            + possibleTopics[i] 
            + "? TEXT: " 
            + answerFromDave;

        let response = '';
        do {
            response = await askAi.askAnotherModel(prompt);

            logger.log(LogLevel.DEBUG, `\t is about topic ${response} \t ${possibleTopics[i]} response`);

        } while (response.length > 3);

        if (response.toLowerCase() == "yes") {
            logger.log(LogLevel.DEBUG, `\t topic  ${possibleTopics[i]} was detected`);

            metrics.setDaveTopic(possibleTopics[i]);
            finalTopics.push(possibleTopics[i]);
        }
    }

    logger.log(LogLevel.DEBUG, `\t finalTopics detected ${finalTopics.toString()}`);
    
    if (finalTopics.length == 1) {
        logger.log(LogLevel.DEBUG, `\t topic  ${finalTopics[0]} was detected`);

        return finalTopics[0];
    }

    return "ERROR: failed to detect correct topic from list: \t" + finalTopics.toString();
}

(async () => {
    let numberOfScenarios = scenarios.length;
    console.log(numberOfScenarios);

    for (let scenarioNumber = 0; scenarioNumber < numberOfScenarios; scenarioNumber++) {
        let customLogger = new Logger(Date.now());
        let metrics = new Metrics(customLogger);

        const conversationSTART = Date.now();
        const currentSelection = combineConversationWithScenario(0, scenarioNumber);
        
        customLogger.log(LogLevel.INFO, `CONVERSATION TEMPLATE: \t ${currentSelection.template_refference}`);
        customLogger.log(LogLevel.INFO, `SCENARIO: \t ${currentSelection.scenario_refference}`);

        const getReplyFromDave = new SpeakToAi(customLogger);
        
        let responseFromDave = await getReplyFromDave.askDave(currentSelection.sum_to_borrow); 
        metrics.setUserTopic("amount to borrow");

        let continueConversation = true;
        let conversationSubject = "UNKNOWN";
        do {
            continueConversation = true;
            conversationSubject = await detectTopic(responseFromDave, customLogger, metrics);

            customLogger.log(LogLevel.DEBUG, `conversationSubject: \t ${conversationSubject}`);

            switch (conversationSubject) {
                case "salary":
                    responseFromDave = await getReplyFromDave.askDave(currentSelection.salary);
                    metrics.setUserTopic("salary");
                    break;
                case "user age":
                    responseFromDave = await getReplyFromDave.askDave(currentSelection.age);
                    metrics.setUserTopic("user age");
                    break;
                case "marriage status":
                    responseFromDave = await getReplyFromDave.askDave(currentSelection.married);
                    metrics.setUserTopic("marriage status");
                    break;
                case "amount to borrow":
                    responseFromDave = await getReplyFromDave.askDave(currentSelection.sum_to_borrow);
                    metrics.setUserTopic("amount to borrow");
                    break;
                case "UNKNOWN":
                default:
                    continueConversation = false;
                    metrics.setUserTopic("UNKNOWN");
            }
            // console.log("DEBUG \t continueConversation \t " + continueConversation);
        } while (continueConversation);

        customLogger.log(LogLevel.INFO, `\nACTUAL RESULT: \t\t ${conversationSubject}`);
        customLogger.log(LogLevel.INFO, `EXPECTED RESULT: \t ${currentSelection.expectedResult}`);


        await metrics.logMetrics();

        const conversationEND = Date.now();
        let duration = (conversationEND - conversationSTART) / 1000;
        customLogger.log(LogLevel.INFO, `Scenario duration: \t ${duration} seconds`);
    }
})();