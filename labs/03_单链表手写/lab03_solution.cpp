// ============================================================================
// 实验 03：带头结点的单链表手写 —— 参考答案
// ============================================================================

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct LNode {
    int data;
    LNode* next;
};

LNode* createList() {
    LNode* head = new LNode;
    head->data = 0;
    head->next = nullptr;
    return head;
}

void pushFront(LNode* head, int x) {
    if (head == nullptr) return;
    LNode* s = new LNode;
    s->data = x;
    s->next = head->next;
    head->next = s;
}

void pushBack(LNode* head, int x) {
    if (head == nullptr) return;
    LNode* p = head;
    while (p->next != nullptr) {
        p = p->next;
    }
    LNode* s = new LNode;
    s->data = x;
    s->next = nullptr;
    p->next = s;
}

int getLength(LNode* head) {
    if (head == nullptr) return 0;
    int len = 0;
    LNode* p = head->next;
    while (p != nullptr) {
        ++len;
        p = p->next;
    }
    return len;
}

bool insertAt(LNode* head, int pos, int x) {
    if (head == nullptr || pos < 1) return false;
    LNode* p = head;
    int idx = 0;
    while (p != nullptr && idx < pos - 1) {
        p = p->next;
        ++idx;
    }
    if (p == nullptr) return false;

    LNode* s = new LNode;
    s->data = x;
    s->next = p->next;
    p->next = s;
    return true;
}

bool deleteAt(LNode* head, int pos, int& removedVal) {
    if (head == nullptr || pos < 1) return false;
    LNode* p = head;
    int idx = 0;
    while (p != nullptr && idx < pos - 1) {
        p = p->next;
        ++idx;
    }
    if (p == nullptr || p->next == nullptr) return false;

    LNode* q = p->next;
    removedVal = q->data;
    p->next = q->next;
    delete q;
    return true;
}

void reverseList(LNode* head) {
    if (head == nullptr || head->next == nullptr) return;
    LNode* curr = head->next;
    head->next = nullptr;
    while (curr != nullptr) {
        LNode* nxt = curr->next;
        curr->next = head->next;
        head->next = curr;
        curr = nxt;
    }
}

void destroyList(LNode*& head) {
    LNode* p = head;
    while (p != nullptr) {
        LNode* nxt = p->next;
        delete p;
        p = nxt;
    }
    head = nullptr;
}

// ============================================================================
// 以下为自动评测测试代码（与 lab03_todo.cpp 完全一致）
// ============================================================================

static std::vector<int> listToVec(LNode* head) {
    std::vector<int> res;
    if (head == nullptr) return res;
    LNode* p = head->next;
    int guard = 0;
    while (p != nullptr && guard < 10000) {
        res.push_back(p->data);
        p = p->next;
        ++guard;
    }
    return res;
}

static std::vector<LNode*> collectNodeAddrs(LNode* head) {
    std::vector<LNode*> addrs;
    if (head == nullptr) return addrs;
    LNode* p = head->next;
    int guard = 0;
    while (p != nullptr && guard < 10000) {
        addrs.push_back(p);
        p = p->next;
        ++guard;
    }
    return addrs;
}

