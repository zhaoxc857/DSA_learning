// ============================================================
// 06_二叉排序树.cpp
// 配套笔记：第 6 章 查找 → 6.3.1 二叉排序树
//
// 内容：BST 的插入、查找、删除（三种情况）、中序遍历、ASL
//       + 演示"退化成链表"的问题
//
// 编译运行：
//   g++ -std=c++11 06_二叉排序树.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>
using namespace std;

// ---------- BST 节点 ----------
struct BSTNode {
    int data;
    BSTNode* left;
    BSTNode* right;
    BSTNode(int d) : data(d), left(nullptr), right(nullptr) {}
};

class BST {
public:
    BSTNode* root;

    BST() : root(nullptr) {}
    ~BST() { destroy(root); }

    void destroy(BSTNode* p) {
        if (!p) return;
        destroy(p->left);
        destroy(p->right);
        delete p;
    }

    // ---------- 插入 ----------
    void insert(int key) { insert(root, key); }

    void insert(BSTNode*& p, int key) {
        if (p == nullptr) {
            p = new BSTNode(key);
            return;
        }
        if (key < p->data)      insert(p->left, key);
        else if (key > p->data) insert(p->right, key);
        // key == p->data 时不插入（不允许重复）
    }

    // ---------- 查找（带比较次数） ----------
    BSTNode* search(int key, int& compareCount) {
        compareCount = 0;
        BSTNode* p = root;
        while (p != nullptr) {
            compareCount++;
            if (key == p->data) return p;
            else if (key < p->data) p = p->left;
            else p = p->right;
        }
        return nullptr;
    }

    // ---------- 中序遍历（验证有序性） ----------
    void inOrder(BSTNode* p, vector<int>& out) {
        if (!p) return;
        inOrder(p->left, out);
        out.push_back(p->data);
        inOrder(p->right, out);
    }

    // ---------- 删除 ----------
    void remove(int key) { remove(root, key); }

    void remove(BSTNode*& p, int key) {
        if (p == nullptr) return;

        if (key < p->data) {
            remove(p->left, key);
        } else if (key > p->data) {
            remove(p->right, key);
        } else {
            // 找到了，分三种情况
            if (p->left == nullptr && p->right == nullptr) {
                // 情况1：叶子节点，直接删
                delete p;
                p = nullptr;
            } else if (p->left == nullptr) {
                // 情况2a：只有右孩子
                BSTNode* tmp = p;
                p = p->right;
                delete tmp;
            } else if (p->right == nullptr) {
                // 情况2b：只有左孩子
                BSTNode* tmp = p;
                p = p->left;
                delete tmp;
            } else {
                // 情况3：有两个孩子 → 用右子树的最小值（中序后继）替代
                BSTNode* succ = findMin(p->right);
                p->data = succ->data;             // 值替换
                remove(p->right, succ->data);     // 删掉那个后继
            }
        }
    }

    BSTNode* findMin(BSTNode* p) {
        while (p->left != nullptr) p = p->left;
        return p;
    }

    // ---------- 求高度 ----------
    int height(BSTNode* p) {
        if (!p) return 0;
        return 1 + max(height(p->left), height(p->right));
    }

    // ---------- 计算 ASL ----------
    // 用 BFS 统计每层节点数和层号
    double calcASL() {
        if (!root) return 0;

        vector<pair<BSTNode*, int>> q = {{root, 1}};
        long long weightedSum = 0;
        int total = 0;

        for (size_t i = 0; i < q.size(); i++) {
            BSTNode* p = q[i].first;
            int depth = q[i].second;

            weightedSum += depth;     // 该节点要比较 depth 次
            total++;

            if (p->left)  q.push_back({p->left, depth + 1});
            if (p->right) q.push_back({p->right, depth + 1});
        }
        return (double)weightedSum / total;
    }

    // ---------- 打印树（横向） ----------
    void printTree(BSTNode* p, int depth = 0) {
        if (!p) return;
        printTree(p->right, depth + 1);
        cout << string(depth * 4, ' ') << p->data << endl;
        printTree(p->left, depth + 1);
    }

