// ============================================================================
// 第 14 关（终极验收）：《数据结构与算法》全书终极盲写大考
//
// 考试规则：
//   本关呼应《写代码通关指南》终极验收，收录全书最核心的 6 大必背手写算法。
//   本卷【刻意精简提示】：只给出接口约定与验收标准，不提供分步伪代码！
//   请合上笔记、靠肌肉记忆独立完成全部 6 题，一次通过全套测试！
//
// 编译评测命令（在 labs 目录下）：
//   python judge.py 14
// ============================================================================

#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
#include "../common/test_kit.h"

const int INF = 1000000000;

struct Node {
    int data;
    Node* next;
    explicit Node(int v = 0, Node* n = nullptr) : data(v), next(n) {}
};

struct TNode {
    int val;
    TNode* left;
    TNode* right;
    explicit TNode(int v = 0, TNode* l = nullptr, TNode* r = nullptr)
        : val(v), left(l), right(r) {}
};

// ============================================================================
// 考题 1：不带头结点单链表原地反转
// 【函数目标】
//   原地反转以 head 为首节点的单链表，返回反转后的新头指针。
// 【边界提醒】
//   - 要求 O(1) 额外空间，不得 new 新节点；正确处理空链表与单节点链表。
// ============================================================================
Node* reverseSinglyList(Node* head) {
    // TODO: 盲写不带头结点单链表原地反转
    (void)head;
    return nullptr;
}

// ============================================================================
// 考题 2：循环队列（容量 K，底层数组 K + 1，牺牲一个空位判满）
// 【函数目标】
//   - init(k)     ：初始化队列最多存放 k 个元素（底层数组大小 k + 1），清空队头队尾
//   - empty()     ：队空返回 true，否则 false
//   - full()      ：队满返回 true，否则 false
//   - push(val)   ：队未满则入队并返回 true；队满返回 false
//   - pop(outVal) ：队非空则出队并写入 outVal 返回 true；队空返回 false
// 【边界提醒】
//   - 指针回绕使用取模运算，反复入队出队超过 K 次后依然正确；init(0) 不可除零。
// ============================================================================
struct MiniRingQueue {
    std::vector<int> buf;
    int capacity;
    int front;
    int rear;

    MiniRingQueue() : capacity(0), front(0), rear(0) {}

    void init(int k) {
        // TODO: 初始化容量 k（底层数组 k + 1）
        (void)k;
    }

    bool empty() const {
        // TODO: 判空
        return true;
    }

    bool full() const {
        // TODO: 判满
        return false;
    }

    bool push(int val) {
        // TODO: 入队
        (void)val;
        return false;
    }

    bool pop(int& outVal) {
        // TODO: 出队
        (void)outVal;
        return false;
    }
};

// ============================================================================
// 考题 3：二叉树层序遍历 & 最大深度
// 【函数目标】
//   - treeLevelOrder(root)：从上到下、从左到右按层返回所有节点的值
//   - treeMaxDepth(root)  ：返回二叉树的最大深度（空树深度为 0，单节点为 1）
// 【边界提醒】
//   - 正确处理空树、单节点、单支退化斜树。
// ============================================================================
std::vector<int> treeLevelOrder(TNode* root) {
    // TODO: 盲写二叉树层序遍历（队列 BFS）
    (void)root;
    return std::vector<int>();
}

int treeMaxDepth(TNode* root) {
    // TODO: 盲写二叉树最大深度
    (void)root;
    return 0;
}

// ============================================================================
// 考题 4：Dijkstra 单源最短路径（非负权图）
// 【函数目标】
//   顶点编号 0 .. n-1，adj[u] 存放若干 {v, w} 表示有向边 u -> v（边权 w >= 0）。
//   返回长度为 n 的最短距离数组 dist：dist[src] = 0，不可达顶点保持 INF。
// 【边界提醒】
//   - 正确处理不可达点、重边（平行边）、自环以及 n == 0。
// ============================================================================
std::vector<int> shortestPathsDijkstra(
    int n,
    const std::vector<std::vector<std::pair<int, int>>>& adj,
    int src) {
    // TODO: 盲写 Dijkstra 单源最短路
    (void)n;
    (void)adj;
    (void)src;
    return std::vector<int>();
}

