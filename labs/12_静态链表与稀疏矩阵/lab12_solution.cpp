// ============================================================================
// 第 12 关（进阶 1）：静态链表与稀疏矩阵快速转置【参考答案】
// 对应教材：2.7 问题 1（静态链表 p.48-51） + 3.5.2（稀疏矩阵快速转置）
// ============================================================================

#include <iostream>
#include <string>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：静态链表（教材 p.48-51 front + tail 双链表游标模型）
// ============================================================================

const int SL_MAX = 20;

struct StaticNode {
    int data; // 数据域
    int next; // 游标域：下一节点的数组下标；-1 表示链表末尾（等价于 nullptr）
};

struct StaticList {
    StaticNode arr[SL_MAX]; // 静态节点池（数组下标 0 .. SL_MAX-1）
    int front;              // 数据链表头节点下标（空表时为 -1）
    int tail;               // 空闲链表头节点下标（无空闲槽位时为 -1）
};

void slInit(StaticList& L) {
    for (int i = 0; i < SL_MAX; ++i) {
        L.arr[i].data = 0;
        L.arr[i].next = (i < SL_MAX - 1) ? (i + 1) : -1;
    }
    L.front = -1;
    L.tail = 0;
}

int slNewNode(StaticList& L) {
    if (L.tail == -1) {
        return -1;
    }
    int idx = L.tail;
    L.tail = L.arr[idx].next;
    L.arr[idx].next = -1;
    return idx;
}

void slFreeNode(StaticList& L, int idx) {
    if (idx < 0 || idx >= SL_MAX) {
        return;
    }
    L.arr[idx].next = L.tail;
    L.tail = idx;
}

bool slInsert(StaticList& L, int pos, int val) {
    if (pos < 1 || L.tail == -1) {
        return false;
    }
    if (pos == 1) {
        int s = slNewNode(L);
        if (s == -1) {
            return false;
        }
        L.arr[s].data = val;
        L.arr[s].next = L.front;
        L.front = s;
        return true;
    }

    int prev = L.front;
    int curPos = 1;
    while (prev != -1 && curPos < pos - 1) {
        prev = L.arr[prev].next;
        ++curPos;
    }
    if (prev == -1) {
        return false;
    }

    int s = slNewNode(L);
    if (s == -1) {
        return false;
    }
    L.arr[s].data = val;
    L.arr[s].next = L.arr[prev].next;
    L.arr[prev].next = s;
    return true;
}

bool slDelete(StaticList& L, int pos, int& outVal) {
    if (L.front == -1 || pos < 1) {
        return false;
    }
    if (pos == 1) {
        int target = L.front;
        outVal = L.arr[target].data;
        L.front = L.arr[target].next;
        slFreeNode(L, target);
        return true;
    }

    int prev = L.front;
    int curPos = 1;
    while (prev != -1 && curPos < pos - 1) {
        prev = L.arr[prev].next;
        ++curPos;
    }
    if (prev == -1 || L.arr[prev].next == -1) {
        return false;
    }

    int target = L.arr[prev].next;
    outVal = L.arr[target].data;
    L.arr[prev].next = L.arr[target].next;
    slFreeNode(L, target);
    return true;
}

std::vector<int> slToVector(const StaticList& L) {
    std::vector<int> res;
    int cur = L.front;
    int steps = 0;
    while (cur != -1 && cur >= 0 && cur < SL_MAX && steps < SL_MAX) {
        res.push_back(L.arr[cur].data);
        cur = L.arr[cur].next;
        ++steps;
    }
    return res;
}

// ============================================================================
// Part B：稀疏矩阵三元组顺序表 + 快速转置（教材 3.5.2）
// ============================================================================

struct Triple {
    int row; // 0-based 行号
    int col; // 0-based 列号
    int val; // 非零元素值
};

struct SparseMatrix {
    int rows;                  // 矩阵总行数
    int cols;                  // 矩阵总列数
    std::vector<Triple> terms; // 按行优先顺序存放的非零三元组
};

