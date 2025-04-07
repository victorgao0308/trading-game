from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Stock
import random
import json
import os
import pandas as pd

def create_stock(seed, total_ticks):
    stock = Stock()

    # set the seed
    random.seed(seed)

    # select a random stock meta data
    with open("app/data/stocks_meta.json", "r") as file:
        data = json.load(file)
    data = random.choice(data)

    # select random historical stock to derive prices from
    stocks = [f for f in os.listdir("app/data/stock_prices") if os.path.isfile(os.path.join("app/data/stock_prices", f))]
    if stocks is None:
        return None
    
    underlying_stock = random.choice(stocks)
    stock_file = os.path.join("app/data/stock_prices", underlying_stock)

    stock.underlying_stock = stock_file

    # get random starting location within the historical stock data
    df = pd.read_csv(stock_file)
    total_data_points = df.shape[0]

    # make sure we have enough points to generate data for
    # total data points needed is total_ticks
    start_index = random.randint(total_ticks - 1, total_data_points - 1)
    stock.first_tick_index = start_index
    stock.ticks_generated = 0
    stock.current_price = -1

    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock


    



    