import os
from typing import Literal
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()

working_dir = os.path.dirname(os.path.abspath(__file__))
chapters_vector_db_dir = f"{working_dir}/chapters_vector_db"

RAG_CHAPTERS = {"6. Evolution", "12. Ecosystem"}

# ── Pydantic Models (structured, type-safe output) ──────────────────────────

class QuizQuestion(BaseModel):
    question: str = Field(description="The MCQ question text")
    options: dict[str, str] = Field(description="4 options keyed A, B, C, D")
    correct: Literal["A", "B", "C", "D"] = Field(description="The correct option key")
    difficulty: Literal["easy", "medium", "hard"] = Field(description="Question difficulty")
    explanation: str = Field(description="Why the correct answer is right")

class QuizOutput(BaseModel):
    questions: list[QuizQuestion] = Field(description="List of MCQ questions")

# ── Agent Dependencies (context passed to tools) ─────────────────────────────

class QuizDeps(BaseModel):
    subject: str
    chapter: str
    num_questions: int
    difficulty: str

    model_config = {"arbitrary_types_allowed": True}

# ── PydanticAI Agent ──────────────────────────────────────────────────────────

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")
model = GoogleModel("gemini-2.5-flash")

quiz_agent = Agent(
    model=model,
    deps_type=QuizDeps,
    output_type=QuizOutput,
    system_prompt="""You are an expert NCERT Class 12 quiz generator agent.

Your job is to generate high-quality MCQ questions by following the ReAct pattern:
1. THINK about what information you need
2. ACT by calling the appropriate tools
3. OBSERVE the results
4. REPEAT until you have everything needed

Always follow these steps IN ORDER:
1. Call get_difficulty_distribution to decide question counts per difficulty
2. Call retrieve_chapter_content to get relevant content
3. Generate exactly the required number of questions using the content
4. Ensure questions are strictly from NCERT curriculum

Return structured QuizOutput with the exact number of questions requested.""",
)

# ── Tools (Agent decides when and how to call these) ─────────────────────────

@quiz_agent.tool
def get_difficulty_distribution(ctx: RunContext[QuizDeps]) -> dict:
    """
    Analyze the requested difficulty and return how many questions
    of each difficulty level to generate.
    """
    num = ctx.deps.num_questions
    difficulty = ctx.deps.difficulty

    print(f"[ReAct] Thought: Need to plan {num} questions with difficulty={difficulty}")

    if difficulty == "easy":
        dist = {"easy": num, "medium": 0, "hard": 0}
    elif difficulty == "medium":
        dist = {"easy": 0, "medium": num, "hard": 0}
    elif difficulty == "hard":
        dist = {"easy": 0, "medium": 0, "hard": num}
    else:  # mixed
        easy = num // 3
        hard = num // 4
        medium = num - easy - hard
        dist = {"easy": easy, "medium": medium, "hard": hard}

    print(f"[ReAct] Action: distribute → Observation: {dist}")
    return dist


@quiz_agent.tool
def retrieve_chapter_content(ctx: RunContext[QuizDeps], query: str = "key concepts") -> str:
    """
    Retrieve relevant content from the chapter using RAG (for Biology Ch.6/12)
    or return structured topic description for other chapters.
    Use this to ground questions in actual NCERT content.
    """
    chapter = ctx.deps.chapter
    subject = ctx.deps.subject

    print(f"[ReAct] Thought: Need content for {subject} - {chapter}")
    print(f"[ReAct] Action: retrieve_chapter_content(query='{query}')")

    if chapter in RAG_CHAPTERS:
        try:
            vector_db_path = f"{chapters_vector_db_dir}/{chapter}"
            embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
            vectorstore = Chroma(persist_directory=vector_db_path, embedding_function=embeddings)
            docs = vectorstore.similarity_search(query, k=5)
            content = "\n\n".join([d.page_content for d in docs])
            print(f"[ReAct] Observation: RAG retrieved {len(content)} chars")
            return content
        except Exception as e:
            print(f"[ReAct] Observation: RAG failed ({e}), using topic description")

    content = f"NCERT Class 12 {subject} - {chapter}. Focus on key concepts, definitions, processes, and applications as per NCERT syllabus."
    print(f"[ReAct] Observation: Using topic description for grounding")
    return content


@quiz_agent.tool
def validate_question_count(ctx: RunContext[QuizDeps], generated_count: int) -> str:
    """
    Validate that the correct number of questions was generated.
    Call this after generating questions to confirm count matches requirement.
    """
    required = ctx.deps.num_questions
    print(f"[ReAct] Thought: Checking if {generated_count} == {required}")

    if generated_count == required:
        print(f"[ReAct] Observation: ✅ Count correct ({generated_count})")
        return f"✅ Correct: {generated_count} questions generated as required."
    else:
        print(f"[ReAct] Observation: ❌ Count mismatch, need {required - generated_count} more")
        return f"❌ Mismatch: generated {generated_count} but need {required}. Please add {required - generated_count} more questions."


# ── Runner ────────────────────────────────────────────────────────────────────

def run_quiz_agent(subject: str, chapter: str, num_questions: int, difficulty: str) -> list:
    print(f"\n{'='*50}")
    print(f"PydanticAI ReAct Quiz Agent")
    print(f"Subject: {subject} | Chapter: {chapter}")
    print(f"Questions: {num_questions} | Difficulty: {difficulty}")
    print(f"{'='*50}\n")

    deps = QuizDeps(
        subject=subject,
        chapter=chapter,
        num_questions=num_questions,
        difficulty=difficulty,
    )

    prompt = (
        f"Generate exactly {num_questions} MCQ questions for "
        f"NCERT Class 12 {subject} - {chapter}. "
        f"Difficulty: {difficulty}. "
        f"Use the tools to get difficulty distribution and chapter content first, "
        f"then validate the count matches {num_questions}."
    )

    result = quiz_agent.run_sync(prompt, deps=deps)

    questions = [q.model_dump() for q in result.output.questions]

    print(f"\n{'='*50}")
    print(f"✅ Agent complete: {len(questions)} questions generated")
    print(f"{'='*50}\n")

    return questions