// ============================================================================
// 考题 5：二叉搜索树（BST）删除节点（含双子节点情况）
// 【函数目标】
//   在以 root 为根的 BST 中删除值为 key 的节点（需 delete 释放被删节点），
//   并返回删除后的新根节点指针；若 key 不存在则保持树不变返回原 root。
// 【边界提醒】
//   - 完整覆盖：空树、key 不存在、删叶子、删单孩子节点、删双孩子节点（含删除根节点）。
// ============================================================================
TNode* bstErase(TNode* root, int key) {
    // TODO: 盲写 BST 删除（叶子 / 单孩子 / 双孩子中序后继替换）
    (void)key;
    return root;
}

// ============================================================================
// 考题 6：快速排序 & 归并排序（均为原地升序排序）
// 【函数目标】
//   - fastSort(a)        ：手写快速排序，将 vector<int> a 原地升序排列
//   - stableMergeSort(a) ：手写归并排序，将 vector<int> a 原地升序排列
// 【边界提醒】
//   - 禁止直接调用 std::sort / std::stable_sort！
//   - 正确处理空数组、单元素、已排序、逆序、大量重复元素及负数。
// ============================================================================
void fastSort(std::vector<int>& a) {
    // TODO: 盲写快速排序（原地升序）
    (void)a;
}

void stableMergeSort(std::vector<int>& a) {
    // TODO: 盲写归并排序（原地升序）
    (void)a;
}

// ================================ 辅助判题工具 ================================

static std::vector<int> listToVecSafe(Node* head, int limit) {
    std::vector<int> res;
    Node* cur = head;
    int steps = 0;
    while (cur != nullptr && steps < limit) {
        res.push_back(cur->data);
        cur = cur->next;
        ++steps;
    }
    return res;
}

static TNode* bstInsertHelper(TNode* root, int key) {
    if (root == nullptr) return new TNode(key);
    if (key < root->val) root->left = bstInsertHelper(root->left, key);
    else if (key > root->val) root->right = bstInsertHelper(root->right, key);
    return root;
}

static void inorderHelper(TNode* root, std::vector<int>& out) {
    if (root == nullptr) return;
    inorderHelper(root->left, out);
    out.push_back(root->val);
    inorderHelper(root->right, out);
}

static void freeTreeHelper(TNode* root) {
    if (root == nullptr) return;
    freeTreeHelper(root->left);
    freeTreeHelper(root->right);
    delete root;
}

// ================================= 自动测试套 =================================

