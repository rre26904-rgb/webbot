from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- المخططات (Schemas) ---
class UserAuth(BaseModel):
    username: str
    password: str

class QuestionData(BaseModel):
    category_name: str
    question_text: str
    correct_answer: str
    points: int

# --- مسارات تسجيل الدخول ---
@app.post("/login")
def login(user: UserAuth, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        # إذا لم يكن مسجلاً، ننشئ له حساباً جديداً
        new_user = models.User(username=user.username, password=user.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "تم التسجيل بنجاح", "user": new_user}
    
    if db_user.password != user.password:
        raise HTTPException(status_code=400, detail="كلمة المرور خاطئة")
    return {"message": "تم تسجيل الدخول", "user": db_user}

# --- مسارات لوحة التحكم (التحكم الكامل بالداتا) ---
@app.post("/admin/questions")
def add_question(q: QuestionData, db: Session = Depends(database.get_db)):
    new_q = models.Question(**q.dict())
    db.add(new_q)
    db.commit()
    return {"message": "تمت إضافة السؤال بنجاح"}

@app.get("/admin/questions")
def get_all_questions(db: Session = Depends(database.get_db)):
    return db.query(models.Question).all()