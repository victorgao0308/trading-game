import pandas as pd
from decimal import Decimal, ROUND_HALF_UP
import math
from bitarray import bitarray
import os

# removes all columns except for CLOSE (price at end of day)
def process_data(fileName):
    filePath = f'../raw_data/{fileName}'

    data = pd.read_csv(filePath)
    data = data["<CLOSE>"].to_list()

    df = pd.DataFrame(data, columns=["Price"])
    df.to_csv(f'../compressed_data/{fileName}')


# compresses file down
# check FORMAT.md inside of app/data/ for how the compression works
def compress_data(fileName):
    filePath = f'../raw_data/{fileName}'


    # only read in the CLOSE column (stock prices at day close)
    # ignore the indexing columm pandas adds
    data = pd.read_csv(filePath)
    data = data["<CLOSE>"].to_list()


    # read in as decimal to avoid floating point imprecision
    data = [Decimal(str(num)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for num in data]


    # array to hold elements of binary string together
    # build the string at the end
    # more efficient than constantly having to create new strings
    # save index 0 for the offset
    binary_string = ['']


    # store first price in cents as a binary string of length 27
    binary_string.append(f'{int(data[0] * 100):027b}')


    for i in range(len(data) - 1):
        diff = int((data[i + 1] - data[i]) * 100)
        sign = '0' if diff < 0 else '1'

        diff = abs(diff)


        # number of bits required for this value, store it in a binary string of length 5
        bits = math.ceil(math.log2(diff + 1)) if diff > 0 else 0
        binary_string.append(f'{bits:05b}')


        # difference is 0, continue to next entry
        if diff == 0:
            continue


        # positive / negative bit
        binary_string.append(sign)

        # finally, add in the binary representation of the difference
        # remove the leading digit (always a 1)
        binary_string.append(f'{diff:b}'[1:])


    # get total length of strings, calculate offset to make it a multiple of 8
    # add 3 to account for the bits needed to store the offset
    total_len = sum(len(s) for s in binary_string) + 3

    offset = (8 - (total_len % 8)) % 8
    binary_string[0] = f'{offset:03b}'
    binary_string.append('0' * offset)
    total_len = sum(len(s) for s in binary_string)


    binary_string = "".join(binary_string)


    ba = bitarray(binary_string)
    with open(f'../compressed_data/{fileName}.bin', 'wb') as f:
        ba.tofile(f)


# uncompresses a compressed file; returns an array of numPoints values starting at index start
def uncompress_data(fileName, start, numPoints):
    filePath = f'app/data/compressed_data/{fileName}'
    ba = bitarray()
    with open(filePath, 'rb') as f:
        ba.fromfile(f)

    ba = ba.to01()

    # read in the offset and trim it off
    offset = int(ba[:3], 2)

    ba = ba[3:len(ba) - offset]


    ba = ba[16:]

    prices = []


    # read in initial value
    prev_value = Decimal(str(int(ba[:27], 2) / 100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    num_processed = 1

    if start == 0:
        prices.append(prev_value)

    # current index
    i = 27

    while i < len(ba):
        if len(prices) >= numPoints:
            break

        bits_to_read = int(ba[i: i + 5], 2)
        i += 5

        num_processed += 1

        # no change in price, continue
        if bits_to_read == 0:
            if num_processed >= start:
                prices.append(prev_value)
            continue

        # read in bit for positive/negative change
        bit_sign = ba[i]
        i += 1
        sign = -1 if bit_sign == "0" else 1

        # read in the next bits_to_read bytes for the difference
        # add the 1 back in 
        diff = Decimal(str(sign * int("1" + ba[i : i + bits_to_read - 1], 2))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        i += bits_to_read - 1

        if num_processed >= start:
            prices.append(prev_value + diff / 100)

        prev_value = prev_value + diff / 100
    return prices


# process_data("aapl.us.txt")
# compress_data("aapl.us.txt")
# uncompress_data("aapl.us.txt")

# files = [f for f in os.listdir("app/data/compressed_data") if os.path.isfile(os.path.join("app/data/compressed_data", f))]
