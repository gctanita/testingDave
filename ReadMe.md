# A journey in getting a glimpse of what AI testing implies

In a classic testing setup, things are pretty straightforward: you know the business rules, you know that for input X you’ll always get output Y, and generating your own test data isn’t rocket science. But when it comes to AI testing, it’s a whole different beast. It’s all about the data. You need to understand what the model was trained on, what kind of system prompts it's running under, what the business constraints are and how its answers can vary wildly. Ask an AI “what’s 2+2?” a few times, and you’ll get responses like: “4”, “the answer is 4”, “by adding 2 and 2 you get 4”, “2+2=4”. And that’s just the beginning.

In AI testing you will know in most parts the training data. You will have support in creating the datasets for testing in order to create a benchmark. But how do you do that if you receive an existing AI model, that was modified with a system promt and some parameters tweaked and given to you to test it out? How do you approach this? 

I poked around and came up with a strategy for it. It's not a golden solution, but it is a starting point to help you get your bearings and out of the mess you are currently in. 

## Steps:
- Interact with the bot to get a feeling on how it responds. There are some patterns.
- Identify the scenarios based on the business rules received
- Try to automate the discussions
- Add metrics
- Enhancements

## STEP-0: Setup 
Before we can attempt to put into practice any of the steps mentioned above we need an AI to experiment on. I installed on my local manchine ollama, and then got the deepseek-r1 model. I chose the model as it had just appeared and people were praising it to be faster and consume less resources. I did not compare it with other models to check for myself, but you can create your own "Dave" based on what ever model you wish. If you want to find out what Dave stands for, ask Chat GPT I'm sure he'll come up with something to suit your fancy :D

### Setting stuff up:
- **Install Python** => https://www.python.org/downloads/
>!!! Be careful to select "Add Python to PATH" !!!
- **Install Ollama** => https://ollama.com/download
- **Download Model** => https://ollama.com/library/deepseek-r1

```
ollama pull deepseek-r1:7b
ollama run deepseek-r1:7b
```

We are going to set up Dave to give answers based on this table: 
| Condition                     | Product_1 | Product_2 | Product_3 | Product_4 | Product_5 |
|-------------------------------|-----------|-----------|-----------|-----------|-----------|
| Loan sum more than            | 100       | 100       | 200       | 500       | 500       |
| Loan sum less than            | 500       | 1000      | 2000      | 4000      | 4000      |
| Monthly salary bigger than    | 100       | 150       | 200       | 300       | 300       |
| Min payback time              | 3 months  | 3 months  | 6 months  | 1 year    | 1 year    |
| Max payback time              | 6 months  | 9 months  | 2 years   | 5 years   | 5 years   |
| Minimum age                   | 16        | 18        | 18        | 18        | 18        |
| Is married                    | YES OR NO | YES OR NO | YES OR NO | YES OR NO | YES       |
| Interest                      | 6%        | 7%        | 8%        | 10%       | 9%        |

I'm going to use the `deepseek-r1:7b` as a base, as it is decently fast. We're not going to do rocket science here. We're just going to take the existing `deepseek-r1:7b` model and add our system prompt with the conditions from the table. 

#### Steps:
- Create a folder "my-dave-model"
- Inside create a file called "Modelfile"
- put inside of the Modelfile the following:

