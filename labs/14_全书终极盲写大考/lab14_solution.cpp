// ============================================================================
// 第 14 关（终极验收）：《数据结构与算法》全书终极盲写大考【参考答案】
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
// ============================================================================
Node* reverseSinglyList(Node* head) {
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr) {
        Node* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

// ============================================================================
// 考题 2：循环队列（容量 K，底层数组 K + 1，牺牲一个空位判满）
// ============================================================================
struct MiniRingQueue {
    std::vector<int> buf;
    int capacity;
    int front;
    int rear;

    MiniRingQueue() : capacity(0), front(0), rear(0) {}

    void init(int k) {
        capacity = (k > 0) ? k : 0;
        buf.assign(static_cast<size_t>(capacity + 1), 0);
        front = 0;
        rear = 0;
    }

    bool empty() const {
        return front == rear;
    }

    bool full() const {
        if (buf.empty()) {
            return true;
        }
        int sz = static_cast<int>(buf.size());
        return (rear + 1) % sz == front;
    }

    bool push(int val) {
        if (full()) {
            return false;
        }
        int sz = static_cast<int>(buf.size());
        buf[rear] = val;
        rear = (rear + 1) % sz;
        return true;
    }

    bool pop(int& outVal) {
        if (empty()) {
            return false;
        }
        int sz = static_cast<int>(buf.size());
        outVal = buf[front];
        front = (front + 1) % sz;
        return true;
    }
};

// ============================================================================
// 考题 3：二叉树层序遍历 & 最大深度
// ============================================================================
std::vector<int> treeLevelOrder(TNode* root) {
    std::vector<int> res;
    if (root == nullptr) {
        return res;
    }
    std::queue<TNode*> q;
    q.push(root);
    while (!q.empty()) {
        TNode* cur = q.front();
        q.pop();
        res.push_back(cur->val);
        if (cur->left != nullptr) q.push(cur->left);
        if (cur->right != nullptr) q.push(cur->right);
    }
    return res;
}

int treeMaxDepth(TNode* root) {
    if (root == nullptr) {
        return 0;
    }
    int ld = treeMaxDepth(root->left);
    int rd = treeMaxDepth(root->right);
    return 1 + (ld > rd ? ld : rd);
}

// ============================================================================
// 考题 4：Dijkstra 单源最短路径（非负权图）
// ============================================================================
std::vector<int> shortestPathsDijkstra(
    int n,
    const std::vector<std::vector<std::pair<int, int>>>& adj,
    int src) {
    std::vector<int> dist(n, INF);
    if (n <= 0 || src < 0 || src >= n) {
        return dist;
    }
    typedef std::pair<int, int> PII; // {dist, vertex}
    std::priority_queue<PII, std::vector<PII>, std::greater<PII>> pq;
    dist[src] = 0;
    pq.push(PII(0, src));

    while (!pq.empty()) {
        int d = pq.top().first;
        int u = pq.top().second;
        pq.pop();
        if (d > dist[u]) {
            continue;
        }
        for (size_t i = 0; i < adj[u].size(); ++i) {
            int v = adj[u][i].first;
            int w = adj[u][i].second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push(PII(dist[v], v));
            }
        }
    }
    return dist;
}

// ============================================================================
// 考题 5：二叉搜索树（BST）删除节点（含双子节点情况）
// ============================================================================
TNode* bstErase(TNode* root, int key) {
    if (root == nullptr) {
        return nullptr;
    }
    if (key < root->val) {
        root->left = bstErase(root->left, key);
    } else if (key > root->val) {
        root->right = bstErase(root->right, key);
    } else {
        if (root->left == nullptr && root->right == nullptr) {
            delete root;
            return nullptr;
        } else if (root->left == nullptr) {
            TNode* child = root->right;
            delete root;
            return child;
        } else if (root->right == nullptr) {
            TNode* child = root->left;
            delete root;
            return child;
        } else {
            TNode* succ = root->right;
            while (succ->left != nullptr) {
                succ = succ->left;
            }
            root->val = succ->val;
            root->right = bstErase(root->right, succ->val);
        }
    }
    return root;
}

// ============================================================================
// 考题 6：快速排序 & 归并排序（均为原地升序排序）
// ============================================================================
static void quickSortImpl(std::vector<int>& a, int left, int right) {
    if (left >= right) {
        return;
    }
    int pivot = a[left + (right - left) / 2];
    int i = left;
    int j = right;
    while (i <= j) {
        while (a[i] < pivot) ++i;
        while (a[j] > pivot) --j;
        if (i <= j) {
            std::swap(a[i], a[j]);
            ++i;
            --j;
        }
    }
    if (left < j) quickSortImpl(a, left, j);
    if (i < right) quickSortImpl(a, i, right);
}

void fastSort(std::vector<int>& a) {
    if (a.size() <= 1) {
        return;
    }
    quickSortImpl(a, 0, static_cast<int>(a.size()) - 1);
}

static void mergeSortImpl(std::vector<int>& a, std::vector<int>& tmp, int left, int right) {
    if (left >= right) {
        return;
    }
    int mid = left + (right - left) / 2;
    mergeSortImpl(a, tmp, left, mid);
    mergeSortImpl(a, tmp, mid + 1, right);

    int i = left;
    int j = mid + 1;
    int k = left;
    while (i <= mid && j <= right) {
        if (a[i] <= a[j]) {
            tmp[k++] = a[i++];
        } else {
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= right) tmp[k++] = a[j++];
    for (int p = left; p <= right; ++p) {
        a[p] = tmp[p];
    }
}

void stableMergeSort(std::vector<int>& a) {
    if (a.size() <= 1) {
        return;
    }
    std::vector<int> tmp(a.size());
    mergeSortImpl(a, tmp, 0, static_cast<int>(a.size()) - 1);
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
