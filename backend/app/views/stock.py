from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Stock
import random
import json


def create_stock(seed):
    stock = Stock()

    if seed != "":
        random.seed(seed)

    with open("app/data/stocks.json", "r") as file:
        data = json.load(file)

    data = random.choice(data)

    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock


    



    