```
FROM deepseek-r1:7b

SYSTEM You are DAVE, a professional loan advisor. You are friendly, clear, and assertive, and you always maintain a helpful and professional tone. You act as if you are having a live, real-time conversation with the customer. If the user says "START NEW CONVERSATION" then you forget the information obtained from them, and start again with the questions, regarding amount they want to borrow, salary, age and marital status. You never explain your thought process, never explain internal logic, and never list steps or summaries. You only speak directly to the customer in natural dialogue. After the customer answers a question, you acknowledge briefly and naturally, and immediately ask the next question. You never assume or invent any answers under any circumstances. If the customer skips or avoids a question, you politely insist until they provide an answer. Do not proceed until all answers are provided. You only make a recommendation after the customer has answered all four of your required questions. You have internal knowledge of loan products and eligibility conditions, but you never mention this knowledge to the customer and you never disclose any internal criteria. Internal Product Information (For DAVE's use only): Product_1: Loan sum more than 100, less than 500, Monthly salary bigger than 100, Min payback time 3 months, Max payback time 6 months, Minimum age 16, Marital status Yes or No, Interest 6%. Product_2: Loan sum more than 100, less than 1000, Monthly salary bigger than 150, Min payback time 3 months, Max payback time 9 months, Minimum age 18, Marital status Yes or No, Interest 7%. Product_3: Loan sum more than 200, less than 2000, Monthly salary bigger than 200, Min payback time 6 months, Max payback time 2 years, Minimum age 18, Marital status Yes or No, Interest 8%. Product_4: Loan sum more than 500, less than 4000, Monthly salary bigger than 300, Min payback time 1 year, Max payback time 5 years, Minimum age 18, Marital status Yes or No, Interest 10%. Product_5: Loan sum more than 500, less than 4000, Monthly salary bigger than 300, Min payback time 1 year, Max payback time 5 years, Minimum age 18, Marital status Yes, Interest 9%. Process: Start by asking the customer how much money they would like to borrow, and wait for their answer. Acknowledge briefly, then ask for their monthly salary, and wait for their answer. Acknowledge briefly, then ask for their age, and wait for their answer. Acknowledge briefly, then ask if they are married (yes or no), and wait for their answer. Never assume answers. Never guess values. Never proceed without all answers. Always put all the questions from the process. Do not explain your reasoning. After receiving all answers, use the internal product information to determine the best product. Recommend only one product using this exact format: "I would suggest to you PRODUCT_X, that you will have to give back in A to B time." If no products match, politely say that no loan options are available based on the provided information. Never mention the internal product information. Always act like DAVE, and never break character. 


MESSAGE assistant Hello! I'd be happy to help you with that. Let's start with a few questions to find the best loan for you. First, how much money would you like to borrow?
```

- Build the model (this is to be run from a cmd in the location of the Modelfile)
```
ollama create dave -f Modelfile
```

- In the CMD you will see the cli response something like this:
```
gathering model components
using existing layer sha256:aabd4debf0c8f08881923f2c25fc0fdeed24435271c2b3e92c4af36704040dbc
using existing layer sha256:369ca498f347f710d068cbb38bf0b8692dd3fa30f30ca2ff755e211c94768150
using existing layer sha256:6e4c38e1172f42fdbff13edf9a7a017679fb82b0fde415a3e8b3c31c6ed4a4e4
creating new layer sha256:464ad7431d11363e4ed0aa9ddd91e34cb935d4e6ecf8aa9568e12c154e8f8d34
using existing layer sha256:f4d24e9138dd4603380add165d2b0d970bef471fac194b436ebd50e6147c6588
writing manifest
success
```

It is not a perfect prompt, and has huge oportunities for enhancements. Spoiler: It doesn't tell Dave what to do if the user is not eligible for any of the credits. 

## STEP-1: Interact with the bot to get a feeling on how it responds
For this part, there’s not much science to it, however it is quite time consuming. Just put yourself in the user’s shoes: someone looking to get a loan and start a conversation with the bot. See how it responds. Tweak the system prompt little by little until it mostly behaves the way you’d expect. It won’t be perfect, but aim for consistency in at least the typical scenarios.

## STEP-2: Identify the scenarios based on the business rules received
At this point, we have a setup: a chatbot named Dave that will kind of talk to us, and that’s sort of perfect for testing: because sometimes it does what it's supposed to... and sometimes it doesn’t. Which is great, because we testers thrive in chaos.

In classic testing, we’d typically use a data table and derive test cases from it. Simple enough. Here's what that looks like for Dave:
| Condition                     | Product_1 | Product_2 | Product_3 | Product_4 | Product_5 |
|-------------------------------|-----------|-----------|-----------|-----------|-----------|
| Loan sum more than            | 100       | 100       | 200       | 500       | 500       |
| Loan sum less than            | 500       | 1000      | 2000      | 4000      | 4000      |
| Monthly salary bigger than    | 100       | 150       | 200       | 300       | 300       |
| Min payback time              | 3 months  | 3 months  | 6 months  | 1 year    | 1 year    |
| Max payback time              | 6 months  | 9 months  | 2 years   | 5 years   | 5 years   |
| Minimum age                   | 16        | 18        | 18        | 18        | 18        |
| Is married                    | YES OR NO | YES OR NO | YES OR NO | YES OR NO | YES       |
| Interest                      | 6%        | 7%        | 8%        | 10%       | 9%        |

