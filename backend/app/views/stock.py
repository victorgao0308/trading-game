from ..models import Stock
import random
import json
import os
from app.data.data_processing.compress_data import uncompress_data
from bitarray import bitarray


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


    # read in the number of entries in this file
    filePath = f'app/data/compressed_data/{underlying_stock}'
    ba = bitarray()
    with open(filePath, 'rb') as f:
        ba.fromfile(f)

    ba = ba.to01()


    # number of data points
    points = int(ba[3:19], 2)


    # pick a random place within the file to act as the starting  point
    start_index = random.randint(0, points - total_ticks - 11)

    # get data points
    prices = uncompress_data(underlying_stock, start_index, total_ticks + 10)


    # set initial prices
    initial_prices = prices[:10]

    stock.first_tick_index = start_index
    stock.ticks_generated = 0
    stock.next_values = prices[10:]
    stock.past_values = initial_prices

    stock.current_price = initial_prices[-1]
    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock, initial_prices


    



    