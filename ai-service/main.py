import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

from chatbot_utility import is_rag_available
from quiz_agent import run_quiz_agent

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

working_dir = os.path.dirname(os.path.abspath(__file__))
chapters_vector_db_dir = f"{working_dir}/chapters_vector_db"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    subject: str
    chapter: str
    history: List[Message]
    question: str


def get_rag_answer(chapter: str, history: List[Message], question: str) -> str:
    vector_db_path = f"{chapters_vector_db_dir}/{chapter}"
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = Chroma(persist_directory=vector_db_path, embedding_function=embeddings)
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
    memory = ConversationBufferMemory(llm=llm, output_key="answer", memory_key="chat_history", return_messages=True)
    # Restore memory from history
    for i in range(0, len(history) - 1, 2):
        if i + 1 < len(history):
            memory.chat_memory.add_user_message(history[i].content)
            memory.chat_memory.add_ai_message(history[i + 1].content)
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        memory=memory,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 3}),
        return_source_documents=True,
        get_chat_history=lambda h: h,
    )
    response = chain({"question": question})
    return response["answer"]


def get_grounded_answer(subject: str, chapter: str, history: List[Message], question: str) -> str:
    system_instruction = (
        f"You are a helpful tutor for NCERT Class 12 {subject}. "
        f"Answer questions strictly based on NCERT Class 12 {subject} - {chapter}. "
        "Be concise, accurate, and student-friendly."
    )
    contents = [
        types.Content(role=msg.role, parts=[types.Part(text=msg.content)])
        for msg in history
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=question)]))
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())],
        ),
    )
    return response.text


@app.post("/chat")
def chat(req: ChatRequest):
    if is_rag_available(req.chapter):
        answer = get_rag_answer(req.chapter, req.history, req.question)
    else:
        answer = get_grounded_answer(req.subject, req.chapter, req.history, req.question)
    return {"answer": answer}


@app.get("/health")
def health():
    return {"status": "ok"}


class QuizRequest(BaseModel):
    subject: str
    chapter: str
    num_questions: int = 10
    difficulty: str = "mixed"  # easy | medium | hard | mixed


@app.post("/quiz")
def generate_quiz(req: QuizRequest):
    try:
        questions = run_quiz_agent(req.subject, req.chapter, req.num_questions, req.difficulty)
        return {"questions": questions}
    except Exception as e:
        msg = str(e)
        status = 503 if "503" in msg or "UNAVAILABLE" in msg else 500
        raise HTTPException(status_code=status, detail=msg)