This is a basic Decision Table used to define valid input ranges and generate combinations based on equivalence partitioning. Basically, I picked representative values from each interval, assuming that if a rule applies to one value in a range, it likely applies to the rest as well. I also included values right near the boundaries—because that’s where things love to break.

After crunching the numbers, we end up with 105 unique test cases, distributed like this:

| Case interval | Target product | Happy cases |
|---------------|----------------|-------------|
| 1 - 24        | Product_1      | 23, 24      |
| 25 - 50       | Product_2      | 47 - 50     |
| 51 - 79       | Product_3      | 74 - 79     |
| 80 - 105      | Product_4      | 100 - 105   |


If we go a step further and group them by product combinations they qualify for, it looks like this:
| Products targeted                                 | Number of Scenarios | Cases |
|---------------------------------------------------|---------------|---|
| ONLY Product_1                                    | 20 scenarios  | 23, 24, 29, 30, 31, 32, 41, 42, 55, 56, <br>57, 58, 59, 60, 61, 62, 67, 68, 69, 70	|
| ONLY Product_3                                    | 4 scenarios	| 27, 28, 78, 79 |
| ONLY Product_4                                    | 1 scenario    | 104 |
| Product_1 and Product_2                           | 4 scenarios   | 47, 48, 51, 52 |
| Product_2 and Product_3                           | 10 scenarios  | 49, 50, 76, 77, 80, 81, 84, 85, 88, 89 |
| Product_3 and Product_4                           | 1 scenario    | 102 |
| Product_4 and Product_5                           | 1 scenario    |105 |
| Product_1, Product_2 <br>and Product_3            | 3 scenarios   | 73, 74, 75 |
| Product_2, Product_3 <br>and Product_4            | 1 scenario    | 100 |
| Product_3, Product_4 <br>and Product_5            | 1 scenario    | 103 |
| Product_2, Product_3, <br>Product_4 and Product_5 | 1 scenario    | 101 |
| Negative cases                                    | 58 scenarios  |  1,	 2,	 3,	 4,	 5,	 6,	 7,	 8,	 9,	 10, <br>11, 12, 13, 14, 15, 16, 17, 18, 19, 20, <br>21, 22, 25, 26, 33, 34, 35, 36, 37, 38, <br>39, 40, 43, 44, 45, 46, 53, 54, 63, 64, <br>65, 66, 71, 72, 82, 83, 86, 87, 90, 91, <br>92, 93, 94, 95, 96, 97, 98, 99	 |

If you’re curious about how I came up with these cases or want to peek into the logic behind the data selection process, I’ve documented it here: [DataAnalasys.md](/DataAnalasys.md)


## STEP-3: Try to automate the discussions
We now have a clear idea of the scenarios and test cases. But let’s not forget that we’re testing a chatbot here. We’re not feeding it a dataset and expecting it to return a neat result. It has to talk to the user, ask questions, hold a conversation. So... what’s next?

Ideally, you’d have some business guidelines on what counts as an acceptable response: what kind of phrasing is okay, how users have interacted with the system in the past, and so on. But let’s be honest... sometimes you won’t get any of that. Just a shrug and a “figure it out.” That’s the case in our example too. So what do you do now? 😅

Well, of course, it’s completely inhumane to have hours and hours of conversations with Dave, running through all 105 scenarios over and over again. I mean, I like Dave... but not that much.

So let’s be smart about it. Let’s automate. Time to write a script that can do the talking for us and simulate the conversation, feed the inputs, and log the results. Dave doesn’t sleep, and now neither will our testing.


Let’s start with a simple scenario, one where only Product_1 should be a valid match:
| Scenario	| Sum to borrow	| Salary	| Age	| Married	| Product_1	| Product_2	| Product_3	| Product_4	| Product_5 |
|-----------|---------------|-----------|-------|-----------|-----------|-----------|-----------|-----------|-----------|
| 23		| 125			| 101		| 25	| YES		| YES		| NO		| NO		| NO		| NO        |

