import OpenAI from "openai";
import "jQuery";
export const token = process.env['API_TOKEN'];
const openai = new OpenAI({ apiKey: token });

function get_high_risk_areas(date, num = 10){
    fetch('https://boasandreasen.github.io/testAPI/%d.json',date)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Work with your JSON data here

            const heatmap = data.data;

            console.log(data.data[0]);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    const top_values = [];
    heatmap.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (top_values.length < num) {
                top_values.push({ value, rowIndex, colIndex });
                top_values.sort((a, b) => a.value - b.value);
            } else if (value > top_values[0].value) {
                top_values[0] = { value, rowIndex, colIndex };
                top_values.sort((a, b) => a.value - b.value);
            }
        });
    });

    return top_values;
}

/*const tools = [
    {
        "type": "function",
        "function": {
            "name": "get_high_risk_areas",
            "description": "Parses a 2D list of datapoints which represent the risk of a fire starting in that location and returns however many points that the user wants that are above a threshold in the format risk, row, col",
            "parameters": {
                "type": "object",
                "properties": {
                    "heatmap": {
                        "type": "integer",
                        "description": "The date of the heatmap of the risk zones represented in a 2D list eg. 07/02/2024 would be 07022024 in the format DD/MM/YYYY",
                    },
                    "num": {
                        "type": "integer",
                        "description": "Max number of risk zones to be returned defaults to 10"
                    },
                },
                "required": ["heatmap"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The temperature unit to use. Infer this from the users location.",
                    },
                },
                "required": ["location", "format"],
            },
        }
    }
]*/

const tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The temperature unit to use. Infer this from the users location.",
                    },
                },
                "required": ["location", "format"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_n_day_weather_forecast",
            "description": "Get an N-day weather forecast",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The temperature unit to use. Infer this from the users location.",
                    },
                    "num_days": {
                        "type": "integer",
                        "description": "The number of days to forecast",
                    }
                },
                "required": ["location", "format", "num_days"]
            },
        }
    },
]

const messages = [
    {"role": "system", "content": "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous."},
    {"role": "user", "content": "What's the weather like today in cairo"}
]
const response = await openai.chat.completions.create({
        model:"gpt-3.5-turbo-0125",
        messages:messages,
        tools:tools
}
)
console.log(response["choices"][0]["message"]);

/*const response = await openai.chat.completions.create({
    model:"gpt-3.5-turbo-0125",
    messages:[
        //{"role": "system", "content": ""}
        //{"role": "user", "content": 'What are the coordinates of the top 5 risk zones on 03/07/2023'}
        {"role": "user", "content": "What's the weather like today in Glasgow"}
    ],
    tools: tools
})*/

//const text_response = response["choices"][0]["tool_calls"][0]["functionName"];

