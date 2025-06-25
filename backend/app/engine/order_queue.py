import heapq

'''
priority queue implmentation that is used to order the buy and sell orders
upon loading a game, two priority queues are created: one for buy orders and one for sell orders
for the buy orders queue, it is ordered by descending price (highest bid is first)
for the sell orders queue, it is ordered by ascending price (lowest ask is first)
if tied, both are then ordered by ascending timestamp
'''

class OrderQueue:
    def __init__(self, orders, type):
        self.type = type
       
        # heap stores a list of tuples (price, timestamp, order)
        heap = []
        for order in orders:
            if type == "buy":
                heap.append((-order.price, order.timestamp, order))
            elif type == "sell":
                heap.append((order.price, order.timestamp, order))

        heapq.heapify(heap)
        self._heap = heap

    def push(self, order):
        if self.type == "buy":
            heapq.heappush(self._heap, (-order.price, order.timestamp, order))
        elif self.type =="sell":
            heapq.heappush(self._heap, (order.price, order.timestamp, order))

    def pop(self):
        _, _, order = heapq.heappop(self._heap)
        return order

    def peek(self):
        _, _, order = self._heap[0]
        return order

    def __len__(self):
        return len(self._heap)