    // ---------- 统计每层节点数 ----------
    void printLevels() {
        if (!root) return;
        vector<pair<BSTNode*, int>> q = {{root, 1}};
        vector<int> counts;

        for (size_t i = 0; i < q.size(); i++) {
            BSTNode* p = q[i].first;
            int d = q[i].second;
            if ((int)counts.size() < d) counts.resize(d, 0);
            counts[d - 1]++;

            if (p->left)  q.push_back({p->left, d + 1});
            if (p->right) q.push_back({p->right, d + 1});
        }

        for (size_t i = 0; i < counts.size(); i++) {
            cout << "    第 " << i + 1 << " 层: " << counts[i] << " 个节点" << endl;
        }
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  二叉排序树（BST）" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 构建 BST ----------
    cout << "【1. 构建 BST】" << endl;
    cout << "  插入顺序: 45, 24, 53, 12, 37, 93" << endl << endl;

    BST bst;
    for (int x : {45, 24, 53, 12, 37, 93}) {
        bst.insert(x);
    }

    cout << "  树结构（逆时针转 90 度看）:" << endl;
    bst.printTree(bst.root);
    cout << endl;

    // ---------- 2. 中序遍历验证有序 ----------
    cout << "【2. 中序遍历（应该有序）】" << endl;
    vector<int> inord;
    bst.inOrder(bst.root, inord);
    cout << "  中序: ";
    for (int x : inord) cout << x << " ";
    cout << endl;
    cout << "  是否升序: "
         << (is_sorted(inord.begin(), inord.end()) ? "是 ✓（BST 性质验证通过）"
                                                   : "否 ✗") << endl;
    cout << endl;

    // ---------- 3. 查找 ----------
    cout << "【3. 查找】" << endl;
    for (int key : {45, 37, 93, 100}) {
        int cnt = 0;
        BSTNode* p = bst.search(key, cnt);
        cout << "  查找 " << setw(3) << key << ": ";
        if (p) cout << "找到了，比较 " << cnt << " 次";
        else   cout << "没找到，比较 " << cnt << " 次";
        cout << endl;
    }
    cout << endl;

    // ---------- 4. ASL ----------
    cout << "【4. 平均查找长度 ASL】" << endl;
    cout << "  各层节点数:" << endl;
    bst.printLevels();
    cout << "  ASL成功 = " << bst.calcASL() << endl;
    cout << "  （手工验证：(1+2+2+3+3+3)/6 = "
         << (1+2+2+3+3+3) / 6.0 << "）" << endl;
    cout << endl;

    // ---------- 5. 删除 ----------
    cout << "【5. 删除节点】" << endl;
    cout << "----------------------------------------" << endl;

    // 情况1：删叶子
    cout << "  ① 删除叶子节点 12:" << endl;
    bst.remove(12);
    bst.printTree(bst.root);
    cout << endl;

    // 情况2：删只有一个孩子的
    cout << "  ② 删除只有一个孩子的节点 53（它有右孩子 93）:" << endl;
    bst.remove(53);
    bst.printTree(bst.root);
    cout << endl;

    // 情况3：删有两个孩子的
    cout << "  ③ 删除有两个孩子的根节点 45:" << endl;
    cout << "     （用右子树最小值 93 替代）" << endl;
    bst.remove(45);
    bst.printTree(bst.root);
    cout << endl;

    vector<int> after;
    bst.inOrder(bst.root, after);
    cout << "  删除后中序: ";
    for (int x : after) cout << x << " ";
    cout << endl;
    cout << "  仍然有序: "
         << (is_sorted(after.begin(), after.end()) ? "是 ✓" : "否 ✗") << endl;
    cout << endl;

    // ---------- 6. 退化演示 ----------
    cout << "【6. 退化问题：按顺序插入会退化成链表】" << endl;
    cout << "----------------------------------------" << endl;

    BST bad;
    cout << "  按 1,2,3,4,5 顺序插入:" << endl;
    for (int i = 1; i <= 5; i++) bad.insert(i);

    bad.printTree(bad.root);
    cout << endl;
    cout << "  树高 = " << bad.height(bad.root)
         << "（n = 5，树高也是 5！）" << endl;
    cout << "  ASL = " << bad.calcASL() << "（和顺序查找一样慢）" << endl;
    cout << endl;

    // 对比：平衡插入
    BST good;
    cout << "  按 3,1,5,2,4 顺序插入（较平衡）:" << endl;
    for (int x : {3, 1, 5, 2, 4}) good.insert(x);

    good.printTree(good.root);
    cout << endl;
    cout << "  树高 = " << good.height(good.root) << "（只有 3）" << endl;
    cout << "  ASL = " << good.calcASL() << "（明显更快）" << endl;
    cout << endl;

    cout << "  → 结论：BST 的性能完全取决于【树的形状】！" << endl;
    cout << "     插入顺序不好 → 退化成链表 → O(n)" << endl;
    cout << "     这就是需要【平衡二叉树】的原因" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. BST 的中序遍历是升序（最重要的性质）" << endl;
    cout << "  2. 查找：小了往左，大了往右" << endl;
    cout << "  3. 删除分三种情况（叶子/单孩子/双孩子）" << endl;
    cout << "  4. 双孩子删除用【中序后继】替代" << endl;
    cout << "  5. BST 会退化，需要 AVL 树解决" << endl;
    cout << "========================================" << endl;

    return 0;
}
