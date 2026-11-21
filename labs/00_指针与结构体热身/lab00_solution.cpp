/**
 * ============================================================================
 * 关卡 00：指针、引用、动态数组与手动串联链表（参考答案）
 * 对应知识：C++ 指针基础、引用 (&)、指针引用 (*&)、new / delete、结构体 (->)
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
// ============================================================================
void swapByPtr(int* a, int* b) {
    if (a == nullptr || b == nullptr) {
        return;
    }
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

// ============================================================================
// 函数 2：通过引用交换两个整数
// ============================================================================
void swapByRef(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

// ============================================================================
// 函数 3：动态创建并填充数组
// ============================================================================
int* createFilledArray(int n, int initVal) {
    if (n <= 0) {
        return nullptr;
    }
    int* arr = new int[n];
    for (int i = 0; i < n; ++i) {
        arr[i] = initVal;
    }
    return arr;
}

// ============================================================================
// 函数 4：手动串联三个链表节点
// ============================================================================
SimpleNode* buildThreeNodes(int a, int b, int c) {
    SimpleNode* n1 = new SimpleNode;
    SimpleNode* n2 = new SimpleNode;
    SimpleNode* n3 = new SimpleNode;

    n1->data = a;
    n2->data = b;
    n3->data = c;

    n1->next = n2;
    n2->next = n3;
    n3->next = nullptr;

    return n1;
}

// ============================================================================
// 函数 5：遍历链表求和
// ============================================================================
int sumNodes(SimpleNode* head) {
    int sum = 0;
    SimpleNode* p = head;
    while (p != nullptr) {
        sum += p->data;
        p = p->next;
    }
    return sum;
}

// ============================================================================
// 函数 6：安全释放整条链表并把头指针置空
// ============================================================================
void freeNodes(SimpleNode*& head) {
    SimpleNode* cur = head;
    while (cur != nullptr) {
        SimpleNode* nxt = cur->next;
        delete cur;
        cur = nxt;
    }
    head = nullptr;
}

// ============================================================================
// 以下为自动测试代码（与 lab00_todo.cpp 保持完全一致）
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
