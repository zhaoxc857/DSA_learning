/**
 * ============================================================================
 * 关卡 00：指针、引用、动态数组与手动串联链表（热身关）
 * 对应知识：C++ 指针基础、引用 (&)、指针引用 (*&)、new / delete、结构体 (->)
 *
 * 【为什么要有这一关？】
 * 很多同学循环、数组、函数都没问题，但一写链表/二叉树就卡在：
 *   1. `*` 和 `&` 分不清，传参后外面的变量没变；
 *   2. `p->next` 忘记先判空导致程序闪退（段错误）；
 *   3. `delete` 节点时忘了先保存 `next`，或者释放后外部 `head` 变成野指针。
 * 通过这 6 个小函数，把这些底层手感彻底打通！
 *
 * 【编译与自测命令】（在 labs 目录下执行）
 *   python judge.py 00
 * 或手动编译：
 *   g++ -std=c++11 -Wall -Wextra -I../common lab00_todo.cpp -o lab00
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct SimpleNode {
    int data;
    SimpleNode* next;
};

// ============================================================================
// 函数 1：通过指针交换两个整数
// 【函数目标】
//   交换指针 a 和指针 b 所指向的两个 int 变量的值。
//   参数：a, b 为指向 int 的指针（可能为 nullptr）。
//   返回值：无。
// 【画图与思路推导】
//   1. 先检查安全性：如果 a == nullptr 或 b == nullptr，直接 return，什么都不做。
//   2. 用临时变量 tmp 保存 *a（取出 a 指向的盒子里的数字）。
//   3. 把 *b 写入 *a。
//   4. 把 tmp 写入 *b。
// 【边界提醒】
//   - 若传入空指针却直接解引用 *a，程序会直接崩溃！
//   - 若 a 和 b 指向同一个变量（a == b），上述三步交换依然是安全的。
// ============================================================================
void swapByPtr(int* a, int* b) {
    // TODO: 请实现通过指针交换 *a 与 *b（别忘了先判空！）
    (void)a;
    (void)b;
}

// ============================================================================
// 函数 2：通过引用交换两个整数
// 【函数目标】
//   使用 C++ 引用（别名）交换变量 a 和 b 的值。
//   参数：a, b 为 int& 引用，直接绑定调用方的实参变量。
//   返回值：无。
// 【画图与思路推导】
//   1. 引用就是实参的“外号”，改 a 就等于改外面的原变量，不需要写 *。
//   2. int tmp = a; a = b; b = tmp;
// 【边界提醒】
//   - 对比一下：如果参数写成 void swap(int a, int b)（值传递），改的只是拷贝，
//     函数结束后外面的变量纹丝不动！
// ============================================================================
void swapByRef(int& a, int& b) {
    // TODO: 请实现通过引用交换 a 与 b
    (void)a;
    (void)b;
}

// ============================================================================
// 函数 3：动态创建并填充数组
// 【函数目标】
//   在堆内存上用 new int[n] 创建长度为 n 的整型数组，并将每个元素初始化为 initVal。
//   参数：n 为数组长度，initVal 为每个元素的初始值。
//   返回值：成功返回数组首地址；若 n <= 0 返回 nullptr。
// 【画图与思路推导】
//   1. 先判断合法性：若 n <= 0，直接返回 nullptr。
//   2. 用 int* arr = new int[n]; 申请连续内存。
//   3. 用 for 循环将 arr[0 .. n-1] 全部赋值为 initVal。
//   4. 返回 arr（调用方用完后需负责 delete[] arr）。
// 【边界提醒】
//   - 绝对不能返回局部数组（如 int arr[10]; return arr;），函数结束局部数组就会销毁！
//   - n == 0 或负数时不要去 new int[n]，统一返回 nullptr。
// ============================================================================
int* createFilledArray(int n, int initVal) {
    // TODO: 请动态申请长度为 n 的数组并全部填充为 initVal
    (void)n;
    (void)initVal;
    return nullptr;
}

// ============================================================================
// 函数 4：手动串联三个链表节点
// 【函数目标】
//   在堆上 new 出 3 个 SimpleNode 节点，数据域依次为 a, b, c，
//   用 next 指针把它们串成一条链表： [a] -> [b] -> [c] -> nullptr。
//   返回值：第一个节点（头节点）的指针。
// 【画图与思路推导】
//   1. 分别 new 出三个节点：n1, n2, n3。
//   2. 给数据域赋值：n1->data = a; n2->data = b; n3->data = c;
//   3. 用箭头串联指针域：
//        n1->next = n2;
//        n2->next = n3;
//        n3->next = nullptr;   // <--- 尾节点必须收口！
//   4. 返回 n1。
// 【边界提醒】
//   - 千万不要忘记把最后一个节点的 next 置为 nullptr！否则遍历时会顺着垃圾地址一路跑飞崩溃。
// ============================================================================
SimpleNode* buildThreeNodes(int a, int b, int c) {
    // TODO: 请 new 三个节点并用 ->next 串联起来，返回头节点指针
    (void)a;
    (void)b;
    (void)c;
    return nullptr;
}

// ============================================================================
// 函数 5：遍历链表求和
// 【函数目标】
//   从头指针 head 出发，遍历整条链表，计算所有节点 data 的总和。
//   参数：head 为链表首节点指针（空链表时为 nullptr）。
//   返回值：所有节点 data 之和；空链表返回 0。
// 【画图与思路推导】
//   1. 定义累加器 sum = 0，游标指针 SimpleNode* p = head;
//   2. 只要 p != nullptr 就循环：
//        sum += p->data;
//        p = p->next;   // 游标迈向下一个节点
//   3. 循环结束返回 sum。
// 【边界提醒】
//   - 空链表（head == nullptr）时循环 0 次，自然返回 0，不要直接写 head->data！
//   - 记得移动游标 p = p->next，否则会死循环。
// ============================================================================
int sumNodes(SimpleNode* head) {
    // TODO: 请遍历链表并累加所有节点的 data
    (void)head;
    return 0;
}

// ============================================================================
// 函数 6：安全释放整条链表并把头指针置空
// 【函数目标】
//   释放以 head 为首的整条链表的所有堆内存节点，并将调用方的 head 置为 nullptr。
//   参数：head 为“指针的引用”（SimpleNode*&），这样函数内写 head = nullptr 会同步改掉外部变量！
//   返回值：无。
// 【画图与思路推导】
//   1. 定义游标 cur = head;
//   2. 当 cur != nullptr 时：
//        SimpleNode* nxt = cur->next;  // 第①步：先记下下家地址！
//        delete cur;                   // 第②步：再销毁当前节点
//        cur = nxt;                    // 第③步：跳到下家
//   3. 全部释放完后，令 head = nullptr;（斩断野指针！）。
// 【边界提醒】
//   - 经典惨案：先 delete cur 再写 cur = cur->next（读了已释放内存，属于未定义行为！）。
//   - 空链表（head == nullptr）或单节点链表都要能安全运行，结束后 head 必须为 nullptr。
// ============================================================================
void freeNodes(SimpleNode*& head) {
    // TODO: 请安全释放所有节点，并把 head 置为 nullptr
    (void)head;
}

// ============================================================================
// 以下为自动测试代码（请勿修改 main 中的测试用例）
// ============================================================================
namespace {

// 安全读取链表内容（带步数上限，防止未封尾或成环导致死循环）
std::vector<int> collectNodesSafe(SimpleNode* head, int maxSteps = 20) {
    std::vector<int> res;
    SimpleNode* p = head;
    int steps = 0;
    while (p != nullptr && steps < maxSteps) {
        res.push_back(p->data);
        p = p->next;
        ++steps;
    }
    return res;
}

} // namespace

int main() {
    labtest::beginLab("Lab 00：指针、引用、动态数组与三节点链表热身");

    // --- 1. 测试 swapByPtr ---
    {
        int x = 10, y = 25;
        swapByPtr(&x, &y);
        labtest::expectEqInt("swapByPtr 常规交换-x", 25, x,
                             "请检查是否用 tmp 暂存了 *a，再交换 *a 和 *b");
        labtest::expectEqInt("swapByPtr 常规交换-y", 10, y,
                             "请检查 *b 是否被赋值为原来的 *a");

        swapByPtr(&x, &x);
        labtest::expectEqInt("swapByPtr 同一变量自交换", 25, x,
                             "使用临时变量 tmp 交换时，同一地址自交换应保持原值不变");

        int keep1 = 77, keep2 = 88;
        swapByPtr(&keep1, nullptr);
        swapByPtr(nullptr, &keep2);
        swapByPtr(nullptr, nullptr);
        labtest::expectEqInt("swapByPtr 空指针保护-keep1", 77, keep1,
                             "传入 nullptr 时应直接 return，不要解引用空指针");
        labtest::expectEqInt("swapByPtr 空指针保护-keep2", 88, keep2,
                             "传入 nullptr 时应直接 return，不要改动非空实参");
    }

    // --- 2. 测试 swapByRef ---
    {
        int m = -3, n = 99;
        swapByRef(m, n);
        labtest::expectEqInt("swapByRef 常规交换-m", 99, m,
                             "请确认参数是 int& 引用类型并在函数内完成三步交换");
        labtest::expectEqInt("swapByRef 常规交换-n", -3, n,
                             "请检查引用交换的第二步与第三步赋值顺序");

        swapByRef(m, m);
        labtest::expectEqInt("swapByRef 同一变量自交换", 99, m,
                             "用临时变量 tmp 交换，避免用异或技巧导致自交换变 0");
    }

    // --- 3. 测试 createFilledArray ---
    {
        int* arr = createFilledArray(5, 7);
        labtest::expectTrue("createFilledArray(5, 7) 返回非空指针", arr != nullptr,
                            "请使用 new int[n] 申请堆内存并返回首地址");
        if (arr != nullptr) {
            std::vector<int> actual(arr, arr + 5);
            labtest::expectEqVec("createFilledArray(5, 7) 元素内容",
                                 {7, 7, 7, 7, 7}, actual,
                                 "请检查 for 循环是否从下标 0 填到 n-1");
            delete[] arr;
        } else {
            labtest::expectEqVec("createFilledArray(5, 7) 元素内容",
                                 {7, 7, 7, 7, 7}, {},
                                 "因为返回了 nullptr，无法读取数组内容");
        }

        int* single = createFilledArray(1, -8);
        labtest::expectTrue("createFilledArray(1, -8) 单元素非空", single != nullptr,
                            "n == 1 是合法长度，应正常分配 1 个元素");
        if (single != nullptr) {
            labtest::expectEqInt("createFilledArray(1, -8) 单元素值", -8, single[0],
                                 "请检查下标 0 是否正确赋值为 initVal");
            delete[] single;
        } else {
            labtest::expectEqInt("createFilledArray(1, -8) 单元素值", -8, 0,
                                 "因为返回了 nullptr，无法读取元素值");
        }

        int* zeroArr = createFilledArray(0, 5);
        labtest::expectTrue("createFilledArray(0, 5) 边界返回 nullptr", zeroArr == nullptr,
                            "当 n <= 0 时必须返回 nullptr");
        delete[] zeroArr;

        int* negArr = createFilledArray(-4, 5);
        labtest::expectTrue("createFilledArray(-4, 5) 负数长度返回 nullptr", negArr == nullptr,
                            "当 n <= 0 时必须返回 nullptr，切勿执行 new int[n]");
        delete[] negArr;
    }

    // --- 4. 测试 buildThreeNodes & sumNodes & freeNodes ---
    {
        SimpleNode* head = buildThreeNodes(10, 20, 30);
        labtest::expectTrue("buildThreeNodes(10,20,30) 头指针非空", head != nullptr,
                            "请用 new SimpleNode 创建三个节点并返回第一个节点指针");
        std::vector<int> vals = collectNodesSafe(head);
        labtest::expectEqVec("buildThreeNodes(10,20,30) 串联顺序", {10, 20, 30}, vals,
                             "请检查 n1->next = n2, n2->next = n3, n3->next = nullptr");

        bool tailIsNull = (head != nullptr && head->next != nullptr &&
                           head->next->next != nullptr && head->next->next->next == nullptr);
        labtest::expectTrue("buildThreeNodes 尾节点 next == nullptr", tailIsNull,
                            "第三个节点的 next 必须显式设为 nullptr，否则遍历会越界");

        labtest::expectEqInt("sumNodes([10, 20, 30])", 60, sumNodes(head),
                             "请用 while (p != nullptr) 累加 p->data 并移动 p = p->next");

        freeNodes(head);
        labtest::expectTrue("freeNodes 释放三节点后 head == nullptr", head == nullptr,
                            "释放完所有节点后必须写 head = nullptr（并注意参数类型为 SimpleNode*&）");
    }

    {
        SimpleNode* head2 = buildThreeNodes(-5, 0, 12);
        labtest::expectEqInt("sumNodes([-5, 0, 12]) 含负数与0", 7, sumNodes(head2),
                             "负数和 0 节点同样参与累加，循环条件应判断 p != nullptr 而非 p->data != 0");
        freeNodes(head2);
        labtest::expectTrue("freeNodes 释放第二条链表后 head2 == nullptr", head2 == nullptr,
                            "释放完成后别忘了将 head 置为 nullptr");
    }

    {
        // 单节点链表测试
        SimpleNode* single = new SimpleNode{42, nullptr};
        labtest::expectEqInt("sumNodes 单节点 [42]", 42, sumNodes(single),
                             "单节点链表只循环 1 次，应返回 42");
        freeNodes(single);
        labtest::expectTrue("freeNodes 释放单节点后 single == nullptr", single == nullptr,
                            "单节点释放后同样要把外部头指针置为 nullptr");
        // 若学生未实现 freeNodes，这里补救防止测试工具自身泄漏（只在 todo 未置空时触发）
        if (single != nullptr) {
            delete single;
            single = nullptr;
        }
    }

    {
        // 空链表测试
        SimpleNode* emptyHead = nullptr;
        labtest::expectEqInt("sumNodes 空链表返回 0", 0, sumNodes(emptyHead),
                             "空链表 head == nullptr 时应安全返回 0，不可解引用 head");
        freeNodes(emptyHead);
        labtest::expectTrue("freeNodes 释放空链表安全且保持 nullptr", emptyHead == nullptr,
                            "空链表进入 freeNodes 时循环 0 次，不崩溃且 head 保持 nullptr");
    }

    return labtest::endLab();
}