SparseMatrix fastTranspose(const SparseMatrix& M) {
    SparseMatrix T;
    T.rows = M.cols;
    T.cols = M.rows;
    if (M.terms.empty() || M.cols <= 0) {
        return T;
    }

    std::vector<int> num(M.cols, 0);
    for (size_t i = 0; i < M.terms.size(); ++i) {
        num[M.terms[i].col]++;
    }

    std::vector<int> cpot(M.cols, 0);
    cpot[0] = 0;
    for (int c = 1; c < M.cols; ++c) {
        cpot[c] = cpot[c - 1] + num[c - 1];
    }

    T.terms.resize(M.terms.size());
    for (size_t i = 0; i < M.terms.size(); ++i) {
        int c = M.terms[i].col;
        int dest = cpot[c];
        T.terms[dest].row = M.terms[i].col;
        T.terms[dest].col = M.terms[i].row;
        T.terms[dest].val = M.terms[i].val;
        ++cpot[c];
    }
    return T;
}

// ================================ 辅助判题工具 ================================

static bool equalTriple(const Triple& a, const Triple& b) {
    return a.row == b.row && a.col == b.col && a.val == b.val;
}

static bool equalMatrix(const SparseMatrix& a, const SparseMatrix& b) {
    if (a.rows != b.rows || a.cols != b.cols || a.terms.size() != b.terms.size()) {
        return false;
    }
    for (size_t i = 0; i < a.terms.size(); ++i) {
        if (!equalTriple(a.terms[i], b.terms[i])) {
            return false;
        }
    }
    return true;
}

static int countFreeChainSafe(const StaticList& L) {
    int cur = L.tail;
    int cnt = 0;
    std::vector<bool> seen(SL_MAX, false);
    while (cur != -1) {
        if (cur < 0 || cur >= SL_MAX || seen[cur]) {
            return -1; // 越界或成环
        }
        seen[cur] = true;
        ++cnt;
        cur = L.arr[cur].next;
    }
    return cnt;
}

// ================================= 自动测试套 =================================