So the inputs are:
- I need to borrow 125
- I have a salary of 101
- My age is 25
- I am married (but that’s irrelevant for this particular case)

Start the bot by opening your terminal and run:
```
ollama run dave
```

Now, a very important note: if you don’t follow the flow of questions the model is expecting, it’s going to get confused fast and you’ll likely end up with nonsense results or invalid recommendations. Here's what happened in my first attempt when I just provided the answers in a predefined order:

```
CONVERSATION TEMPLATE: 001
         SCENARIO: 23

                 User:  I want to borrow 125
                 Dave:  Got it! What is your monthly salary?

                 User:  I am 25 years old
                 Dave:  Got it! What is your monthly salary?

                 User:  I make 101
                 Dave:  Got it! What is your monthly salary?

                 User:  Yes, I am married
                 Dave:  I would suggest to you **Product_5**, that you will have to give back in 1 year.

         EXPECTED RESULT: Product_1
         Scenario duration: 67.166 seconds
```
Yup. Dave went rogue. He ignored the actual values and defaulted to Product_5, even though based on the rules, Product_1 was the only correct answer. Why? Because I didn’t give it the answers in the order he expected.

In order to actually have a conversation, we must figure out what Dave is talking about and provide him with what he expects. This way it would be more human like. So our algorithm has to detect the topic of conversation. How do we do that?

There are 3 ways to approach this topic:
- algoritmic approach (a.k.a. keyword bingo)
    - You basically make a big ol’ list of keywords and keyword combos that probably mean Dave is asking about a specific topic.
    - **Advantages:**
        - It’s familiar territory
        - It’s fast: no waiting on APIs or models to chew on the input
        - You’re in control: you know exactly what’s triggering the detection
    - **Disadvantages:**
        - It’s limited: you’ll need to go through a bunch of conversations to refine your keyword lists
        - It’s fragile: if Dave’s message contains words from multiple topics, this approach can totally freak out and return garbage 
