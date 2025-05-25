import { LogLevel, Logger } from "./Logger.js";

export class Metrics {
    topicsByUser = {};
    topicsByDave= {};
    logger = "";

    constructor(logger) {
        this.logger = logger;

        this.topicsByUser = {
            "salary": 0, 
            "user age": 0, 
            "marriage status": 0, 
            "amount to borrow": 0, 
            "other": 0,
            "otherList": []
        };
        this.topicsByDave= {    
            "salary": 0, 
            "user age": 0, 
            "marriage status": 0, 
            "amount to borrow": 0, 
            "Product_1": 0, 
            "Product_2": 0, 
            "Product_3": 0, 
            "Product_4": 0, 
            "Product_5": 0,
            "PRODUCT_X": 0,
            "other": 0,
            "otherList": []
        };
    }

    setUserTopic(topic) {
        this.topicsByUser = this.setTopic(topic, this.topicsByUser);
    }   

    setDaveTopic(topic) {
        this.topicsByDave = this.setTopic(topic, this.topicsByDave);
    }   

    setTopic(topic, mapper) {
        if (mapper.hasOwnProperty(topic)){
            mapper[topic]++;
        } else {
            mapper["other"]++;
            mapper["otherList"].push(topic);
        }
        return mapper;
    }

    async logMetrics() {
        await this.logger.log(LogLevel.INFO, "\nUSER METRICS \n" +
            "\n\t - salary - " + this.topicsByUser["salary"] +
            "\n\t - user age - " + this.topicsByUser["user age"] +
            "\n\t - marriage status - " + this.topicsByUser["marriage status"] +
            "\n\t - amount to borrow - " + this.topicsByUser["amount to borrow"] +
            "\n\t - other - " + this.topicsByUser["other"] +
            "\n\t - otherList - " + this.topicsByUser["otherList"].toString() +
            "\n\n" +
            "\nDAVE METRICS \n" + 
            "\n\t - salary - " + this.topicsByDave["salary"] +
            "\n\t - user age - " + this.topicsByDave["user age"] +
            "\n\t - marriage status - " + this.topicsByDave["marriage status"] +
            "\n\t - amount to borrow - " + this.topicsByDave["amount to borrow"] +
            "\n\t - Product_1 - " + this.topicsByDave["Product_1"] +
            "\n\t - Product_2 - " + this.topicsByDave["Product_2"] +
            "\n\t - Product_3 - " + this.topicsByDave["Product_3"] +
            "\n\t - Product_4 - " + this.topicsByDave["Product_4"] +
            "\n\t - Product_5 - " + this.topicsByDave["Product_5"] +
            "\n\t - PRODUCT_X - " + this.topicsByDave["PRODUCT_X"] +
            "\n\t - other - " + this.topicsByDave["other"] +
            "\n\t - otherList - " + this.topicsByDave["otherList"].toString() +
        "\n\n");
    }
}