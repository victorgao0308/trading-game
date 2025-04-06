import pandas as pd


def process_data(inputFile):
    data = pd.read_csv(inputFile)
    data = zip(data["Date"].to_list(), data["Close/Last"].to_list())

    df = pd.DataFrame(data, columns=["Date", "Price"])
    df.to_csv(f'../stock_prices/{inputFile}')


process_data("tsla.csv")

