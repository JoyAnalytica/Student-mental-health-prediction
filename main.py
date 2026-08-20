from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal, Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import pickle
import pandas as pd

# Model Import
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/", response_class=HTMLResponse)
def read_root():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

class studentdata(BaseModel):
    age                     : Annotated[int, Field(..., ge=10, le=100)]
    gender                  : Annotated[str, Literal['Female','Male']]
    academic_level          : Annotated[str, Literal['Undergraduate', 'Graduate', 'High School']]
    most_used_platform      : Annotated[str, Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter','YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp','WeChat']]
    purpose_of_use          : Annotated[str, Literal['Networking', 'Education', 'Entertainment', 'News']]
    avg_daily_usage_hours   : Annotated[float, Field(..., ge=0, le=24)]
    daily_unlocks           : Annotated[int, Field(..., ge=0)]
    study_hours             : Annotated[float, Field(..., ge=0, le=24)]
    physical_activity_hours : Annotated[float, Field(..., ge=0, le=24)]
    sleep_hours_per_night   : Annotated[float, Field(..., ge=0, le=24)]
    stress_level            : Annotated[str, Literal['Medium', 'Low', 'Very High', 'High']]
    country                 : str

@app.post('/predict')
def student_predict(data: studentdata):

    valid_countries = ['Canada', 'USA', 'India', 'Australia', 'UK', 'Germany', 'France', 'Mexico', 'Turkey']
    c_group = data.country if data.country in valid_countries else 'Other'

    input_row = pd.DataFrame([{
        'Age'                         : data.age,
        'Gender'                      : data.gender,
        'Academic_Level'              : data.academic_level,
        'Most_Used_Platform'          : data.most_used_platform,
        'Purpose_Of_Use'              : data.purpose_of_use,
        'Avg_Daily_Usage_Hours'       : data.avg_daily_usage_hours,
        'Daily_Unlocks'               : data.daily_unlocks,
        'Study_Hours'                 : data.study_hours,
        'Physical_Activity_Hours'     : data.physical_activity_hours,
        'Sleep_Hours_Per_Night'       : data.sleep_hours_per_night,
        'Stress_Level'                : data.stress_level,
        'country_group'               : c_group
    }])

    pred_value = float(model.predict(input_row)[0])

    return {
        'score': pred_value,
        'prediction': pred_value,
        'predicted_score': pred_value
    }