int main() {
    labtest::beginLab("实验 03：带头结点的单链表手写");

    // --- 测试 1：空表初始化与边界操作 ---
    LNode* list = createList();
    labtest::expectTrue(
        "createList 创建头结点非空",
        list != nullptr,
        "请在 createList 中使用 new LNode 创建头结点并返回。"
    );
    labtest::expectTrue(
        "空表头结点 next 应为 nullptr",
        list != nullptr && list->next == nullptr,
        "请确保 createList 中将 head->next 初始化为 nullptr。"
    );
    labtest::expectEqInt(
        "空表长度应为 0",
        0, getLength(list),
        "请检查 getLength 是否把头结点也误算进长度了（应从 head->next 开始数）。"
    );

    int removed = -999;
    labtest::expectTrue(
        "空表删除 pos=1 应返回 false",
        !deleteAt(list, 1, removed),
        "空表时 head->next == nullptr，deleteAt 必须检测 p->next == nullptr 并返回 false。"
    );
    labtest::expectTrue(
        "空表插入 pos=0 越界应返回 false",
        !insertAt(list, 0, 100),
        "位序从 1 开始，insertAt 必须先拦截 pos < 1 的非法输入。"
    );
    labtest::expectTrue(
        "空表插入 pos=-3 越界应返回 false",
        !insertAt(list, -3, 100),
        "insertAt 必须先拦截 pos < 1 的负数位序。"
    );
    labtest::expectTrue(
        "空表插入 pos=2 越界应返回 false",
        !insertAt(list, 2, 100),
        "空表长度 len=0，合法插入位置只有 pos=1；查找前驱后若 p==nullptr 应返回 false。"
    );

    reverseList(list);
    labtest::expectEqVec(
        "空表反转后仍为空",
        {}, listToVec(list),
        "reverseList 在空表时（head->next == nullptr）应直接返回，不要解引用空指针。"
    );

    // --- 测试 2：单节点插入、反转、删除 ---
    labtest::expectTrue(
        "空表在 pos=1 插入单节点 42",
        insertAt(list, 1, 42),
        "空表在 pos=1 插入时前驱 p 就是 head，请检查 insertAt 的前驱定位循环。"
    );
    labtest::expectEqInt(
        "单节点链表长度应为 1",
        1, getLength(list),
        "请检查 insertAt 挂接指针和 getLength 计数逻辑。"
    );
    reverseList(list);
    labtest::expectEqVec(
        "单节点反转后仍为 [42]",
        {42}, listToVec(list),
        "reverseList 对单节点反转时不能破坏唯一节点的 next == nullptr。"
    );
    labtest::expectTrue(
        "单节点删除越界 pos=2 应返回 false",
        !deleteAt(list, 2, removed),
        "len=1 时删除 pos=2，前驱 p 是尾节点但 p->next == nullptr，必须返回 false。"
    );
    labtest::expectTrue(
        "单节点删除 pos=1 应返回 true",
        deleteAt(list, 1, removed),
        "请检查 deleteAt 删除第 1 个节点时的前驱定位与摘链逻辑。"
    );
    labtest::expectEqInt(
        "单节点删除带回的值应为 42",
        42, removed,
        "请在 delete q 之前把 q->data 赋值给 removedVal。"
    );
    labtest::expectEqInt(
        "单节点删除后链表长度归 0",
        0, getLength(list),
        "删除唯一节点后 head->next 应变为 nullptr，长度归 0。"
    );

    // --- 测试 3：头插法倒序特性 ---
    pushFront(list, 10);
    pushFront(list, 20);
    pushFront(list, 30);
    labtest::expectEqVec(
        "头插 10, 20, 30 应得到倒序 [30, 20, 10]",
        {30, 20, 10}, listToVec(list),
        "头插法每次应插在 head 之后：先 s->next = head->next，再 head->next = s。"
    );
    labtest::expectEqInt(
        "头插 3 个节点后长度应为 3",
        3, getLength(list),
        "请检查 pushFront 是否丢失了旧链表，或 getLength 计数错误。"
    );
    destroyList(list);
    labtest::expectTrue(
        "destroyList 后 head 应置为 nullptr",
        list == nullptr,
        "destroyList 参数为引用 LNode*& head，释放完所有节点后必须执行 head = nullptr。"
    );

    // --- 测试 4：尾插法保序特性 ---
    LNode* list2 = createList();
    pushBack(list2, 10);
    pushBack(list2, 20);
    pushBack(list2, 30);
    labtest::expectEqVec(
        "尾插 10, 20, 30 应保持原序 [10, 20, 30]",
        {10, 20, 30}, listToVec(list2),
        "尾插法需先用 while (p->next != nullptr) 走到尾节点，再挂接新节点。"
    );

    // --- 测试 5：表头 / 中间 / 表尾按位插入与越界 ---
    labtest::expectTrue(
        "表头插入 pos=1 值 5",
        insertAt(list2, 1, 5),
        "请检查 insertAt 在 pos=1 时的逻辑。"
    );
    labtest::expectTrue(
        "中间插入 pos=3 值 15",
        insertAt(list2, 3, 15),
        "请检查 insertAt 寻找第 pos-1 个前驱节点的循环条件（idx < pos - 1）。"
    );
    labtest::expectTrue(
        "表尾插入 pos=6 (len+1) 值 35",
        insertAt(list2, 6, 35),
        "在 pos == len + 1 处插入是合法的表尾追加，此时前驱 p 停在原尾节点。"
    );
    labtest::expectTrue(
        "越界插入 pos=8 (> len+1) 应返回 false",
        !insertAt(list2, 8, 99),
        "当前 len=6，最大合法插入位序为 7，pos=8 应返回 false。"
    );
    labtest::expectEqVec(
        "多位置插入后序列应为 [5, 10, 15, 20, 30, 35]",
        {5, 10, 15, 20, 30, 35}, listToVec(list2),
        "请核对 insertAt 的两步指针连接顺序：先 s->next = p->next，再 p->next = s。"
    );

    // --- 测试 6：表头 / 表尾 / 中间按位删除与越界 ---
    labtest::expectTrue(
        "删除表头 pos=1 应成功",
        deleteAt(list2, 1, removed) && removed == 5,
        "删除表头时前驱 p=head，被删节点 q=head->next，摘链后 head->next 指向原第 2 节点。"
    );
    labtest::expectTrue(
        "删除表尾 pos=5 应成功",
        deleteAt(list2, 5, removed) && removed == 35,
        "删除表尾时被删节点 q->next == nullptr，摘链后前驱 p->next 变为 nullptr。"
    );
    labtest::expectTrue(
        "删除中间 pos=2 应成功",
        deleteAt(list2, 2, removed) && removed == 15,
        "请检查 deleteAt 的前驱定位与 removedVal 赋值。"
    );
    labtest::expectTrue(
        "越界删除 pos=0 应返回 false",
        !deleteAt(list2, 0, removed),
        "位序从 1 开始，deleteAt 必须拦截 pos < 1。"
    );
    labtest::expectTrue(
        "越界删除 pos=4 (> len) 应返回 false",
        !deleteAt(list2, 4, removed),
        "当前剩余 3 个元素，删除 pos=4 应返回 false。"
    );
    labtest::expectEqVec(
        "删除后链表应为 [10, 20, 30]",
        {10, 20, 30}, listToVec(list2),
        "请检查 deleteAt 摘链操作 p->next = q->next。"
    );

    // --- 测试 7：原地反转（校验元素顺序 + 节点地址原地逆序） ---
    std::vector<LNode*> beforeAddrs = collectNodeAddrs(list2);
    reverseList(list2);
    labtest::expectEqVec(
        "反转 [10, 20, 30] 应得到 [30, 20, 10]",
        {30, 20, 10}, listToVec(list2),
        "请画图检查 reverseList 摘下再头插或三指针翻转的每一步指针指向。"
    );
    std::vector<LNode*> afterAddrs = collectNodeAddrs(list2);
    bool isInPlaceReversed = (beforeAddrs.size() == 3 && afterAddrs.size() == 3 &&
                              afterAddrs[0] == beforeAddrs[2] &&
                              afterAddrs[1] == beforeAddrs[1] &&
                              afterAddrs[2] == beforeAddrs[0]);
    labtest::expectTrue(
        "反转必须是原地修改指针（不新建节点、不偷换 data）",
        isInPlaceReversed,
        "reverseList 必须直接调整原有节点的 next 指针，不能 new 新节点，也不能只交换 data 值。"
    );

    reverseList(list2);
    labtest::expectEqVec(
        "再次反转应恢复为 [10, 20, 30]",
        {10, 20, 30}, listToVec(list2),
        "二次反转失败通常是因为第一次反转后尾节点的 next 没有正确置为 nullptr。"
    );

    // --- 测试 8：销毁链表与重复销毁安全 ---
    destroyList(list2);
    labtest::expectTrue(
        "销毁 list2 后指针应为 nullptr",
        list2 == nullptr,
        "请在 destroyList 末尾将 head = nullptr。"
    );
    destroyList(list2);
    labtest::expectTrue(
        "对已是 nullptr 的指针再次 destroyList 应安全无副作用",
        list2 == nullptr,
        "当 head == nullptr 时，destroyList 循环不执行并安全返回即可。"
    );

    return labtest::endLab();
}
