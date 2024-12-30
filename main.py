# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from datetime import datetime
import PyPDF2
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL")
print(f"Connecting to MongoDB at {MONGODB_URL}")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.pdf_quiz_db

# Models
class Question(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: int
    explanation: str

class Quiz(BaseModel):
    pdf_id: str
    questions: List[Question]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizAttempt(BaseModel):
    user_id: str
    quiz_id: str
    answers: List[int]
    score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
async def extract_text_from_pdf(file_path: str) -> str:
    print(f"Extracting text from PDF: {file_path}")
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    print(f"Extracted text: {text[:100]}...")  # Print first 100 characters for brevity
    return text

# Initialize the Cerebras client
client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY"),  # This is the default and can be omitted
)

async def generate_questions(text: str, num_questions: int) -> List[Question]:
    print(f"Generating {num_questions} questions based on text")
    prompt = f"""Generate {num_questions} multiple choice questions based on the following text.
        For each question, provide the following in the exact format specified:
        1. The question text
        2. Four possible answers
        3. The index of the correct answer (0-3)
        4. A brief explanation of why the answer is correct

        Text: {text[:4000]}  # Limiting text length for API constraints

        ***Strictly Format each question as: question|option1|option2|option3|option4|correct_index|explanation***

        Example:
        What is the capital of France?|Berlin|Madrid|Paris|Rome|2|Paris is the capital of France.

        Ensure each question follows this exact format without any deviations."""

    # Create the chat completion using Cerebras API
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3.1-8b",
    )

    questions = []
    response = chat_completion.choices[0].message.content

    print(response)
    for line in chat_completion.choices[0].message.content.split('\n'):
        if '|' in line:
            q, *options, correct_idx, explanation = line.split('|')
            questions.append(Question(
                question_text=q.strip(),
                options=options,
                correct_answer=int(correct_idx),
                explanation=explanation.strip()
            ))

    print(f"Generated {len(questions)} questions")
    return questions


@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    print(f"Uploading PDF: {file.filename}")

    # Read PDF file content
    content = await file.read()

    # Extract text from PDF content
    text = await extract_text_from_pdf(content)

    # Store extracted text in the database
    pdf_doc = {
        "filename": file.filename,
        "content": text,
        "uploaded_at": datetime.utcnow()
    }

    result = await db.pdfs.insert_one(pdf_doc)
    print(f"PDF uploaded with ID: {result.inserted_id}")

    return {"pdf_id": str(result.inserted_id)}

class GenerateQuizRequest(BaseModel):
    pdf_id: str
    num_questions: int
    previous_questions: Optional[List[dict]] = None
    student_answers: Optional[List[dict]] = None
    mistakes: Optional[List[int]] = None

@app.post("/api/generate-quiz")
async def generate_quiz(request: GenerateQuizRequest):
    print(f"Generating quiz for PDF ID: {request.pdf_id} with {request.num_questions} questions")

    # Fetch PDF content
    pdf = await db.pdfs.find_one({"_id": ObjectId(request.pdf_id)})
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # Optional: Fetch previous quiz and mistakes
    previous_data = {}
    if request.previous_questions:
        previous_data = {
            "previous_questions": request.previous_questions,
            "student_answers": request.student_answers,
            "mistakes": request.mistakes,
        }

    # Generate questions (modify prompt to incorporate previous data if provided)
    prompt = f"""
    Text: {pdf["content"][:4000]}  # Limiting text length for API constraints

    Previous Data: {previous_data}
    """

    # Cerebras integration remains the same
    questions = await generate_questions(prompt, request.num_questions)

    # Store the quiz
    quiz = {
        "pdf_id": request.pdf_id,
        "questions": [q.dict() for q in questions],
        "created_at": datetime.utcnow()
    }
    result = await db.quizzes.insert_one(quiz)

    return {
        "quiz_id": str(result.inserted_id),
        "questions": questions
    }



@app.post("/api/submit-attempt")
async def submit_attempt(attempt: QuizAttempt):
    print(f"Received attempt: {attempt}")
    print(f"Submitting attempt for quiz ID: {attempt.quiz_id}")
    quiz = await db.quizzes.find_one({"_id": ObjectId(attempt.quiz_id)})
    print(f"Found quiz: {quiz}")
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Calculate score
    correct_answers = 0
    total_questions = len(quiz["questions"])

    for i, (user_answer, question) in enumerate(zip(attempt.answers, quiz["questions"])):
        if user_answer == question["correct_answer"]:
            correct_answers += 1

    score = (correct_answers / total_questions) * 100
    print(f"Calculated score: {score}")

    # Store attempt
    attempt_dict = attempt.dict()
    attempt_dict["score"] = score

    result = await db.attempts.insert_one(attempt_dict)
    print(f"Attempt stored with ID: {result.inserted_id}")

    return {
        "attempt_id": str(result.inserted_id),
        "score": score
    }

@app.get("/api/user-attempts/{user_id}")
async def get_user_attempts(user_id: str):
    print(f"Fetching attempts for user ID: {user_id}")
    attempts = await db.attempts.find({"user_id": user_id}).to_list(length=100)
    print(f"Found {len(attempts)} attempts")
    return [
        {**attempt, "_id": str(attempt["_id"])}
        for attempt in attempts
    ]


@app.get("/api/pdfs")
async def list_pdfs():
    """Get list of all uploaded PDFs"""
    try:
        pdfs = await db.pdfs.find({}).to_list(length=100)
        return [{
            "id": str(pdf["_id"]),
            "filename": pdf["filename"],
            "uploaded_at": pdf["uploaded_at"]
        } for pdf in pdfs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    print(f"Fetching quiz with ID: {quiz_id}")
    quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    print(f"Found quiz: {quiz}")
    return {
        "quiz_id": str(quiz["_id"]),
        "pdf_id": quiz["pdf_id"],
        "questions": quiz["questions"],
        "created_at": quiz["created_at"]
    }

@app.get("/api/quizzes/pdf/{pdf_id}")
async def get_quizzes_by_pdf(pdf_id: str):
    print(f"Fetching quizzes for PDF ID: {pdf_id}")
    quizzes = await db.quizzes.find({"pdf_id": pdf_id}).to_list(length=100)
    if not quizzes:
        return {"message": "No quizzes found for this PDF"}
    return [
        {**quiz, "_id": str(quiz["_id"])}
        for quiz in quizzes
    ]


if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