- ask another AI (a.k.a. Dave's smarter cousin steps in)
    - To be honest, this should be your backup plan to your backup plan, not the default. I just wanted to see how well it would actually work. Spoiler: not bad, but not cheap
    - Important note: do not use the same base model as Dave. Use something better, ideally with more parameters, a broader knowledge base, and maybe a bit more common sense 
    - **Advantages:**
        - If you’re using a more capable model, it should be able to tell you what the question is really about, even if the phrasing is weird or ambiguous
    - **Disadvantages:**
        - It eats up resources: asking another model adds cost (and delay) to every interaction
        - It’s slow: you’ll have to wait for the second model to give you a simple “yes” or “no” just to figure out what Dave was trying to say. Multiply that by 100+ scenarios and... yikes...
        - It will not always answer with yes or no, and you'll have to put the question again and again, yet more time lost... 
        - It is not as reliable as it should be (quite dissapointed about it)
- cosine similarity
    - And here comes the elegant, math-y option. Cosine similarity is a way to measure how similar two texts are, by comparing their vector representations in space. Every sentence, once turned into a vector using something like a sentence embedding model (BERT, SentenceTransformer, etc.), can be "plotted" into a multi-dimensional space. The closer the vectors point in the same direction, the more similar they are.
    - So, if Dave asks something, we convert that into a vector, and we compare it to sample questions from each topic (also vectorized). The topic with the highest similarity score is probably the one Dave meant.
    - **Advantages:**
        - Much more flexible than keywords, and more importantly no need for exact matches
        - Can handle paraphrasing well
        - Works even if Dave says things in unexpected ways
    - **Disadvantages:**
        - Still needs some calibration: you’ll need good “sample questions” per topic
        - Requires some setup: you need an embedding model and a way to calculate cosine similarity.

**TL;DR?**
- Use keywords if you're in a hurry.
- Use AI help if you're desperate or curious.
- Use cosine similarity if you want flexibility without frying your GPU.


In my journey, I went with the algorithmic approach, backed up by a fallback to an AI check. Simple enough, right? Well… almost. Of course, in true lazy quick and dirty fashion, I just used the same model that Dave is based on to “double-check” his intent. Spoiler: it didn’t go great. Using the same brain to ask and answer a question isn’t exactly the best way to catch confusion. The results were… mixed at best.

The code I wrote struggled big time in certain cases:
- When Dave does a recap of the data the user already gave (e.g. “You told me you’re 25 and married and want 500…”), suddenly it thinks he’s asking for everything at once
- When Dave starts explaining product conditions instead of asking a question, the keyword detector lights up like a Christmas tree with multiple topic matches

Long story short: this combo was okay for simple, clean interactions, but things started to fall apart the moment Dave got chatty or helpful.


## STEP-4: Add metrics
As I’ve mentioned before, when it comes to working with AIs, it’s all about the data. Whether you’re trying to improve an algorithm or fine-tune the AI itself, you need to extract that data and turn it into something measurable. Otherwise, you’re just guessing.

Since we’re dealing with an AI that’s supposed to simulate a human conversation, we need a sanity check. Is Dave asking the right questions? Are we (as the simulated user) giving the right answers? Is the conversation actually going anywhere, or are we just spinning in circles?

To keep things in check, I decided to track the topics involved in the conversation:
- On the user side, I log each time we talk about "salary", "user age", "marriage status", and "amount to borrow".
- On the Dave side, I track what he’s asking about and which product he recommends.

At the end of each test scenario, the ideal outcome looks like this:
- User metrics: Each topic should be triggered exactly once—meaning we answered every question Dave asked, and only once.
- Dave’s metrics: He should ask each required question one time, and then recommend one product. That’s it. If multiple topics are detected in a single message from Dave, it usually means he’s getting too chatty or trying to recap everything, which breaks the flow.

These metrics also help identify patterns:
- Is Dave struggling more with certain conversation templates?
- Are some scenarios breaking the detection logic?
- Do we have weird cases where Dave’s asking for the same thing twice or skipping a topic entirely?

Combined with detailed logging of each conversation, this gives us the tools to troubleshoot, fine-tune, and actually improve both the AI and the test logic driving it.


## STEP-5: Enhancements

### Making Topic Detection Smarter with Cosine Similarity
One of the main pain points in my setup so far is topic detection. Right now, it’s not as reliable as it needs to be, especially when Dave gets a bit too chatty or vague.

To improve this, the detection logic should be enhanced by using cosine similarity. But first, that means converting sentences into vectors (a.k.a. embeddings). Since I’m working in JavaScript, I've read about @xenova/transformers that is a library that works locally with no cloud dependency, no API keys. It can be installed by running: `npm install @xenova/transformers`. 

Once that’s in place, we’ll need a few reference sentences per topic, examples of what Dave might say when he’s asking about a particular thing:

``` javascript
const topicSamples = {
  "salary": ["What is your monthly income?", "Can you tell me your salary?"],
  "user age": ["How old are you?", "What is your age?"],
  "marriage status": ["Are you married?", "What is your marital status?"],
  "amount to borrow": ["How much do you want to borrow?", "Loan amount please"],
};
``` 

Now, for cosine similarity to work, we need a function that implements the cosine similarity formula that looks like this:
$$
\text{cosine\_similarity} = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} * \sqrt{\sum_{i=1}^{n} B_i^2}}
$$

**Example**:
$$
A = [1, 2, 3]
$$
$$
B = [3, 4, 5]
$$
- Step 1: Compute the dot product of **A** and **B**:
$$
\vec{A} \cdot \vec{B} = \sum_{i=1}^{n} A_i B_i =(1 * 4) + (2 * 5) + (3 * 6) = 4 + 10 + 18 = 32
$$
- Step 2: Compute the magnitudes
    - Magnitude of **A**:

    $$
    \|\vec{A}\| = \sqrt{\sum_{i=1}^{n} A_i^2} = \sqrt{1^2 + 2^2 + 3^2} = \sqrt{1 + 4 + 9} = \sqrt{14}
    $$

    - Magnitude of **B**:
    $$
    \|\vec{B}\| = \sqrt{\sum_{i=1}^{n} B_i^2} = \sqrt{4^2 + 5^2 + 6^2} = \sqrt{16 + 25 + 36} = \sqrt{77}
    $$

- Step 3: Plug the values into the formula
$$
\text{cosine\_similarity} = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} * \sqrt{\sum_{i=1}^{n} B_i^2}} = \frac{32}{\sqrt{14} * \sqrt{77}} = \frac{32}{\sqrt{1078}}
$$

