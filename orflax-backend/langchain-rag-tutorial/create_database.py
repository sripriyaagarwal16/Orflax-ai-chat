# # from langchain.document_loaders import DirectoryLoader
# from langchain_community.document_loaders import DirectoryLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.schema import Document
# # from langchain.embeddings import OpenAIEmbeddings
# from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import Chroma
# import openai
# from dotenv import load_dotenv
# import os
# import shutil
#
# # Load environment variables. Assumes that project contains .env file with API keys
# load_dotenv()
# #---- Set OpenAI API key
# # Change environment variable name from "OPENAI_API_KEY" to the name given in
# # your .env file.
# openai.api_key = os.environ['OPENAI_API_KEY']
#
# CHROMA_PATH = "chroma"
# DATA_PATH = "data/books"
#
#
# def main():
#     generate_data_store()
#
#
# def generate_data_store():
#     documents = load_documents()
#     chunks = split_text(documents)
#     save_to_chroma(chunks)
#
#
# def load_documents():
#     loader = DirectoryLoader(DATA_PATH, glob="*.md")
#     documents = loader.load()
#     return documents
#
#
# def split_text(documents: list[Document]):
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=300,
#         chunk_overlap=100,
#         length_function=len,
#         add_start_index=True,
#     )
#     chunks = text_splitter.split_documents(documents)
#     print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
#
#     document = chunks[10]
#     print(document.page_content)
#     print(document.metadata)
#
#     return chunks
#
#
# def save_to_chroma(chunks: list[Document]):
#     # Clear out the database first.
#     if os.path.exists(CHROMA_PATH):
#         shutil.rmtree(CHROMA_PATH)
#
#     # Create a new DB from the documents.
#     db = Chroma.from_documents(
#         chunks, OpenAIEmbeddings(), persist_directory=CHROMA_PATH
#     )
#     db.persist()
#     print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")
#
#
# if __name__ == "__main__":
#     main()

# create_database.py

from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
# CHANGED: Import Google's embeddings class instead of OpenAI's
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv
import os
import shutil

# Load environment variables.
load_dotenv()

# REMOVED: No longer need to manually set the openai key.
# LangChain's Google integration will automatically use the GOOGLE_API_KEY from your .env file.

CHROMA_PATH = "chroma"
# NOTE: The provided file structure shows 'data/books' inside 'langchain-rag-tutorial'.
# Make sure this path is correct relative to where you run the script.
DATA_PATH = "data/books"


def main():
    generate_data_store()


def generate_data_store():
    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(chunks)


def load_documents():
    loader = DirectoryLoader(DATA_PATH, glob="*.md")
    documents = loader.load()
    return documents


def split_text(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

    # This print statement is for debugging and can be kept or removed.
    if len(chunks) > 10:
        document = chunks[10]
        print(document.page_content)
        print(document.metadata)

    return chunks


def save_to_chroma(chunks: list[Document]):
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)

    # CHANGED: Use GoogleGenerativeAIEmbeddings with a specific model.
    # "models/embedding-001" is Google's current text embedding model.
    db = Chroma.from_documents(
        chunks, GoogleGenerativeAIEmbeddings(model="models/embedding-001"), persist_directory=CHROMA_PATH
    )
    db.persist()
    print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")


if __name__ == "__main__":
    main()
