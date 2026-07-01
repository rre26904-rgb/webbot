from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    score = Column(Integer, default=0) # حفظ النقاط

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String, index=True) # اسم المربع (عواصم، فكك، الخ)
    question_text = Column(String) # الكلمة أو السؤال
    correct_answer = Column(String) # الجواب
    points = Column(Integer, default=10)