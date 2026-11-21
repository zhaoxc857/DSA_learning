// ============================================================================
// 实验 04：双链表与约瑟夫环 —— 参考答案
// ============================================================================

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：带头结点的双链表
// ============================================================================
struct DNode {
    int data;
    DNode* prior;
    DNode* next;
};

DNode* createDList() {
    DNode* head = new DNode;
    head->data = 0;
    head->prior = nullptr;
    head->next = nullptr;
    return head;
}

bool dlistInsert(DNode* head, int pos, int x) {
    if (head == nullptr || pos < 1) return false;
    DNode* p = head;
    int idx = 0;
    while (p != nullptr && idx < pos - 1) {
        p = p->next;
        ++idx;
    }
    if (p == nullptr) return false;

    DNode* s = new DNode;
    s->data = x;
    s->next = p->next;
    if (p->next != nullptr) {
        p->next->prior = s;
    }
    s->prior = p;
    p->next = s;
    return true;
}

bool dlistDelete(DNode* head, int pos, int& removedVal) {
    if (head == nullptr || pos < 1) return false;
    DNode* p = head;
    int idx = 0;
    while (p != nullptr && idx < pos - 1) {
        p = p->next;
        ++idx;
    }
    if (p == nullptr || p->next == nullptr) return false;

    DNode* q = p->next;
    removedVal = q->data;
    p->next = q->next;
    if (q->next != nullptr) {
        q->next->prior = p;
    }
    delete q;
    return true;
}

void destroyDList(DNode*& head) {
    DNode* p = head;
    while (p != nullptr) {
        DNode* nxt = p->next;
        delete p;
        p = nxt;
    }
    head = nullptr;
}

// ============================================================================
// Part B：循环单链表解约瑟夫环
// ============================================================================
struct CNode {
    int id;
    CNode* next;
};

std::vector<int> josephusOrder(int n, int m) {
    std::vector<int> order;
    if (n <= 0 || m <= 0) return order;

    // 构造编号 1..n 的不带头结点循环单链表
    CNode* head = new CNode{1, nullptr};
    CNode* tail = head;
    for (int i = 2; i <= n; ++i) {
        CNode* node = new CNode{i, nullptr};
        tail->next = node;
        tail = node;
    }
    tail->next = head;

    // prev 始终指向 curr 的前驱，初始 prev = tail, curr = head
    CNode* prev = tail;
    CNode* curr = head;
    order.reserve(static_cast<size_t>(n));

    for (int round = 0; round < n; ++round) {
        for (int step = 1; step < m; ++step) {
            prev = curr;
            curr = curr->next;
        }
        order.push_back(curr->id);
        if (curr->next == curr) {
            delete curr;
            curr = nullptr;
            prev = nullptr;
        } else {
            prev->next = curr->next;
            delete curr;
            curr = prev->next;
        }
    }

    return order;
}

// ============================================================================
// 以下为自动评测测试代码（与 lab04_todo.cpp 完全一致）
// ============================================================================

static std::vector<int> dlistForward(DNode* head) {
    std::vector<int> res;
    if (head == nullptr) return res;
    DNode* p = head->next;
    int guard = 0;
    while (p != nullptr && guard < 10000) {
        res.push_back(p->data);
        p = p->next;
        ++guard;
    }
    return res;
}

static std::vector<int> dlistBackward(DNode* head, bool& headLinkOk) {
    std::vector<int> res;
    headLinkOk = false;
    if (head == nullptr) return res;
    if (head->next == nullptr) {
        headLinkOk = (head->prior == nullptr);
        return res;
    }

    DNode* tail = head->next;
    int guard = 0;
    while (tail->next != nullptr && guard < 10000) {
        tail = tail->next;
        ++guard;
    }
    if (guard >= 10000) return res;

    DNode* p = tail;
    guard = 0;
    while (p != nullptr && p != head && guard < 10000) {
        res.push_back(p->data);
        p = p->prior;
        ++guard;
    }
    if (p == head && head->prior == nullptr) {
        headLinkOk = true;
    }
    return res;
}

