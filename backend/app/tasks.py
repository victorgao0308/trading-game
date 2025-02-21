# /app/app/tasks.py
from celery import shared_task # type: ignore

@shared_task
def my_test_task():
    print("Celery task executed!")
    return "Task completed"
