import { LogLevel } from "./Logger.js";

export class SpeakToAi {
    messagesArray = [];
    logger;

    constructor(logger) {
        this.messagesArray = [];
        this.logger = logger;
    }

    async askDave(messageToSendToDave) {
        const urlChat = 'http://127.0.0.1:11434/api/chat'; 

        let params = {
            "model": "dave",
            "messages": [],
            "stream": false
        };

        this.messagesArray.push({
            "role": "user",
            "content": messageToSendToDave
        });

        this.logger.log(LogLevel.INFO, `USER:\t ${messageToSendToDave}`);

        params.messages = this.messagesArray;

        let daveResponse = await this.communicateWithAi(urlChat, params);
        this.messagesArray.push({
            "role": "assistant",
            "content": daveResponse
        });

        this.logger.log(LogLevel.INFO, `DAVE:\t ${daveResponse}`);

        return daveResponse;
    }

    async askAnotherModel(prompt) {
        const urlGenerate = 'http://127.0.0.1:11434/api/generate'; 
        let params = {
            "model": "deepseek-r1:7b",
            "prompt": prompt, 
            "stream": false
        };

        return await this.communicateWithAi(urlGenerate, params);
    }


    async communicateWithAi(url, params) {
        try {
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params)
            });
        
            const data = await response.json();
            // console.log("DEBUG \tdata\t"+JSON.stringify(data));
            let content = data.message?.content || data.response || 'xxx';
      
            //  console.log("DEBUG RAW content: \n" + content);
          //   console.log("~~~~~~~~\n");
      
        
            // Remove everything between <think>\n and </think>\n including tags
            content = content.replace(/<think>\n[\s\S]*?\n<\/think>\n+/g, '');
            const index = content.indexOf("</think>");
            if (index !== -1) {
              content = content.slice(index + "</think>".length);
            }
            content = content.replace(/^[\s\n\r]+/, '');

            return content;
      
          } catch (error) {
            console.error('API call failed:', error);
            return null;
          }
    }

}
