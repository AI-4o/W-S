from langchain_openai import ChatOpenAI
from langchain_community.document_loaders.text import TextLoader
from langchain_core.prompts import ChatPromptTemplate

m = ChatOpenAI(model="gpt-4o")

# load the document
file_path = "retrieved-text.txt"
loader = TextLoader(file_path)
docs = loader.load()

print('\nAbout the docs...: ', '\nlen: ', len(docs), '\npage 0: ', docs[0].page_content)
if(len(docs) == 0):
    print("No documents found")
else:
    pt = ChatPromptTemplate.from_messages(
        [("system", "Riassumi gli articoli che vengono dati in input," + 
          " indicando titoli e riassunti dei contenuti, la risposta deve essere in italiano, con un minimo di 50 parole." +
          " Gli articoli sono separati da '- end of article -'"), 
        ("user", "{text}")]
    )

    res = (pt | m).invoke({"text": docs}).content
    print('\n\nthe model response: \n\n',res)
    with open("summary.txt", "w") as file:
        file.write(res)
    print("Summary written in file summary.txt")
