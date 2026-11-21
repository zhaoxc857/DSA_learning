// ============================================================
// 03_队列.cpp
// 配套笔记：第 3 章 线性表的扩展 → 3.3 队列的实现
//
// 内容：循环队列 + 链队列
//
// 编译运行：
//   g++ -std=c++11 03_队列.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <queue>
using namespace std;

// ============================================================
// 一、循环队列（少用一个空间来区分空/满）
// ============================================================
template <class T>
class CirQueue {
private:
    T*  data;
    int maxSize;
    int front;      // 队头下标
    int rear;       // 队尾下标（指向"下一个空位"）

public:
    CirQueue(int size = 6) {
        maxSize = size;
        data = new T[maxSize];
        for (int i = 0; i < maxSize; i++) data[i] = T();   // 初始化为 0
        front = rear = 0;
    }
    ~CirQueue() { delete[] data; }

    bool Empty() const { return front == rear; }
    // ★ 判满：rear 的下一个就是 front
    bool Full() const { return (rear + 1) % maxSize == front; }

    // 元素个数
    int Size() const { return (rear - front + maxSize) % maxSize; }

    // 入队 O(1)
    void EnQueue(T x) {
        if (Full()) { cout << "[错误] 队满（最多存 " << maxSize-1 << " 个）" << endl; return; }
        data[rear] = x;
        rear = (rear + 1) % maxSize;      // ★ 循环后移
    }

    // 出队 O(1)
    T DeQueue() {
        if (Empty()) { cout << "[错误] 队空" << endl; return T(); }
        T x = data[front];
        front = (front + 1) % maxSize;    // ★ 循环后移
        return x;
    }

    T Front() const { return Empty() ? T() : data[front]; }
    T Back()  const { return Empty() ? T() : data[(rear - 1 + maxSize) % maxSize]; }

    // 打印内部状态（便于理解循环队列）
    void Debug(const string& tag = "") const {
        cout << "  [" << tag << "] data=[";
        for (int i = 0; i < maxSize; i++) {
            cout << data[i];
            if (i < maxSize - 1) cout << ",";
        }
        cout << "] front=" << front << " rear=" << rear
             << " size=" << Size();
        if (Empty()) cout << " (空)";
        else if (Full()) cout << " (满)";
        cout << endl;
    }
};

// ============================================================
// 二、链队列
// ============================================================
template <class T>
struct QNode {
    T data;
    QNode* next;
};

template <class T>
class LinkQueue {
private:
    QNode<T>* front;    // 队头指针（指向头节点）
    QNode<T>* rear;     // 队尾指针

public:
    LinkQueue() {
        front = rear = new QNode<T>;    // 头节点
        front->next = nullptr;
    }
    ~LinkQueue() {
        while (front) {
            QNode<T>* p = front;
            front = front->next;
            delete p;
        }
    }

    bool Empty() const { return front == rear; }

    void EnQueue(T x) {
        QNode<T>* s = new QNode<T>;
        s->data = x;
        s->next = nullptr;
        rear->next = s;       // 接到队尾
        rear = s;             // rear 后移
    }

    T DeQueue() {
        if (Empty()) { cout << "[错误] 队空" << endl; return T(); }
        QNode<T>* p = front->next;
        T x = p->data;
        front->next = p->next;
        if (rear == p) rear = front;   // ★ 删的是最后一个，修正 rear
        delete p;
        return x;
    }

    T Front() const { return Empty() ? T() : front->next->data; }
    T Back()  const { return Empty() ? T() : rear->data; }

