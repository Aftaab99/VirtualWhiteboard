
class PriorityQueue {

    constructor() {
        this.currentSize = 0;
        this.heap = [null];
        this.lastNode = 1;
    }

    _left(nodeIndex) {
        return nodeIndex * 2;
    }

    _right(nodeIndex) {
        return nodeIndex * 2 + 1;
    }

    _root(nodeIndex) {
        return Math.trunc(nodeIndex / 2);
    }

    add(item) {
        if (this.currentSize == 0) {
            this.heap.push(item);
            this.lastNode++;
            this.currentSize++;
        }
        else {
            this.heap.push(item);
            let cur = this.lastNode;
            this.lastNode++;
            this.currentSize++;

            while (cur != 1 && this.heap[cur].time < this.heap[this._root(cur)].time) {
                let t = this.heap[cur];
                this.heap[cur] = this.heap[this._root(cur)];
                this.heap[this._root(cur)] = t;
                cur = this._root(cur);
            }
        }
    }
    size() {
        return this.currentSize;
    }
    pop() {
        if (this.isEmpty()) {
            throw "Can't delete from empty queue";
        }

        if (this.currentSize == 1) {
            this.lastNode--;
            this.currentSize--;
            return this.heap.pop();
        }
        let ans = this.heap[1];
        this.heap[1] = this.heap.pop();

        this.lastNode--;
        this.currentSize--;
        let cur = 1, left = this._left(cur), right = this._right(cur);
        while (left < this.lastNode) {
            if (right < this.lastNode) {
                let minLeaf = (this.heap[left].time <= this.heap[right].time) ? left : right;
                if (this.heap[cur].time > this.heap[minLeaf].time) {
                    let t = this.heap[cur];
                    this.heap[cur] = this.heap[minLeaf];
                    this.heap[minLeaf] = t;
                    cur = minLeaf;
                }
                else
                    break;
            }
            else {
                if (this.heap[cur].time > this.heap[left].time) {
                    let t = this.heap[left];
                    this.heap[left] = this.heap[cur];
                    this.heap[cur] = t;
                }
                else 
                    break;
            }

            left = this._left(cur);
            right = this._right(cur);
        }

        return ans;
    }

    isEmpty() {
        return this.currentSize == 0;
    }

    peek() {
        if (this.currentSize == 0)
            return "Empty queue"
        return this.heap[1];
    }

    _print() {
        console.log(this.heap)
    }
}


let pq = new PriorityQueue();
console.log(pq.peek())
console.log(pq.isEmpty())
pq.add({ some_token: null, time: 101 })
pq.add({ some_token: null, time: 102 })
pq.add({ some_token: null, time: 92 })
pq.add({ some_token: null, time: 102 })
pq.add({ some_token: null, time: 132 })
pq.add({ some_token: null, time: 42 })
pq._print()
console.log(pq.lastNode)
console.log(pq.pop())
console.log(pq.pop())
console.log(pq.pop())
console.log(pq.pop())
console.log(pq.pop())
console.log(pq.pop())


