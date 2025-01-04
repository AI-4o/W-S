import os
import sys
from PIL import Image
import pytesseract
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

# set env variables
os.environ['LANGCHAIN_TRACING_V2'] = 'true'
os.environ['LANGCHAIN_ENDPOINT'] = 'https://api.smith.langchain.com'
os.environ['LANGCHAIN_API_KEY'] = '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'
os.environ['OPENAI_API_KEY'] = 'sk-aHDzHLLvkWdQgOO3K1DR7o3A_oOlIkh4HgifQYubJWT3BlbkFJCgBkegR8Rj76EGzzA5ZA-uId9hjrgGyCtkn631srgA'

# Specify the path to the Tesseract executable (if needed)
pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'

# Get the image path from command-line argument
if len(sys.argv) < 3:
    print("Please provide the image path and a prompt as arguments")
    sys.exit(1)

image_path = sys.argv[1]
external_prompt = sys.argv[2]

# Load the image
image = Image.open(image_path)


# Use pytesseract to perform OCR on the image
text = pytesseract.image_to_string(image)

# use gpt-4o-mini to extract the code number series from the text

class Code(BaseModel):
    code: str = Field(description="The code number series")
    
def extract_code(text):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    parser = PydanticOutputParser(pydantic_object=Code)
    
    prompt = ChatPromptTemplate.from_template(
        f"{external_prompt}.\n The output should be a valid JSON.\n"
        "{format_instructions}\n"
        "Text: {text}"
    )
    chain = prompt | llm | parser
    try:
        result = chain.invoke({
            "format_instructions": parser.get_format_instructions(),
            "text": text
        })
        return result.code
    except Exception as e:
        print(f"Error parsing output: {e}")
        print(f"The full text retrieved from the image is: {text}")
        return None

print(extract_code(text))