    void Print() const {
        cout << "队列（头→尾）: ";
        QNode<T>* p = front->next;
        while (p) { cout << p->data << " "; p = p->next; }
        cout << endl;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  队列 演示" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 循环队列基本操作 ----------
    cout << "【1. 循环队列基本操作】（maxSize=6，最多存 5 个）" << endl;
    CirQueue<int> q(6);
    q.Debug("初始");

    for (int i = 1; i <= 4; i++) {
        q.EnQueue(i * 10);
        q.Debug("EnQueue(" + to_string(i*10) + ")");
    }

    cout << "  队头 Front() = " << q.Front() << endl;
    cout << "  队尾 Back()  = " << q.Back() << endl;
    cout << "  元素个数 = " << q.Size() << endl << endl;

    // ---------- 2. 演示"循环"（关键！） ----------
    cout << "【2. 演示循环：出队后再入队，rear 会绕回开头】" << endl;
    cout << "  出队两个: " << q.DeQueue() << ", " << q.DeQueue() << endl;
    q.Debug("出队后");

    cout << "  现在入队 50、60、70（观察 rear 绕回）" << endl;
    q.EnQueue(50); q.Debug("EnQueue(50)");
    q.EnQueue(60); q.Debug("EnQueue(60)");
    q.EnQueue(70); q.Debug("EnQueue(70)");
    cout << "  → 注意 rear 从 5 绕回到了 0！这就是 [循环] 队列" << endl << endl;

    // ---------- 3. 判满测试 ----------
    cout << "【3. 判满测试】" << endl;
    q.EnQueue(80);    // 应该满
    q.Debug("尝试 EnQueue(80)");
    cout << "  当前 size = " << q.Size() << "（maxSize-1 = 5，说明满了）" << endl << endl;

    // ---------- 4. 全部出队 ----------
    cout << "【4. 全部出队】" << endl;
    cout << "  出队顺序: ";
    while (!q.Empty()) cout << q.DeQueue() << " ";
    cout << endl;
    q.Debug("全部出队后");
    cout << endl;

    // ---------- 5. 链队列 ----------
    cout << "【5. 链队列】" << endl;
    LinkQueue<int> lq;
    for (int i = 1; i <= 3; i++) lq.EnQueue(i * 100);
    lq.Print();                                    // 100 200 300
    cout << "  Front = " << lq.Front() << endl;    // 100
    cout << "  Back  = " << lq.Back() << endl;     // 300
    cout << "  出队: " << lq.DeQueue() << endl;    // 100
    lq.Print();                                    // 200 300
    cout << "  再入队 400" << endl;
    lq.EnQueue(400);
    lq.Print();                                    // 200 300 400
    cout << endl;

    // ---------- 6. 链队列的边界 bug 演示 ----------
    cout << "【6. 链队列的危险边界：删到只剩一个】" << endl;
    LinkQueue<int> lq2;
    lq2.EnQueue(1);
    cout << "  入队 1，出队 " << lq2.DeQueue() << "（此时队列为空）" << endl;
    cout << "  Empty = " << lq2.Empty() << endl;
    cout << "  再入队 2（如果忘了修正 rear，这里会崩溃）" << endl;
    lq2.EnQueue(2);
    lq2.Print();                                   // 2
    cout << "  ✓ 正确修正了 rear，没有崩溃" << endl << endl;

    // ---------- 7. STL queue ----------
    cout << "【7. STL 的 queue】" << endl;
    queue<int> stl;
    stl.push(1); stl.push(2); stl.push(3);
    cout << "  front = " << stl.front() << ", back = " << stl.back() << endl;
    stl.pop();                                    // ★ 不返回值
    cout << "  pop 后 front = " << stl.front() << endl;
    cout << endl;

    // ---------- 8. STL priority_queue ----------
    cout << "【8. STL 的 priority_queue（优先队列）】" << endl;
    priority_queue<int> pq;                       // 默认大顶堆
    for (int x : {3, 1, 5, 2, 4}) pq.push(x);
    cout << "  大顶堆出队顺序: ";
    while (!pq.empty()) { cout << pq.top() << " "; pq.pop(); }
    cout << endl;

    priority_queue<int, vector<int>, greater<int>> minPQ;   // 小顶堆
    for (int x : {3, 1, 5, 2, 4}) minPQ.push(x);
    cout << "  小顶堆出队顺序: ";
    while (!minPQ.empty()) { cout << minPQ.top() << " "; minPQ.pop(); }
    cout << endl;
    cout << "  → 优先队列不是先进先出，而是 [优先级最高的先出]" << endl << endl;

    cout << "========================================" << endl;
    cout << "  队列的核心：先进先出（FIFO）" << endl;
    cout << "  循环队列判满：(rear+1)%maxSize == front" << endl;
    cout << "  元素个数：(rear-front+maxSize)%maxSize" << endl;
    cout << "========================================" << endl;

    return 0;
}
