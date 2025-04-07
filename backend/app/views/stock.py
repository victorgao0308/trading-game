from decimal import Decimal, ROUND_DOWN
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
    # save space to generate 10 initial points
    start_index = random.randint(total_ticks + 9, total_data_points - 1)
    stock.first_tick_index = start_index
    stock.ticks_generated = 10


    # get first 10 prices, & remove the $ in front
    initial_prices = list(df['Price'].iloc[start_index - 9: start_index + 1][::-1])
    for i in range(len(initial_prices)):
        initial_prices[i] = Decimal(initial_prices[i][1:]).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        stock.past_values.append(initial_prices[i])

    stock.current_price = initial_prices[-1]

    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock, initial_prices


    



    