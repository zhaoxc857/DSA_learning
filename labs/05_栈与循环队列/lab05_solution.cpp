// ============================================================================
// 实验 05：栈与循环队列 —— 参考答案
// ============================================================================

#include <iostream>
#include <string>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：顺序栈与括号匹配
// ============================================================================
struct SeqStack {
    int data[100];
    int top;
};

void initStack(SeqStack& s) {
    s.top = -1;
}

bool isStackEmpty(const SeqStack& s) {
    return s.top == -1;
}

bool push(SeqStack& s, int x) {
    if (s.top >= 99) return false;
    s.data[++s.top] = x;
    return true;
}

bool pop(SeqStack& s, int& outVal) {
    if (isStackEmpty(s)) return false;
    outVal = s.data[s.top--];
    return true;
}

bool peek(const SeqStack& s, int& outVal) {
    if (isStackEmpty(s)) return false;
    outVal = s.data[s.top];
    return true;
}

bool isValidBrackets(const std::string& expr) {
    SeqStack st;
    initStack(st);
    for (size_t i = 0; i < expr.size(); ++i) {
        char ch = expr[i];
        if (ch == '(' || ch == '[' || ch == '{') {
            if (!push(st, static_cast<int>(ch))) {
                return false;
            }
        } else if (ch == ')' || ch == ']' || ch == '}') {
            int left = 0;
            if (!pop(st, left)) {
                return false;
            }
            if ((ch == ')' && left != '(') ||
                (ch == ']' && left != '[') ||
                (ch == '}' && left != '{')) {
                return false;
            }
        }
    }
    return isStackEmpty(st);
}

// ============================================================================
// Part B：循环队列（经典“少用一个空间”方案）
// ============================================================================
struct CircularQueue {
    int* data;
    int front;
    int rear;
    int capacity;
};

void initQueue(CircularQueue& q, int maxElements) {
    if (maxElements <= 0) {
        q.data = nullptr;
        q.front = 0;
        q.rear = 0;
        q.capacity = 0;
        return;
    }
    q.data = new int[maxElements + 1];
    q.front = 0;
    q.rear = 0;
    q.capacity = maxElements;
}

void destroyQueue(CircularQueue& q) {
    delete[] q.data;
    q.data = nullptr;
    q.front = 0;
    q.rear = 0;
    q.capacity = 0;
}

bool isQueueEmpty(const CircularQueue& q) {
    return q.front == q.rear;
}

bool isQueueFull(const CircularQueue& q) {
    if (q.data == nullptr || q.capacity <= 0) return true;
    int mod = q.capacity + 1;
    return (q.rear + 1) % mod == q.front;
}

int queueSize(const CircularQueue& q) {
    if (q.data == nullptr || q.capacity <= 0) return 0;
    int mod = q.capacity + 1;
    return (q.rear - q.front + mod) % mod;
}

bool enqueue(CircularQueue& q, int x) {
    if (isQueueFull(q)) return false;
    int mod = q.capacity + 1;
    q.data[q.rear] = x;
    q.rear = (q.rear + 1) % mod;
    return true;
}

bool dequeue(CircularQueue& q, int& outVal) {
    if (isQueueEmpty(q)) return false;
    int mod = q.capacity + 1;
    outVal = q.data[q.front];
    q.front = (q.front + 1) % mod;
    return true;
}

// ============================================================================
// 以下为自动评测测试代码（与 lab05_todo.cpp 完全一致）
// ============================================================================

