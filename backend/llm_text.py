import boto3
import json

bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

modelId = "anthropic.claude-3-haiku-20240307-v1:0"

accept = "application/json"
contentType = "application/json"
system_prompt = "You are a helpful assistant. Do not give the user the answer directly, but guide them towards finding the answer."
user_prompt = "What is the derivative of 3x + 4?"

response = bedrock.invoke_model(
    modelId=modelId,
    contentType=contentType,
    accept=accept,
    body=json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": system_prompt + " " + user_prompt}]
                }
            ]
        }
    )
)

result = json.loads(response.get("body").read().decode('utf-8'))
input_tokens = result["usage"]["input_tokens"]
output_tokens = result["usage"]["output_tokens"]
output_list = result.get("content", [])

print("Invocation details: ")
print(f"- The input length is {input_tokens} tokens")
print(f"- The output length is {output_tokens} tokens")

print(f"- The model returned {len(output_list)} messages")

for output in output_list:
    print(output["text"])
