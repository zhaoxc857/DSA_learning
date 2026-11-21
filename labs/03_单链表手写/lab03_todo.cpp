// ============================================================================
// 实验 03：带头结点的单链表手写（第 2 章核心）
// ============================================================================
// 约定：
//   - 本实验采用【带头结点的单链表】：
//     head 指向头结点，头结点的 data 不存放有效数据；
//     第 1 个有效数据节点是 head->next；空链表时 head->next == nullptr。
//   - 按位序操作（insertAt / deleteAt）均采用教材约定：位序 pos 从 1 开始！
//   - 提示：遇到链表指针绕晕时，拿纸画 3 个格子 [head] -> [a1] -> [a2] -> nullptr，
//     标出 p、q、s 再动手写代码，准确率能直接翻倍。
// ============================================================================

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct LNode {
    int data;
    LNode* next;
};

// ----------------------------------------------------------------------------
// 【函数目标】1. 创建一个带头结点的空单链表
//   返回值：指向头结点的指针 head（head->data 可置 0，head->next 必须为 nullptr）
// 【画图与思路推导】
//   1) 用 new LNode 在堆上申请一个头结点 head；
//   2) 把 head->data 设为 0，head->next 设为 nullptr；
//   3) 返回 head。
// 【边界提醒】
//   - 不要忘记把 head->next 初始化为 nullptr，否则它是一个随机野指针！
// ----------------------------------------------------------------------------
LNode* createList() {
    // TODO: 创建带头结点的空链表并返回 head
    return nullptr;
}

// ----------------------------------------------------------------------------
// 【函数目标】2. 头插法：在链表最前面（头结点之后）插入元素 x
//   参数：head - 头结点指针；x - 待插入的整数
// 【画图与思路推导】
//   插入前：[head] -> [旧首节点] -> ...
//   1) 若 head == nullptr，直接返回；
//   2) 新建节点 s，令 s->data = x；
//   3) 先让 s 接住原来的后续链表：s->next = head->next；
//   4) 再让 head 指向 s：head->next = s。
// 【边界提醒】
//   - 步骤 3 和 4 的顺序绝对不能反！如果先写 head->next = s，原来的链表就断链丢失了。
//   - 空链表时 head->next == nullptr，上述 2 行代码同样适用，无需特殊分支。
// ----------------------------------------------------------------------------
void pushFront(LNode* head, int x) {
    // TODO: 实现带头结点单链表的头插法
    (void)head;
    (void)x;
}

// ----------------------------------------------------------------------------
// 【函数目标】3. 尾插法：在链表末尾追加元素 x
//   参数：head - 头结点指针；x - 待插入的整数
// 【画图与思路推导】
//   1) 若 head == nullptr，直接返回；
//   2) 定义工作指针 p = head，不断向后走：while (p->next != nullptr) p = p->next；
//   3) 循环结束时 p 指向当前最后一个节点（空表时 p 就是 head）；
//   4) 新建节点 s（data = x, next = nullptr），令 p->next = s。
// 【边界提醒】
//   - 循环条件是 p->next != nullptr，不是 p != nullptr！
//     如果写成 p != nullptr，出循环时 p 已经是 nullptr，无法再挂接新节点。
// ----------------------------------------------------------------------------
void pushBack(LNode* head, int x) {
    // TODO: 实现带头结点单链表的尾插法
    (void)head;
    (void)x;
}

// ----------------------------------------------------------------------------
// 【函数目标】4. 求单链表的有效元素个数（不含头结点）
//   参数：head - 头结点指针
//   返回值：有效数据节点数量；若 head == nullptr 返回 0
// 【画图与思路推导】
//   1) 若 head == nullptr，返回 0；
//   2) 令 p = head->next，计数器 len = 0；
//   3) while (p != nullptr) { ++len; p = p->next; }；
//   4) 返回 len。
// 【边界提醒】
//   - 头结点不计入长度！所以要从 head->next 开始数，不能从 head 开始数。
// ----------------------------------------------------------------------------
int getLength(LNode* head) {
    // TODO: 统计有效数据节点个数
    (void)head;
    return 0;
}

