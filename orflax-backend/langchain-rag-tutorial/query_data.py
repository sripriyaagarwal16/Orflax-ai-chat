# import argparse
# # from dataclasses import dataclass
# from langchain_community.vectorstores import Chroma
# from langchain_openai import OpenAIEmbeddings
# from langchain_openai import ChatOpenAI
# from langchain.prompts import ChatPromptTemplate
# import json
#
# CHROMA_PATH = "chroma"
#
# PROMPT_TEMPLATE = """
# Answer the question based only on the following context:
#
# {context}
#
# ---
#
# Answer the question based on the above context: {question}
# """
#
#
# def main():
#     # Create CLI.
#     parser = argparse.ArgumentParser()
#     parser.add_argument("query_text", type=str, help="The query text.")
#     args = parser.parse_args()
#     query_text = args.query_text
#
#     # Prepare the DB.
#     embedding_function = OpenAIEmbeddings()
#     db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
#
#     # Search the DB.
#     results = db.similarity_search_with_relevance_scores(query_text, k=3)
#     if len(results) == 0 or results[0][1] < 0.7:
#         print(f"Unable to find matching results.")
#         return
#
#     context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
#     prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
#     prompt = prompt_template.format(context=context_text, question=query_text)
#     print(prompt)
#
#     model = ChatOpenAI()
#     response_text = model.predict(prompt)
#
#     sources = [doc.metadata.get("source", None) for doc, _score in results]
#     formatted_response = f"Response: {response_text}\nSources: {sources}"
#     output = {
#         "response": response_text,
#         "sources": sources
#     }
#     print(json.dumps(output))
#
# if __name__ == "__main__":
#     main()

# query_data.py

import argparse
import json
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

# Load environment variables from .env file
load_dotenv()

CHROMA_PATH = "chroma"

# This flexible prompt allows the model to use its own knowledge.
PROMPT_TEMPLATE = """
Use the following context to help answer the question. If the context is not relevant or does not contain the answer, answer the question using your own knowledge.

Context:
{context}

---

Question: {question}
"""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text

    # Prepare the embedding function and database connection.
    embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the database for relevant chunks.
    results = db.similarity_search_with_relevance_scores(query_text, k=3)

    # Initialize context and sources. They will be updated if relevant results are found.
    context_text = "No context provided."
    sources = []

    # Check if we found relevant results with a good score.
    if results and results[0][1] > 0.7:
        # If we have good results, format them into the context.
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        sources = [doc.metadata.get("source", None) for doc, _score in results]

    # Create the prompt from the template, now with either the found context or "No context provided."
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Call the language model to get a response.
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    response = model.invoke(prompt)
    response_text = response.content

    # Format the final JSON output. This will be the ONLY thing printed on success.
    # The "sources" will be an empty list if no context was used.
    output = {
        "response": response_text,
        "sources": sources
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()