int main() {
    labtest::beginLab("第 14 关：全书终极盲写大考（6 大必背手写算法）");

    // -------------------- 考题 1 测试：单链表原地反转 --------------------
    {
        labtest::expectTrue("T1-1. 空链表反转返回 nullptr",
                            reverseSinglyList(nullptr) == nullptr,
                            "检查 reverseSinglyList：head == nullptr 时应直接返回 nullptr");

        Node single(42);
        Node* rSingle = reverseSinglyList(&single);
        labtest::expectTrue("T1-2. 单节点链表反转返回自身且 next==nullptr",
                            rSingle == &single && rSingle->next == nullptr && rSingle->data == 42,
                            "检查 reverseSinglyList：单节点反转后应保持原节点不变");

        std::vector<Node> pool = {Node(1), Node(2), Node(3), Node(4), Node(5)};
        for (int i = 0; i < 4; ++i) pool[i].next = &pool[i + 1];
        Node* rev = reverseSinglyList(&pool[0]);
        labtest::expectEqVec("T1-3. [1,2,3,4,5] 原地反转后为 [5,4,3,2,1]",
                             {5, 4, 3, 2, 1}, listToVecSafe(rev, 10),
                             "检查 reverseSinglyList：三指针 prev/cur/nxt 推进顺序及最终返回 prev");
        labtest::expectTrue("T1-4. 原地反转确认复用原节点地址（未重新 new）",
                            rev == &pool[4] && pool[0].next == nullptr,
                            "检查 reverseSinglyList：必须原地改指针，原首节点 next 应变为 nullptr");
    }

    // -------------------- 考题 2 测试：循环队列 --------------------
    {
        MiniRingQueue q;
        q.init(3);
        int out = -1;
        labtest::expectTrue("T2-1. 刚初始化时 empty()==true 且 full()==false",
                            q.empty() && !q.full(),
                            "检查 MiniRingQueue::init/empty/full：初始 front==rear==0");
        labtest::expectTrue("T2-2. 空队列 pop 返回 false",
                            !q.pop(out),
                            "检查 MiniRingQueue::pop：empty() 时不可移动 front，应返回 false");

        bool push3 = q.push(10) && q.push(20) && q.push(30);
        labtest::expectTrue("T2-3. 容量 3 连续入队 3 个成功且满队",
                            push3 && q.full() && !q.empty(),
                            "检查 MiniRingQueue::push/full：底层数组应为 K+1，判满 (rear+1)%cap == front");
        labtest::expectTrue("T2-4. 满队时再 push 返回 false",
                            !q.push(40),
                            "检查 MiniRingQueue::push：full() 时必须拒绝入队");

        // 出队 2 个再入队 2 个，测试环形回绕！
        int a = -1, b = -1, c = -1, d = -1, e = -1;
        bool wrapOk = q.pop(a) && q.pop(b) && q.push(40) && q.push(50) && q.full()
                      && q.pop(c) && q.pop(d) && q.pop(e) && q.empty();
        labtest::expectTrue("T2-5. 循环队列跨尾回绕后 FIFO 顺序完全正确",
                            wrapOk && a == 10 && b == 20 && c == 30 && d == 40 && e == 50,
                            "检查 MiniRingQueue：front 和 rear 更新必须对 (capacity + 1) 取模");
    }

    // -------------------- 考题 3 测试：二叉树层序遍历与最大深度 --------------------
    {
        labtest::expectEqVec("T3-1. 空树层序遍历返回 {}", {}, treeLevelOrder(nullptr),
                             "检查 treeLevelOrder：root == nullptr 直接返回空 vector");
        labtest::expectEqInt("T3-2. 空树最大深度为 0", 0, treeMaxDepth(nullptr),
                             "检查 treeMaxDepth：空树深度约定为 0");

        /*
                1
               / \
              2   3
             /   / \
            4   5   6
                 \
                  7
        */
        TNode n7(7), n4(4), n5(5, nullptr, &n7), n6(6);
        TNode n2(2, &n4, nullptr), n3(3, &n5, &n6);
        TNode root(1, &n2, &n3);

        labtest::expectEqVec("T3-3. 非完全二叉树层序遍历为 [1,2,3,4,5,6,7]",
                             {1, 2, 3, 4, 5, 6, 7}, treeLevelOrder(&root),
                             "检查 treeLevelOrder：队列先入左孩子再入右孩子，判空后入队");
        labtest::expectEqInt("T3-4. 非完全二叉树最大深度为 4",
                             4, treeMaxDepth(&root),
                             "检查 treeMaxDepth：1 + max(depth(left), depth(right))");

        TNode only(99);
        labtest::expectEqInt("T3-5. 单节点树最大深度为 1", 1, treeMaxDepth(&only),
                             "检查 treeMaxDepth 单节点边界");
    }

    // -------------------- 考题 4 测试：Dijkstra 单源最短路 --------------------
    {
        // 5 点有向带权图（含重边、绕路更短、以及不可达孤立点 4）
        // 0->1(10), 0->1(4) [重边], 0->2(1), 2->1(2), 1->3(1), 2->3(5)
        // 从 0 出发最短路：dist = [0, 3, 1, 4, INF]
        int n = 5;
        std::vector<std::vector<std::pair<int, int>>> adj(n);
        adj[0].push_back({1, 10});
        adj[0].push_back({1, 4});
        adj[0].push_back({2, 1});
        adj[2].push_back({1, 2});
        adj[1].push_back({3, 1});
        adj[2].push_back({3, 5});
        adj[0].push_back({0, 7}); // 自环

        labtest::expectEqVec("T4-1. Dijkstra 5 点图（含重边/自环/不可达点）最短路正确",
                             {0, 3, 1, 4, INF}, shortestPathsDijkstra(n, adj, 0),
                             "检查 shortestPathsDijkstra：初始化 dist 为 INF、dist[src]=0，优先队列跳过过期状态");

        labtest::expectEqVec("T4-2. Dijkstra 从孤立点 4 出发仅自身为 0，其余为 INF",
                             {INF, INF, INF, INF, 0}, shortestPathsDijkstra(n, adj, 4),
                             "检查 shortestPathsDijkstra：无出边起点应仅 dist[src]==0");
    }

    // -------------------- 考题 5 测试：BST 删除（含双子节点） --------------------
    {
        // 构建 BST：[50, 30, 70, 20, 40, 60, 80, 65]
        TNode* root = nullptr;
        std::vector<int> vals = {50, 30, 70, 20, 40, 60, 80, 65};
        for (size_t i = 0; i < vals.size(); ++i) {
            root = bstInsertHelper(root, vals[i]);
        }

        // 1. 删除不存在的 key
        root = bstErase(root, 999);
        std::vector<int> ino;
        inorderHelper(root, ino);
        labtest::expectEqVec("T5-1. BST 删除不存在的值树不变",
                             {20, 30, 40, 50, 60, 65, 70, 80}, ino,
                             "检查 bstErase：未找到 key 时应原样返回子树根");

        // 2. 删除叶子节点 20
        root = bstErase(root, 20);
        ino.clear();
        inorderHelper(root, ino);
        labtest::expectEqVec("T5-2. BST 删除叶子节点 20",
                             {30, 40, 50, 60, 65, 70, 80}, ino,
                             "检查 bstErase：左右均空时 delete root 并返回 nullptr");

        // 3. 删除单孩子节点 30（仅右孩子 40）
        root = bstErase(root, 30);
        ino.clear();
        inorderHelper(root, ino);
        labtest::expectEqVec("T5-3. BST 删除单孩子节点 30",
                             {40, 50, 60, 65, 70, 80}, ino,
                             "检查 bstErase：单孩子时保存非空子指针，delete root 后返回该子指针");

        // 4. 删除双孩子根节点 50（中序后继 60 有右孩子 65！）
        root = bstErase(root, 50);
        ino.clear();
        inorderHelper(root, ino);
        labtest::expectEqVec("T5-4. BST 删除双孩子根节点 50（后继 60 带右孩子 65）",
                             {40, 60, 65, 70, 80}, ino,
                             "检查 bstErase：双孩子节点应找右子树最小节点（后继）覆盖值，再递归删除右子树中的该后继");

        // 5. 再删除双孩子节点 70
        root = bstErase(root, 70);
        ino.clear();
        inorderHelper(root, ino);
        labtest::expectEqVec("T5-5. BST 连续删除双孩子节点 70",
                             {40, 60, 65, 80}, ino,
                             "检查 bstErase：递归更新 root->right = bstErase(root->right, ...)");

        freeTreeHelper(root);
    }

    // -------------------- 考题 6 测试：快速排序 & 归并排序 --------------------
    {
        std::vector<std::vector<int>> cases = {
            {},
            {7},
            {1, 2, 3, 4, 5},
            {9, 7, 5, 3, 1, -2, -5},
            {4, 2, 4, 2, 4, 1, 2, 1, 0, -1, 4}
        };

        // 追加一个 200 元素的确定性伪随机大用例
        std::vector<int> bigCase;
        unsigned int seed = 20261121u;
        for (int i = 0; i < 200; ++i) {
            seed = seed * 1664525u + 1013904223u;
            bigCase.push_back(static_cast<int>(seed % 1000u) - 500);
        }
        cases.push_back(bigCase);

        bool quickAllOk = true;
        bool mergeAllOk = true;
        for (size_t i = 0; i < cases.size(); ++i) {
            std::vector<int> expected = cases[i];
            std::sort(expected.begin(), expected.end());

            std::vector<int> a1 = cases[i];
            fastSort(a1);
            if (a1 != expected) quickAllOk = false;

            std::vector<int> a2 = cases[i];
            stableMergeSort(a2);
            if (a2 != expected) mergeAllOk = false;
        }

        labtest::expectTrue("T6-1. fastSort 通过空/单/有序/逆序/重复/200 随机数组全部测试",
                            quickAllOk,
                            "检查 fastSort：核对递归出口 l >= r、partition 划分边界与指针移动避免死循环");
        labtest::expectTrue("T6-2. stableMergeSort 通过空/单/有序/逆序/重复/200 随机数组全部测试",
                            mergeAllOk,
                            "检查 stableMergeSort：核对 mid=l+(r-l)/2、双指针合并用 <= 保稳定及剩余元素拷贝");
    }

    int code = labtest::endLab();
    if (code == 0) {
        std::cout << "\n================================================\n";
        std::cout << "  🏆 恭喜通过《数据结构与算法》全书手写终极验收！\n";
        std::cout << "================================================\n";
    }
    return code;
}