// ----------------------------------------------------------------------------
// 【函数目标】5. 按位序插入：在第 pos 个位置插入元素 x
//   参数：head - 头结点指针；pos - 位序（从 1 开始，合法范围 1 .. len+1）；x - 待插元素
//   返回值：插入成功返回 true，位序非法（pos < 1 或 pos > len+1）或 head 为空返回 false
// 【画图与思路推导】
//   要在第 pos 个位置插入，必须先找到第 pos-1 个节点 p（前驱节点）：
//   1) 若 head == nullptr || pos < 1，返回 false；
//   2) 设 LNode* p = head; int idx = 0; （把头结点视为第 0 个节点）
//   3) 循环找前驱：while (p != nullptr && idx < pos - 1) { p = p->next; ++idx; }
//   4) 若循环结束后 p == nullptr，说明 pos 超过了 len + 1（越界），返回 false；
//   5) 新建节点 s（data = x），先 s->next = p->next; 再 p->next = s; 返回 true。
// 【边界提醒】
//   - 空表时 len == 0，pos == 1 是合法的（p 停在 head，相当于头插）；pos == 2 非法。
//   - 在表尾插入时 pos == len + 1，p 停在最后一个数据节点，p->next 为 nullptr，依然适用。
// ----------------------------------------------------------------------------
bool insertAt(LNode* head, int pos, int x) {
    // TODO: 按位序 pos (1..len+1) 插入元素 x
    (void)head;
    (void)pos;
    (void)x;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】6. 按位序删除：删除第 pos 个数据节点，并通过 removedVal 带回被删元素的值
//   参数：head - 头结点指针；pos - 位序（从 1 开始，合法范围 1 .. len）；removedVal - 输出参数
//   返回值：删除成功返回 true；位序非法或空表返回 false
// 【画图与思路推导】
//   要删除第 pos 个节点，同样先找第 pos-1 个前驱节点 p：
//   1) 若 head == nullptr || pos < 1，返回 false；
//   2) 令 p = head, idx = 0，循环走到第 pos-1 个节点；
//   3) 检查 p == nullptr || p->next == nullptr：只要满足其一，说明第 pos 个节点不存在，返回 false；
//   4) 保存待删节点：LNode* q = p->next;
//   5) 取出数据 removedVal = q->data，摘链 p->next = q->next，最后 delete q，返回 true。
// 【边界提醒】
//   - 千万别漏掉 p->next == nullptr 的检查！当 pos == len + 1 时，p 恰好停在尾节点，
//     此时 p != nullptr，但 p->next 是 nullptr，没有节点可删！
//   - 必须先摘链并保存数据，再 delete q，防止内存泄漏或悬空指针访问。
// ----------------------------------------------------------------------------
bool deleteAt(LNode* head, int pos, int& removedVal) {
    // TODO: 按位序 pos (1..len) 删除节点并释放内存
    (void)head;
    (void)pos;
    (void)removedVal;
    return false;
}

// ----------------------------------------------------------------------------
// 【函数目标】7. 原地反转带头结点的单链表（不能 new 新节点，也不能只交换 data）
//   参数：head - 头结点指针
// 【画图与思路推导】
//   推荐最清晰不易错的【摘下再头插法】：
//   原链表：[head] -> [10] -> [20] -> [30] -> nullptr
//   1) 若 head == nullptr || head->next == nullptr，直接返回（空表或单节点无需反转）；
//   2) 记 LNode* curr = head->next;（抓住尚未处理的首节点）
//   3) 先把头结点后继断开：head->next = nullptr;（此时头结点后面是一个新的空表）
//   4) 循环 while (curr != nullptr)：
//        a. 先保存下一个待处理节点：LNode* nxt = curr->next;
//        b. 把 curr 头插到 head 后面：curr->next = head->next; head->next = curr;
//        c. 前进一步：curr = nxt;
//   （画图走一遍：10 头插 -> [10]；20 头插 -> [20,10]；30 头插 -> [30,20,10]！）
// 【边界提醒】
//   - 一定记得先写 head->next = nullptr，否则反转后原首节点的 next 会指回自己形成死循环！
//   - 测试套会检查节点内存地址是否确实是原节点逆序，切勿 new 新节点偷换。
// ----------------------------------------------------------------------------
void reverseList(LNode* head) {
    // TODO: 原地反转带头结点的单链表
    (void)head;
}

// ----------------------------------------------------------------------------
// 【函数目标】8. 销毁整个单链表（释放所有数据节点 + 头结点），并将 head 置为 nullptr
//   参数：head - 指向头结点指针的引用（LNode*&），修改它能同步改掉调用者的指针
// 【画图与思路推导】
//   1) 令 LNode* p = head;
//   2) 循环 while (p != nullptr)：
//        a. 先保存下一个节点：LNode* nxt = p->next;
//        b. 释放当前节点：delete p;
//        c. p = nxt;
//   3) 循环结束后，置 head = nullptr;
// 【边界提醒】
//   - 不能先 delete p 再访问 p->next！必须先用 nxt 存下 p->next。
//   - 头结点也要释放，且最后必须把 head 置空，避免调用者手里留下悬空指针。
// ----------------------------------------------------------------------------
void destroyList(LNode*& head) {
    // TODO: 释放所有节点（含头结点）并将 head 置为 nullptr
    (void)head;
}

// ============================================================================
// 以下为自动评测测试代码（请勿修改）
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