int main() {
    labtest::beginLab("实验 05：栈与循环队列");

    // ==================== Part A-1：顺序栈测试 ====================
    SeqStack st;
    st.top = 77; // 故意放个脏值，验证 initStack 确实重置了 top
    initStack(st);
    labtest::expectTrue(
        "[顺序栈] initStack 后应为空栈",
        isStackEmpty(st) && st.top == -1,
        "请在 initStack 中将 s.top 设为 -1，并在 isStackEmpty 中判断 s.top == -1。"
    );

    int val = -999;
    labtest::expectTrue(
        "[顺序栈] 空栈 pop 应返回 false",
        !pop(st, val),
        "空栈时 pop 必须先判空并返回 false，不能把 top 减成 -2。"
    );
    labtest::expectTrue(
        "[顺序栈] 空栈 peek 应返回 false",
        !peek(st, val),
        "空栈时 peek 必须先判空并返回 false。"
    );

    labtest::expectTrue(
        "[顺序栈] 依次入栈 10, 20, 30 应均成功",
        push(st, 10) && push(st, 20) && push(st, 30),
        "请检查 push：先判满，再 ++s.top 并赋值 s.data[s.top] = x。"
    );
    labtest::expectTrue(
        "[顺序栈] peek 应读出栈顶 30 且不弹出",
        peek(st, val) && val == 30 && st.top == 2,
        "peek 只读取 s.data[s.top]，绝对不能改动 s.top。"
    );

    std::vector<int> popped;
    while (pop(st, val)) {
        popped.push_back(val);
    }
    labtest::expectEqVec(
        "[顺序栈] 连续出栈应满足后进先出 [30, 20, 10]",
        {30, 20, 10}, popped,
        "请检查 pop 是否“先取 s.data[s.top] 再 s.top--”。"
    );
    labtest::expectTrue(
        "[顺序栈] 全部弹出后应重新为空栈",
        isStackEmpty(st),
        "所有元素出栈后 s.top 应回到 -1。"
    );

    // 满栈测试（容量 100）
    bool allPushOk = true;
    for (int i = 0; i < 100; ++i) {
        if (!push(st, i)) {
            allPushOk = false;
            break;
        }
    }
    labtest::expectTrue(
        "[顺序栈] 连续压入 100 个元素应全部成功",
        allPushOk,
        "数组 data[100] 的有效下标是 0..99，满栈条件应为 s.top >= 99。"
    );
    labtest::expectTrue(
        "[顺序栈] 满栈时第 101 次 push 应返回 false",
        !push(st, 999),
        "当 s.top == 99 时栈已满，必须拒绝入栈并返回 false，防止数组越界。"
    );
    labtest::expectTrue(
        "[顺序栈] 满栈弹出 1 个应为 99，随后可再压入 888",
        pop(st, val) && val == 99 && push(st, 888) && peek(st, val) && val == 888,
        "满栈 pop 一次后 top 变为 98，此时应允许再次 push。"
    );

    // ==================== Part A-2：括号匹配测试 ====================
    labtest::expectTrue(
        "[括号匹配] 空串 \"\" 应合法",
        isValidBrackets(""),
        "空串不含未匹配括号，循环结束后栈为空，应返回 true。"
    );
    labtest::expectTrue(
        "[括号匹配] 无括号表达式 \"a+b*123\" 应合法",
        isValidBrackets("a+b*123"),
        "请忽略所有非括号字符。"
    );
    labtest::expectTrue(
        "[括号匹配] 嵌套括号 \"{[()]}\" 应合法",
        isValidBrackets("{[()]}"),
        "请检查 () [] {} 三组括号的配对判断逻辑。"
    );
    labtest::expectTrue(
        "[括号匹配] 带运算表达式 \"(a+b)*[c-{d/e}]\" 应合法",
        isValidBrackets("(a+b)*[c-{d/e}]"),
        "表达式中的字母和运算符应跳过，仅对 ()[]{} 做入栈与匹配。"
    );
    labtest::expectTrue(
        "[括号匹配] 并列与嵌套混合 \"()[]{}([])\" 应合法",
        isValidBrackets("()[]{}([])"),
        "请检查多组并列括号连续弹空再压栈是否正常。"
    );
    labtest::expectTrue(
        "[括号匹配] 单个右括号 \")\" 应非法",
        !isValidBrackets(")"),
        "遇到右括号时若栈为空（pop 返回 false），必须立刻返回 false。"
    );
    labtest::expectTrue(
        "[括号匹配] 交叉错位 \"([)]\" 应非法",
        !isValidBrackets("([)]"),
        "遇到 ')' 时栈顶是 '['，类型不匹配应返回 false。"
    );
    labtest::expectTrue(
        "[括号匹配] 多余左括号 \"(((\" 应非法",
        !isValidBrackets("((("),
        "遍历结束后必须检查 isStackEmpty(st)！有残留左括号应返回 false。"
    );
    labtest::expectTrue(
        "[括号匹配] 多余右括号 \"(()))\" 应非法",
        !isValidBrackets("(()))"),
        "最后一个 ')' 出现时栈已空，应返回 false。"
    );
    labtest::expectTrue(
        "[括号匹配] 类型不匹配 \"(]\" 应非法",
        !isValidBrackets("(]"),
        "请核对左括号与右括号的一一对应关系。"
    );

    // ==================== Part B：循环队列测试 ====================
    CircularQueue q{nullptr, 0, 0, 0};
    initQueue(q, 4); // 最多存 4 个元素，底层数组长 5
    labtest::expectTrue(
        "[循环队列] initQueue(4) 后队列应为空、不满且容量为 4",
        q.data != nullptr && q.capacity == 4 && isQueueEmpty(q) && !isQueueFull(q),
        "请在 initQueue 中分配 new int[maxElements + 1]，并设 front=0, rear=0, capacity=maxElements。"
    );
    labtest::expectEqInt(
        "[循环队列] 初始 queueSize 应为 0",
        0, queueSize(q),
        "空队列时 front == rear，元素个数为 0。"
    );
    labtest::expectTrue(
        "[循环队列] 空队 dequeue 应返回 false",
        !dequeue(q, val),
        "出队前必须先检查 isQueueEmpty(q)。"
    );

    // 填满 4 个元素
    labtest::expectTrue(
        "[循环队列] 连续入队 1, 2, 3, 4 应均成功",
        enqueue(q, 1) && enqueue(q, 2) && enqueue(q, 3) && enqueue(q, 4),
        "capacity=4 时底层数组有 5 格，空出 1 格后恰好能存满 4 个元素！"
    );
    labtest::expectTrue(
        "[循环队列] 存入 4 个元素后 isQueueFull 应为 true",
        isQueueFull(q),
        "请检查队满公式：(q.rear + 1) % (q.capacity + 1) == q.front。"
    );
    labtest::expectEqInt(
        "[循环队列] 满队时 queueSize 应为 4",
        4, queueSize(q),
        "请检查 queueSize 公式：(rear - front + capacity + 1) % (capacity + 1)。"
    );
    labtest::expectTrue(
        "[循环队列] 满队时再入队 5 应返回 false",
        !enqueue(q, 5),
        "enqueue 开头必须调用 isQueueFull(q) 拒绝满队入队。"
    );

    // 出队 2 个 -> front 前移到 2，再入队 2 个 -> rear 绕回数组头部（测试假溢出与 rear < front）
    int d1 = -1, d2 = -1;
    labtest::expectTrue(
        "[循环队列] 连续出队 2 次应依次得到 1 和 2",
        dequeue(q, d1) && d1 == 1 && dequeue(q, d2) && d2 == 2,
        "队列应遵循先进先出（FIFO），先出队头元素 1，再出 2。"
    );
    labtest::expectEqInt(
        "[循环队列] 出队 2 个后 queueSize 应为 2",
        2, queueSize(q),
        "请检查 dequeue 后 front 是否正确递增取模。"
    );
    labtest::expectTrue(
        "[循环队列] 绕圈再入队 5 和 6（考验假溢出！）应成功",
        enqueue(q, 5) && enqueue(q, 6),
        "若此处失败，说明未解决假溢出：rear 到达数组末尾后必须通过 % (capacity + 1) 绕回下标 0！"
    );
    labtest::expectTrue(
        "[循环队列] 绕圈填满后应满足 rear < front 且 isQueueFull 为 true",
        isQueueFull(q) && q.rear < q.front,
        "此时 front=2, rear=1，(1 + 1) % 5 == 2 == front，恰好再次队满。"
    );
    labtest::expectEqInt(
        "[循环队列] rear < front 绕圈状态下 queueSize 仍应为 4（防负数！）",
        4, queueSize(q),
        "若算出了 -1 而不是 4，是因为写成了 (rear - front) % M，忘了先 + M 再取模！"
    );
    labtest::expectTrue(
        "[循环队列] 绕圈满队时再入队 7 应返回 false",
        !enqueue(q, 7),
        "绕圈队满时同样必须拒绝入队。"
    );

    std::vector<int> qOut;
    while (dequeue(q, val)) {
        qOut.push_back(val);
    }
    labtest::expectEqVec(
        "[循环队列] 绕圈后全部出队顺序应为 [3, 4, 5, 6]",
        {3, 4, 5, 6}, qOut,
        "请检查 front 和 rear 的取模运算是否统一使用 (q.capacity + 1)。"
    );
    labtest::expectTrue(
        "[循环队列] 全部出队后应为空且 queueSize == 0",
        isQueueEmpty(q) && queueSize(q) == 0 && !dequeue(q, val),
        "全部出队后 front 追上 rear，队列回归空状态。"
    );

    // 多轮绕圈稳定性测试（连续 5 轮：每轮入 3 个、出 3 个）
    bool multiRoundOk = true;
    int nextIn = 100;
    int nextExpect = 100;
    for (int r = 0; r < 5; ++r) {
        for (int k = 0; k < 3; ++k) {
            if (!enqueue(q, nextIn++)) multiRoundOk = false;
        }
        if (queueSize(q) != 3) multiRoundOk = false;
        for (int k = 0; k < 3; ++k) {
            int out = -1;
            if (!dequeue(q, out) || out != nextExpect++) multiRoundOk = false;
        }
        if (!isQueueEmpty(q)) multiRoundOk = false;
    }
    labtest::expectTrue(
        "[循环队列] 连续 5 轮绕圈入 3 出 3 压力测试应全部一致",
        multiRoundOk,
        "多轮绕圈出错通常是因为模数写错，或 front/rear 未同步取模。"
    );

    destroyQueue(q);
    labtest::expectTrue(
        "[循环队列] destroyQueue 后 data 应置 nullptr 且 capacity 归 0",
        q.data == nullptr && q.capacity == 0 && q.front == 0 && q.rear == 0,
        "请在 destroyQueue 中执行 delete[] q.data 并将指针与下标归零。"
    );

    return labtest::endLab();
}