int main() {
    labtest::beginLab("实验 04：双链表与约瑟夫环");

    // ==================== Part A：双链表测试 ====================
    DNode* dlist = createDList();
    labtest::expectTrue(
        "[双链表] createDList 头结点非空且 prior/next 均为 nullptr",
        dlist != nullptr && dlist->prior == nullptr && dlist->next == nullptr,
        "请在 createDList 中将 head->prior 和 head->next 都初始化为 nullptr。"
    );

    int removed = -999;
    labtest::expectTrue(
        "[双链表] 空表删除 pos=1 应返回 false",
        !dlistDelete(dlist, 1, removed),
        "空表时 p->next == nullptr，dlistDelete 必须返回 false。"
    );
    labtest::expectTrue(
        "[双链表] 空表越界插入 pos=0 应返回 false",
        !dlistInsert(dlist, 0, 10),
        "位序从 1 开始，dlistInsert 需拦截 pos < 1。"
    );
    labtest::expectTrue(
        "[双链表] 空表越界插入 pos=2 应返回 false",
        !dlistInsert(dlist, 2, 10),
        "空表时合法插入位序只有 1，pos=2 查找前驱后会得到 p == nullptr。"
    );

    // 单节点表尾插入（关键边界：p->next == nullptr）
    labtest::expectTrue(
        "[双链表] 空表插入 pos=1 值 10",
        dlistInsert(dlist, 1, 10),
        "空表插入时 p == head 且 p->next == nullptr，注意不要解引用 p->next->prior！"
    );
    bool headLinkOk = false;
    labtest::expectEqVec(
        "[双链表] 单节点正向遍历应为 [10]",
        {10}, dlistForward(dlist),
        "请检查 dlistInsert 中 p->next = s 与 s->next = p->next。"
    );
    labtest::expectEqVec(
        "[双链表] 单节点反向遍历应为 [10]",
        {10}, dlistBackward(dlist, headLinkOk),
        "请检查 dlistInsert 中 s->prior = p 是否正确设置。"
    );
    labtest::expectTrue(
        "[双链表] 单节点沿 prior 反向应精准回到头结点",
        headLinkOk,
        "第 1 个数据节点的 prior 必须指向头结点 head，且 head->prior 保持 nullptr。"
    );

    // 表头、表尾、中间依次插入 -> [5, 10, 15, 20]
    labtest::expectTrue(
        "[双链表] 表头插入 pos=1 值 5",
        dlistInsert(dlist, 1, 5),
        "表头插入时原首节点 10 的 prior 必须改指向新节点 5！"
    );
    labtest::expectTrue(
        "[双链表] 表尾插入 pos=3 值 20",
        dlistInsert(dlist, 3, 20),
        "表尾插入时 p->next == nullptr，请确认先判断 if (p->next != nullptr) 再改 prior。"
    );
    labtest::expectTrue(
        "[双链表] 中间插入 pos=3 值 15",
        dlistInsert(dlist, 3, 15),
        "中间插入时四条指针（s->next, p->next->prior, s->prior, p->next）缺一不可。"
    );
    labtest::expectEqVec(
        "[双链表] 插入后正向遍历应为 [5, 10, 15, 20]",
        {5, 10, 15, 20}, dlistForward(dlist),
        "正向遍历不符，请检查 dlistInsert 的 next 指针连接顺序。"
    );
    labtest::expectEqVec(
        "[双链表] 插入后反向遍历应为 [20, 15, 10, 5]",
        {20, 15, 10, 5}, dlistBackward(dlist, headLinkOk),
        "反向遍历不符，说明某个节点的 prior 指针漏连或连错了（常见原因：先改了 p->next 才改 p->next->prior）。"
    );
    labtest::expectTrue(
        "[双链表] 多节点反向遍历能准确回到头结点",
        headLinkOk,
        "请检查所有节点的 prior 链条是否完整连回 head。"
    );

    // 删除中间、表尾、表头、最后唯一节点
    labtest::expectTrue(
        "[双链表] 删除中间 pos=2（应删掉 10）",
        dlistDelete(dlist, 2, removed) && removed == 10,
        "删除中间节点时，别忘了把后继节点 15 的 prior 改为指向前驱 5。"
    );
    labtest::expectEqVec(
        "[双链表] 删中间后正向应为 [5, 15, 20]",
        {5, 15, 20}, dlistForward(dlist),
        "请检查 dlistDelete 的 p->next = q->next。"
    );
    labtest::expectEqVec(
        "[双链表] 删中间后反向应为 [20, 15, 5]",
        {20, 15, 5}, dlistBackward(dlist, headLinkOk),
        "删中间节点后反向遍历失败，极可能是忘了执行 q->next->prior = p！"
    );

    labtest::expectTrue(
        "[双链表] 删除表尾 pos=3（应删掉 20）",
        dlistDelete(dlist, 3, removed) && removed == 20,
        "删除尾节点时 q->next == nullptr，必须先判空 if (q->next != nullptr) 再写 q->next->prior = p。"
    );
    labtest::expectEqVec(
        "[双链表] 删表尾后正向应为 [5, 15]",
        {5, 15}, dlistForward(dlist),
        "删除尾节点后新尾节点 15 的 next 应为 nullptr。"
    );
    labtest::expectEqVec(
        "[双链表] 删表尾后反向应为 [15, 5]",
        {15, 5}, dlistBackward(dlist, headLinkOk),
        "请检查删表尾后反向链条是否完好。"
    );

    labtest::expectTrue(
        "[双链表] 删除表头 pos=1（应删掉 5）",
        dlistDelete(dlist, 1, removed) && removed == 5,
        "删除表头时，新首节点 15 的 prior 必须更新为指向 head。"
    );
    labtest::expectEqVec(
        "[双链表] 删表头后反向应为 [15] 且能回到 head",
        {15}, dlistBackward(dlist, headLinkOk),
        "删除第 1 个节点后，原第 2 个节点的 prior 必须指回 head，不能仍指着已 delete 的旧节点。"
    );
    labtest::expectTrue(
        "[双链表] 删表头后 headLinkOk 应为 true",
        headLinkOk,
        "新首节点的 prior 必须指向 head。"
    );

    labtest::expectTrue(
        "[双链表] 删除最后唯一节点 pos=1（应删掉 15）",
        dlistDelete(dlist, 1, removed) && removed == 15,
        "删除唯一节点时 q->next == nullptr，删完后 head->next 应为 nullptr。"
    );
    labtest::expectEqVec(
        "[双链表] 删空后正向应为空 []",
        {}, dlistForward(dlist),
        "删除唯一节点后 head->next 应为 nullptr。"
    );
    labtest::expectTrue(
        "[双链表] 越界删除 pos=0 / pos=1(空表) 均应返回 false",
        !dlistDelete(dlist, 0, removed) && !dlistDelete(dlist, 1, removed),
        "请检查 dlistDelete 对 pos < 1 和空表的拦截逻辑。"
    );

    destroyDList(dlist);
    labtest::expectTrue(
        "[双链表] destroyDList 后指针应置为 nullptr",
        dlist == nullptr,
        "请在 destroyDList 末尾执行 head = nullptr。"
    );

    // ==================== Part B：约瑟夫环测试 ====================
    labtest::expectEqVec(
        "[约瑟夫环] 非法输入 n=0, m=3 应返回空数组",
        {}, josephusOrder(0, 3),
        "当 n <= 0 或 m <= 0 时应直接返回空 vector {}。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 非法输入 n=5, m=0 应返回空数组",
        {}, josephusOrder(5, 0),
        "m <= 0 为非法报数上限，应直接返回空数组 {}。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 非法输入 n=-2, m=2 应返回空数组",
        {}, josephusOrder(-2, 2),
        "n <= 0 时应直接返回空数组 {}。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 单人边界 n=1, m=1 应返回 [1]",
        {1}, josephusOrder(1, 1),
        "n=1 时单节点循环链表 head->next == head，出列 1 号并正确 delete 后结束。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 单人多步边界 n=1, m=5 应返回 [1]",
        {1}, josephusOrder(1, 5),
        "n=1 且 m>1 时自己绕圈报数 5 次后仍是 1 号出列。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 步长为 1 边界 n=5, m=1 应依次出列 [1, 2, 3, 4, 5]",
        {1, 2, 3, 4, 5}, josephusOrder(5, 1),
        "m=1 时容易出错！建议初始让 prev = tail, curr = head，步数循环 step=1..m-1 执行 0 次即可直接删除 curr。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 经典用例 n=5, m=2 应为 [2, 4, 1, 5, 3]",
        {2, 4, 1, 5, 3}, josephusOrder(5, 2),
        "请手画 n=5, m=2 的报数过程：curr 自己算第 1 声，只需向前走 m-1 步（不要多走成 m 步！）。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] 经典用例 n=7, m=3 应为 [3, 6, 2, 7, 5, 1, 4]",
        {3, 6, 2, 7, 5, 1, 4}, josephusOrder(7, 3),
        "请检查出列后是否从下一个节点（curr = prev->next）重新从 1 开始报数。"
    );
    labtest::expectEqVec(
        "[约瑟夫环] m > n 绕多圈用例 n=4, m=6 应为 [2, 1, 4, 3]",
        {2, 1, 4, 3}, josephusOrder(4, 6),
        "当 m > 当前剩余人数时，循环链表应自然绕圈继续走满 m-1 步。"
    );

    return labtest::endLab();
}
