  import {conversationTemplates} from '../data/conversationTemplates.js'
  import {scenarios} from '../data/scenarios.js'
  
  // ids reffer to the number of the scenario in the array, not the scenario_refference or template_refference
  export function combineConversationWithScenario(idTemplate, idScenario) {
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