int main() {
    labtest::beginLab("第 12 关：静态链表与稀疏矩阵快速转置");

    // -------------------- Part A 测试：静态链表 --------------------
    {
        StaticList L;
        L.front = 99;
        L.tail = 99;
        for (int i = 0; i < SL_MAX; ++i) {
            L.arr[i].data = 99;
            L.arr[i].next = 99;
        }

        slInit(L);
        labtest::expectEqInt("A1. 初始化后 front 为 -1（空数据链）", -1, L.front,
                             "检查 slInit：数据链表为空时 L.front 应设为 -1");
        labtest::expectEqInt("A2. 初始化后 tail 为 0（空闲链头）", 0, L.tail,
                             "检查 slInit：空闲链表应从下标 0 开始，L.tail = 0");
        labtest::expectEqInt("A3. 初始化后空闲链表长度等于 SL_MAX", SL_MAX, countFreeChainSafe(L),
                             "检查 slInit：arr[0..SL_MAX-2].next = i+1 且 arr[SL_MAX-1].next = -1");

        // 测试 slNewNode 与 slFreeNode
        int n1 = slNewNode(L);
        int n2 = slNewNode(L);
        labtest::expectEqInt("A4. 首次申请节点返回下标 0", 0, n1,
                             "检查 slNewNode：初始 tail=0，第一次应返回 0 并让 tail=1");
        labtest::expectEqInt("A5. 第二次申请节点返回下标 1", 1, n2,
                             "检查 slNewNode：每次申请需将 L.tail 更新为 L.arr[idx].next");
        slFreeNode(L, n1);
        int n3 = slNewNode(L);
        labtest::expectEqInt("A6. 归还后头插复用到刚归还的下标 0", 0, n3,
                             "检查 slFreeNode：应采用头插法 arr[idx].next = tail; tail = idx");

        // 重新初始化测试插入与删除
        slInit(L);
        int out = -999;
        labtest::expectTrue("A7. 空表删除返回 false", !slDelete(L, 1, out),
                            "检查 slDelete：L.front == -1 时应直接返回 false");
        labtest::expectTrue("A8. 空表非法位序 pos=0 插入返回 false", !slInsert(L, 0, 10),
                            "检查 slInsert：pos < 1 必须返回 false");
        labtest::expectTrue("A9. 空表非法位序 pos=2 插入返回 false", !slInsert(L, 2, 10),
                            "检查 slInsert：空表只能在 pos=1 插入，pos=2 应返回 false");
        labtest::expectEqInt("A10. 非法插入不能泄露空闲节点", SL_MAX, countFreeChainSafe(L),
                             "检查 slInsert：非法 pos 必须先拦截（或归还节点），不能白白消耗空闲槽位！");

        labtest::expectTrue("A11. 表头插入 10 (pos=1)", slInsert(L, 1, 10),
                            "检查 slInsert：pos==1 时需更新 L.front");
        labtest::expectTrue("A12. 表尾插入 30 (pos=2)", slInsert(L, 2, 30),
                            "检查 slInsert：在末尾插入需定位前驱 pos-1");
        labtest::expectTrue("A13. 中间插入 20 (pos=2)", slInsert(L, 2, 20),
                            "检查 slInsert：s.next = prev.next; prev.next = s");
        labtest::expectTrue("A14. 新表头插入 5 (pos=1)", slInsert(L, 1, 5),
                            "检查 slInsert：非空表头插时新节点 next 应指向旧 front");
        labtest::expectEqVec("A15. 连续插入后序列为 [5, 10, 20, 30]",
                             {5, 10, 20, 30}, slToVector(L),
                             "检查 slInsert 与 slToVector 的游标遍历顺序");

        labtest::expectTrue("A16. 越界删除 pos=5 返回 false", !slDelete(L, 5, out),
                            "检查 slDelete：超过当前表长应返回 false");
        labtest::expectTrue("A17. 删除表头 pos=1", slDelete(L, 1, out) && out == 5,
                            "检查 slDelete：pos==1 需更新 L.front 并正确带出 outVal");
        labtest::expectTrue("A18. 删除中间 pos=2 (原值 20)", slDelete(L, 2, out) && out == 20,
                            "检查 slDelete：需先改 prev.next 再 slFreeNode(L, target)");
        labtest::expectTrue("A19. 删除表尾 pos=2 (原值 30)", slDelete(L, 2, out) && out == 30,
                            "检查 slDelete：删表尾后新的尾节点 next 应为 -1");
        labtest::expectEqVec("A20. 删除后仅剩 [10]", {10}, slToVector(L),
                             "检查 slDelete 后数据链表是否完整不断裂");
        labtest::expectEqInt("A21. 删除节点已全部归还空闲链（剩余 19 个空闲）", SL_MAX - 1, countFreeChainSafe(L),
                             "检查 slDelete：每次删除必须调用 slFreeNode 归还节点");

        // 极限复用测试：反复删插并装满全部 SL_MAX 个槽位
        slInit(L);
        bool reuseOk = true;
        for (int i = 1; i <= 10; ++i) {
            if (!slInsert(L, i, i)) reuseOk = false;
        }
        for (int i = 0; i < 5; ++i) {
            if (!slDelete(L, 1, out)) reuseOk = false;
        }
        // 此时数据链有 5 个（6..10），空闲链有 15 个；再插 15 个刚好满 20 个
        for (int i = 11; i <= 25; ++i) {
            if (!slInsert(L, i - 5, i)) reuseOk = false;
        }
        labtest::expectTrue("A22. 删除后复用空闲节点可精确插满 SL_MAX(20) 个",
                            reuseOk && static_cast<int>(slToVector(L).size()) == SL_MAX,
                            "检查 slDelete 归还逻辑：若有槽位未归还，此处无法插满 20 个");
        labtest::expectTrue("A23. 已满时再插入返回 false", !slInsert(L, 1, 999),
                            "检查 slInsert：空闲链表为空（tail == -1）时必须返回 false");
        labtest::expectEqInt("A24. 已满时空闲链长度为 0", 0, countFreeChainSafe(L),
                             "检查 slNewNode：分配完最后一个节点后 tail 应变为 -1");

        // 全部清空后再重新插满一次
        bool refillOk = true;
        for (int i = 0; i < SL_MAX; ++i) {
            if (!slDelete(L, 1, out)) refillOk = false;
        }
        for (int i = 1; i <= SL_MAX; ++i) {
            if (!slInsert(L, 1, i)) refillOk = false;
        }
        labtest::expectTrue("A25. 全部清空后再重插满 SL_MAX 个依然成功",
                            refillOk && static_cast<int>(slToVector(L).size()) == SL_MAX,
                            "检查空表后再次复用全部槽位是否正常");
    }

    // -------------------- Part B 测试：稀疏矩阵快速转置 --------------------
    {
        // 用例 1：常规 4x5 非方阵（包含同列多元素 + 空列 col=2）
        SparseMatrix M1;
        M1.rows = 4;
        M1.cols = 5;
        M1.terms = {
            {0, 1, 12},
            {0, 4, 9},
            {1, 0, -3},
            {1, 3, 7},
            {2, 1, 5},
            {3, 0, 8},
            {3, 4, -2}
        };
        SparseMatrix expectT1;
        expectT1.rows = 5;
        expectT1.cols = 4;
        expectT1.terms = {
            {0, 1, -3},
            {0, 3, 8},
            {1, 0, 12},
            {1, 2, 5},
            {3, 1, 7},
            {4, 0, 9},
            {4, 3, -2}
        };
        SparseMatrix T1 = fastTranspose(M1);
        labtest::expectTrue("B1. 非方阵(4x5)含空列快速转置行列与三元组完全正确",
                            equalMatrix(expectT1, T1),
                            "检查 fastTranspose：确认 T.rows=M.cols、T.cols=M.rows、num/cpot 递推及 ++cpot[c]");

        // 用例 2：二次转置还原自身
        SparseMatrix T1Again = fastTranspose(T1);
        labtest::expectTrue("B2. 二次转置 fastTranspose(fastTranspose(M)) 完美还原原矩阵",
                            equalMatrix(M1, T1Again),
                            "检查 fastTranspose：若同列元素的相对顺序被打乱，二次转置后将与原矩阵不一致");

        // 用例 3：单元素非方阵
        SparseMatrix M2;
        M2.rows = 3;
        M2.cols = 4;
        M2.terms = {{2, 3, 42}};
        SparseMatrix expectT2;
        expectT2.rows = 4;
        expectT2.cols = 3;
        expectT2.terms = {{3, 2, 42}};
        labtest::expectTrue("B3. 单元素矩阵(3x4)快速转置",
                            equalMatrix(expectT2, fastTranspose(M2)),
                            "检查 fastTranspose：单个非零元 (2,3,42) 转置后应为 (3,2,42)");

        // 用例 4：全零矩阵（terms 为空）
        SparseMatrix M3;
        M3.rows = 3;
        M3.cols = 5;
        SparseMatrix expectT3;
        expectT3.rows = 5;
        expectT3.cols = 3;
        labtest::expectTrue("B4. 全零矩阵(3x5)转置后为(5x3)且三元组为空",
                            equalMatrix(expectT3, fastTranspose(M3)),
                            "检查 fastTranspose：M.terms 为空时仍需正确交换 rows 与 cols，并返回空 terms");

        // 用例 5：0x0 空矩阵边界
        SparseMatrix M4;
        M4.rows = 0;
        M4.cols = 0;
        SparseMatrix T4 = fastTranspose(M4);
        labtest::expectTrue("B5. 0x0 空矩阵边界不越界",
                            T4.rows == 0 && T4.cols == 0 && T4.terms.empty(),
                            "检查 fastTranspose：M.cols == 0 时不可访问 cpot[0]");
    }

    return labtest::endLab();
}
