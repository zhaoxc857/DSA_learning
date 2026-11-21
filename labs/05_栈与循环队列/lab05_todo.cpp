// ============================================================================
// 实验 05：栈与循环队列（第 3 章 3.2 栈 + 3.3 循环队列）
// ============================================================================
// 本关分为两部分：
//   Part A：顺序栈（top = -1 表示空栈）+ 用自己写的栈实现括号匹配
//   Part B：循环队列（教材 3.3.1 经典“少用一个空间”方案，彻底解决假溢出！）
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
    int top; // 约定：top == -1 表示空栈；top == 99 表示满栈
};

// ----------------------------------------------------------------------------
// 【函数目标】1. 初始化顺序栈为空栈
//   参数：s - 栈的引用
// 【画图与思路推导】
//   1) 令 s.top = -1;（无需清空 data 数组，top 决定了哪些元素有效）
// 【边界提醒】
//   - 一定注意约定是 top == -1 表示空栈，压入第 1 个元素后 top 变成 0！
// ----------------------------------------------------------------------------
void initStack(SeqStack& s) {
    // TODO: 初始化顺序栈为空栈
    (void)s;
}

// ----------------------------------------------------------------------------
// 【函数目标】2. 判断顺序栈是否为空
//   返回值：空栈返回 true，非空返回 false
// 【画图与思路推导】
//   1) 直接返回 s.top == -1。
// 【边界提醒】
//   - 当栈里只有 1 个元素时，s.top == 0，此时栈是非空的！
// ----------------------------------------------------------------------------
bool isStackEmpty(const SeqStack& s) {
    // TODO: 判断是否为空栈
    (void)s;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】3. 入栈：将元素 x 压入栈顶
//   返回值：入栈成功返回 true；栈满（s.top >= 99）返回 false
// 【画图与思路推导】
//   1) 先判满：若 s.top >= 99，返回 false；
//   2) 先移动栈顶指针再存值：s.top++; s.data[s.top] = x;
//   3) 返回 true。
// 【边界提醒】
//   - 数组长度是 100，最大合法下标是 99！不能写成 s.top >= 100，否则写 s.data[100] 越界！
// ----------------------------------------------------------------------------
bool push(SeqStack& s, int x) {
    // TODO: 实现顺序栈入栈（满栈返回 false）
    (void)s;
    (void)x;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】4. 出栈：弹出栈顶元素，并通过 outVal 带回它的值
//   返回值：出栈成功返回 true；空栈返回 false
// 【画图与思路推导】
//   1) 先判空：若 isStackEmpty(s)，返回 false；
//   2) 先取出栈顶元素再降栈顶：outVal = s.data[s.top]; s.top--;
//   3) 返回 true。
// 【边界提醒】
//   - 记住“入栈先加再存，出栈先取再减”！顺序写反会导致读写错位。
// ----------------------------------------------------------------------------
bool pop(SeqStack& s, int& outVal) {
    // TODO: 实现顺序栈出栈（空栈返回 false）
    (void)s;
    (void)outVal;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】5. 读栈顶：查看当前栈顶元素的值（不出栈，不修改 s.top）
//   返回值：成功返回 true；空栈返回 false
// 【画图与思路推导】
//   1) 若 isStackEmpty(s)，返回 false；
//   2) outVal = s.data[s.top]; 返回 true。
// 【边界提醒】
//   - peek 是只读操作（参数为 const SeqStack&），绝对不能修改 s.top。
// ----------------------------------------------------------------------------
bool peek(const SeqStack& s, int& outVal) {
    // TODO: 读取栈顶元素（空栈返回 false）
    (void)s;
    (void)outVal;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】6. 括号匹配检验：检查表达式 expr 中的 () [] {} 是否合法配对
//   说明：忽略所有非括号字符（如字母、数字、+ - * /、空格）；
//         必须使用上面自己写的 SeqStack（可以把 char 当作 int 压入栈中）。
//   返回值：全部括号合法配对返回 true，否则返回 false
// 【画图与思路推导】
//   1) 定义并初始化一个 SeqStack st; initStack(st);
//   2) 遍历 expr 中的每个字符 ch：
//        a. 若 ch 是左括号 '(' / '[' / '{'：压栈 push(st, ch)（若栈满返回 false）；
//        b. 若 ch 是右括号 ')' / ']' / '}'：
//             - 先尝试 pop(st, left)；如果弹不出（栈空），说明右括号多余，直接返回 false！
//             - 检查 left 和 ch 是否成对：
//               ('(' 配 ')')、('[' 配 ']')、('{' 配 '}')，不匹配则返回 false；
//        c. 其他普通字符：直接跳过。
//   3) 遍历结束后，返回 isStackEmpty(st)！（若栈里还有未消掉的左括号，返回 false）
// 【边界提醒】
//   - 空字符串 "" 或不含任何括号的 "a+b" 都是合法的，应返回 true！
//   - 常见错误：漏了第 3 步“最后检查栈空”，导致 "(((" 误判为 true！
// ----------------------------------------------------------------------------
bool isValidBrackets(const std::string& expr) {
    // TODO: 使用 SeqStack 实现 ()[]{} 括号匹配（忽略非括号字符）
    (void)expr;
    return false;
}

// ============================================================================
// Part B：循环队列（经典“少用一个空间”方案）
// ============================================================================
// 为什么底层数组大小是 capacity + 1？
//   如果把 capacity 个格子全用满，会出现 front == rear，和队空条件撞车！
//   教材 3.3.1 的经典解法：多开 1 个预留格（数组总长 M = capacity + 1），
//   约定队尾指针 rear 指向“下一个要写入的空位”，始终故意空出 1 格不用：
//     - 队空条件：front == rear
//     - 队满条件：(rear + 1) % (capacity + 1) == front
//     - 元素个数：(rear - front + capacity + 1) % (capacity + 1)
// ============================================================================
struct CircularQueue {
    int* data;     // 动态数组，实际长度 = capacity + 1
    int front;     // 队头下标（指向当前队头元素）
    int rear;      // 队尾下标（指向下一个待入队空位）
    int capacity;  // 队列最多可存放的有效元素个数
};

// ----------------------------------------------------------------------------
// 【函数目标】7. 初始化循环队列，使其最多可存放 maxElements 个有效元素
//   参数：q - 队列引用；maxElements - 最大有效容量（正整数）
// 【画图与思路推导】
//   1) 若 maxElements <= 0：置 data = nullptr, front = 0, rear = 0, capacity = 0 并返回；
//   2) 申请大小为 maxElements + 1 的动态数组：q.data = new int[maxElements + 1];
//   3) 设置 q.front = 0; q.rear = 0; q.capacity = maxElements;
// 【边界提醒】
//   - 底层数组必须是 maxElements + 1，不是 maxElements！否则少用一格后只能存 maxElements - 1 个！
// ----------------------------------------------------------------------------
void initQueue(CircularQueue& q, int maxElements) {
    // TODO: 分配容量为 maxElements + 1 的数组并初始化循环队列
    (void)q;
    (void)maxElements;
}

// ----------------------------------------------------------------------------
// 【函数目标】8. 销毁循环队列，释放动态数组并将成员清零/置空
// 【画图与思路推导】
//   1) delete[] q.data;
//   2) q.data = nullptr; q.front = 0; q.rear = 0; q.capacity = 0;
// 【边界提醒】
//   - 用 new int[...] 申请的数组必须配对使用 delete[]（带方括号）释放！
// ----------------------------------------------------------------------------
void destroyQueue(CircularQueue& q) {
    // TODO: 释放循环队列底层数组并重置状态
    (void)q;
}

// ----------------------------------------------------------------------------
// 【函数目标】9. 判断循环队列是否为空
//   返回值：front == rear 返回 true，否则 false
// 【画图与思路推导】
//   1) 直接返回 q.front == q.rear。
// ----------------------------------------------------------------------------
bool isQueueEmpty(const CircularQueue& q) {
    // TODO: 判断循环队列是否为空
    (void)q;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】10. 判断循环队列是否已满
//   返回值：满返回 true，否则 false
// 【画图与思路推导】
//   1) 防御检查：若 q.data == nullptr || q.capacity <= 0，返回 true（避免对 0 取模）；
//   2) 令 M = q.capacity + 1，返回 (q.rear + 1) % M == q.front。
// 【边界提醒】
//   - 模数是 q.capacity + 1（底层数组总长度），不是 q.capacity！
// ----------------------------------------------------------------------------
bool isQueueFull(const CircularQueue& q) {
    // TODO: 用 (rear + 1) % (capacity + 1) == front 判断队满
    (void)q;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】11. 求循环队列当前存放的有效元素个数
//   返回值：当前队列长度（0 .. capacity）
// 【画图与思路推导】
//   1) 若 q.data == nullptr || q.capacity <= 0，返回 0；
//   2) 令 M = q.capacity + 1，返回 (q.rear - q.front + M) % M。
// 【边界提醒】
//   - 绕圈后可能出现 rear < front（比如 M=5, front=3, rear=1），
//     如果直接写 (rear - front) % M 在 C++ 里会算出负数！必须先加 M 再取模！
// ----------------------------------------------------------------------------
int queueSize(const CircularQueue& q) {
    // TODO: 计算循环队列当前元素个数
    (void)q;
    return 0;
}

// ----------------------------------------------------------------------------
// 【函数目标】12. 入队：将元素 x 加入队尾
//   返回值：成功返回 true；队满返回 false
// 【画图与思路推导】
//   1) 若 isQueueFull(q)，返回 false；
//   2) q.data[q.rear] = x;
//   3) q.rear = (q.rear + 1) % (q.capacity + 1);
//   4) 返回 true。
// 【边界提醒】
//   - rear 向前移动必须取模绕回数组开头，不能直接 ++q.rear！
// ----------------------------------------------------------------------------
bool enqueue(CircularQueue& q, int x) {
    // TODO: 实现循环队列入队
    (void)q;
    (void)x;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】13. 出队：移除队头元素，并通过 outVal 带回其值
//   返回值：成功返回 true；队空返回 false
// 【画图与思路推导】
//   1) 若 isQueueEmpty(q)，返回 false；
//   2) outVal = q.data[q.front];
//   3) q.front = (q.front + 1) % (q.capacity + 1);
//   4) 返回 true。
// 【边界提醒】
//   - front 向前移动同样必须对 (q.capacity + 1) 取模！
// ----------------------------------------------------------------------------
bool dequeue(CircularQueue& q, int& outVal) {
    // TODO: 实现循环队列出队
    (void)q;
    (void)outVal;
    return false;
}

// ============================================================================
// 以下为自动评测测试代码（请勿修改）
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
