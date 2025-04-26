## compressed file format

initial price and deltas are stored with cents as the denomination


3 bits to store the offset of the file (file size must be multiple of 8 bits, this specifies how many bits at the end are padding)

27 bits to store initial price (max initial price stored is 134217728 cents, $1,342,177.28)


Then, for each subsequent entry:
5 bits to store number of bits needed to encode the change in price between previous entry and this entry, call the value stored within these 5 bits x (max value of x is 31, and therefore, max delta that can be stored is 2^31)

1 bit to store positive/negative change (1 for positive, 0 for negative), this bit is not included in the count for x

x - 1 bits to store the change in price (this binary string will always begin with 1, so we can chop it off)

** if x == 0, then there is no bit representing positive/negative change; encoding just goes to the next entry **