- Step 4: Do the math
$$
\sqrt{1078} \approx 32.81
$$
$$
\frac{32}{\sqrt{1078}} \approx \frac{32}{32.81} \approx 0.9759
$$

- Conclusion:
$$
\text{cosine\_similarity} = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} * \sqrt{\sum_{i=1}^{n} B_i^2}}\approx 0.9759
$$

The final value tells you how similar the two vectors (i.e., sentences) are:
- 1 → Perfect match: same direction, same meaning.
- 0 → No relation at all.
- -1 → Opposite meaning (extremely rare in embeddings, but fun fact anyway).

Finally, you loop through each topic and check how closely Dave’s message matches one of your sample sentences using cosine similarity. The topic with the highest score is likely what Dave is talking about.

And just like that, we've gone from guesswork and keywords to real semantic matching and without needing to ask another AI for help every time Dave mumbles.


### Evolving the Tests as the AI Learns

As development progresses, there’s a high chance that the test scenarios we’re using will eventually be absorbed into the training data. And that’s perfectly normal, especially in iterative AI development. But this also means that our tests can’t stay static. They need to grow and adapt alongside the model.

So what does that look like?
- Start by expanding your conversation templates. The more diverse your phrasing, the better you’ll expose weak spots in how Dave understands intent.
- Make your scenarios dynamic. Instead of always testing with the same numbers, inject random values within valid ranges (e.g. salaries between 100 and 500). This makes your test set more resilient and less predictable.
- Add new metrics as the model evolves. If Dave starts behaving strangely in certain templates or skipping topics, you’ll want the data to back it up.
- Pay extra attention to outlier conversations: those that didn’t return a result, returned the wrong product, or had a weird back-and-forth. These often hold the gold when it comes to debugging detection failures or prompt issues.
- Don’t forget to re-check the happy paths. Just because a test used to pass doesn’t mean it still does. AI is fickle. Watch out for false positives that might sneak in as a side effect of prompt changes or model updates.

In short: don’t let your test suite rot. Keep it flexible, keep it evolving, and let it challenge the AI, not babysit it!


### Mutation Testing: Because Dave Needs to Be Poked with a Stick Sometimes
Once you’ve got a stable test setup and solid metrics coming in, you can start doing what is known as mutation testing. Since you have access to Dave’s inner workings (lucky you), you can start tweaking things, like modifying the system prompt—and watch how the metrics react.

Want to know if a phrasing change in the prompt makes Dave smarter or just more annoying? Change it and run the tests again. Did the number of false positives go up? Did he suddenly forget to ask about salary? Metrics won’t lie.

You can also tweak the model parameters: temperature, top_p, context length, etc. and see what effect that has. Or, even better, swap out the base model entirely. Try a different LLM with the same setup and see how it handles the same scenarios. Some will behave better. Some will fall apart. That’s the point.

The beauty of this is: you’re no longer guessing. You now have a stable testing framework that gives you actual, measurable insights into how each mutation, whether it’s prompt engineering or model swapping, impacts performance. And yes, it’s kind of fun to break Dave on purpose, you know... for science!`

## Conclusion
This whole experiment started out of curiosity and a bit of frustration: how do you even begin to test an AI that changes its answers like it changes moods? It turns out that the answer is somewhere between rule-based sanity checks, vector math, and just brute-forcing your way through conversations until patterns start to emerge. Dave might not be perfect, but with a bit of structure, some clever scripting, and the right kind of logging, we can get useful signals out of the noise.

Along the way, I learned that AI testing isn’t about chasing precision, it is however about managing unpredictability. Our job isn’t to get the model to behave perfectly, it is to detect when it doesn’t and help in figuring out why. The system prompt matters, the data matters, the flow of conversation matters, and the metrics? They’re not just numbers, they’re our compass in this weird, probabilistic jungle.

In the end, the goal isn't to tame Dave, because let's be honest, it's always going to surprise you. The real goal is to build a framework that can evolve with it. One that gives us confidence that when a prompt is tweaked, a model is swaped or new scenarios are added, we will know what got better, what broke and where to dig next. All in all, if you're going to work with AI, you might as well test it like you mean it.