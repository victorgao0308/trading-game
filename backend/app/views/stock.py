from decimal import Decimal, ROUND_DOWN
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Stock
import random
import json
import os
import pandas as pd
from app.data.data_processing.compress_data import uncompress_data


def create_stock(seed, total_ticks):
    stock = Stock()

    # set the seed
    random.seed(seed)

    # select a random stock meta data
    with open("app/data/stocks_meta.json", "r") as file:
        data = json.load(file)
    data = random.choice(data)

    # select random historical stock to derive prices from
    stocks = [f for f in os.listdir("app/data/compressed_data") if os.path.isfile(os.path.join("app/data/compressed_data", f))]
    if stocks is None:
        return None
    
    underlying_stock = random.choice(stocks)

    stock.underlying_stock = underlying_stock[:-11]

    prices = uncompress_data(underlying_stock)


    # make sure we have enough points to generate data for
    # total data points needed is total_ticks
    # save space to generate 10 initial points

    start_index = random.randint(0, len(prices) - total_ticks - 11)
    initial_prices = prices[start_index:start_index + 10]

    stock.first_tick_index = start_index
    stock.ticks_generated = 0
    stock.next_values = prices[start_index + 10 : start_index + 10 + total_ticks]

    stock.current_price = initial_prices[-1]
    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock, initial_prices


    



    