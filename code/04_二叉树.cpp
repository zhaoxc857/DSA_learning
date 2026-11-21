// ============================================================
// 04_二叉树.cpp
// 配套笔记：第 4 章 树 → 4.2 遍历 / 4.4 二叉树的实现
//
// 内容：二叉树的四种遍历、统计、高度、查找
//       + 从遍历序列还原树
//
// 编译运行：
//   g++ -std=c++11 04_二叉树.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <queue>
#include <string>
#include <algorithm>
#include <stack>
using namespace std;

// ---------- 二叉树节点 ----------
template <class T>
struct BTNode {
    T data;
    BTNode* left;
    BTNode* right;
    BTNode(T d) : data(d), left(nullptr), right(nullptr) {}
};

// ============================================================
// 二叉树类
// ============================================================
template <class T>
class BinaryTree {
public:
    BTNode<T>* root;

    BinaryTree() : root(nullptr) {}

    // ---------- 从"层序数组"构建完全二叉树 ----------
    // a = {1,2,3,4,5,6,7} 构建:
    //         1
    //        / ＼
    //       2   3
    //      / ＼ / ＼
    //     4  5 6  7
    void buildFromLevelArray(T a[], int n) {
        if (n == 0) { root = nullptr; return; }

        vector<BTNode<T>*> nodes(n);
        for (int i = 0; i < n; i++) nodes[i] = new BTNode<T>(a[i]);

        for (int i = 0; i < n; i++) {
            int l = 2 * i + 1, r = 2 * i + 2;   // 0-based 下标
            if (l < n) nodes[i]->left  = nodes[l];
            if (r < n) nodes[i]->right = nodes[r];
        }
        root = nodes[0];
    }

    // ================= 四种遍历 =================

    // ---------- 先序：根 → 左 → 右 ----------
    void PreOrder(BTNode<T>* p, string& out) {
        if (p == nullptr) return;
        out += to_string(p->data) + " ";
        PreOrder(p->left, out);
        PreOrder(p->right, out);
    }

    // ---------- 中序：左 → 根 → 右 ----------
    void InOrder(BTNode<T>* p, string& out) {
        if (p == nullptr) return;
        InOrder(p->left, out);
        out += to_string(p->data) + " ";
        InOrder(p->right, out);
    }

    // ---------- 后序：左 → 右 → 根 ----------
    void PostOrder(BTNode<T>* p, string& out) {
        if (p == nullptr) return;
        PostOrder(p->left, out);
        PostOrder(p->right, out);
        out += to_string(p->data) + " ";
    }

    // ---------- 层次遍历：用队列 ----------
    void LevelOrder(BTNode<T>* p, string& out) {
        if (p == nullptr) return;
        queue<BTNode<T>*> q;
        q.push(p);
        while (!q.empty()) {
            BTNode<T>* cur = q.front(); q.pop();
            out += to_string(cur->data) + " ";
            if (cur->left)  q.push(cur->left);
            if (cur->right) q.push(cur->right);
        }
    }

    // ---------- 中序遍历的非递归实现（用栈） ----------
    void InOrderIterative(BTNode<T>* p, string& out) {
        stack<BTNode<T>*> st;
        BTNode<T>* cur = p;
        while (cur != nullptr || !st.empty()) {
            while (cur != nullptr) {      // 一路向左，压栈
                st.push(cur);
                cur = cur->left;
            }
            cur = st.top(); st.pop();     // 弹出并访问
            out += to_string(cur->data) + " ";
            cur = cur->right;             // 转向右子树
        }
    }

    // ================= 统计类算法 =================

    // ---------- 节点总数 ----------
    int Count(BTNode<T>* p) {
        if (p == nullptr) return 0;
        return 1 + Count(p->left) + Count(p->right);
    }

    // ---------- 叶子节点数 ----------
    int LeafCount(BTNode<T>* p) {
        if (p == nullptr) return 0;
        if (p->left == nullptr && p->right == nullptr) return 1;
        return LeafCount(p->left) + LeafCount(p->right);
    }

    // ---------- 度为 1 的节点数 ----------
    int Degree1Count(BTNode<T>* p) {
        if (p == nullptr) return 0;
        int self = ((p->left == nullptr) != (p->right == nullptr)) ? 1 : 0;
        return self + Degree1Count(p->left) + Degree1Count(p->right);
    }

    // ---------- 度为 2 的节点数 ----------
    int Degree2Count(BTNode<T>* p) {
        if (p == nullptr) return 0;
        int self = (p->left != nullptr && p->right != nullptr) ? 1 : 0;
        return self + Degree2Count(p->left) + Degree2Count(p->right);
    }

    // ---------- 树的高度 ----------
    int Height(BTNode<T>* p) {
        if (p == nullptr) return 0;
        return 1 + max(Height(p->left), Height(p->right));
    }

    // ---------- 查找 ----------
    BTNode<T>* Find(BTNode<T>* p, T x) {
        if (p == nullptr) return nullptr;
        if (p->data == x) return p;
        BTNode<T>* r = Find(p->left, x);
        if (r) return r;
        return Find(p->right, x);
    }

    // ---------- 交换左右孩子 ----------
    void SwapChildren(BTNode<T>* p) {
        if (p == nullptr) return;
        swap(p->left, p->right);
        SwapChildren(p->left);
        SwapChildren(p->right);
    }

    // ---------- 判断两棵树是否相同 ----------
    bool isSame(BTNode<T>* a, BTNode<T>* b) {
        if (a == nullptr && b == nullptr) return true;
        if (a == nullptr || b == nullptr) return false;
        if (a->data != b->data) return false;
        return isSame(a->left, b->left) && isSame(a->right, b->right);
    }

    // ---------- 打印树的结构（横向） ----------
    void PrintTree(BTNode<T>* p, int depth = 0) {
        if (p == nullptr) return;
        PrintTree(p->right, depth + 1);
        cout << string(depth * 4, ' ') << p->data << endl;
        PrintTree(p->left, depth + 1);
    }

    // ---------- 释放 ----------
    void destroy(BTNode<T>* p) {
        if (p == nullptr) return;
        destroy(p->left);
        destroy(p->right);
        delete p;
    }
    ~BinaryTree() { destroy(root); }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  二叉树 演示" << endl;
    cout << "========================================" << endl << endl;

    BinaryTree<int> bt;
    int a[] = {1, 2, 3, 4, 5, 6, 7};
    bt.buildFromLevelArray(a, 7);

    // ---------- 0. 树形展示 ----------
    cout << "【0. 树的结构】" << endl;
    cout << "        1" << endl;
    cout << "       / \\" << endl;
    cout << "      2   3" << endl;
    cout << "     / \\ / \\" << endl;
    cout << "    4  5 6  7" << endl << endl;

    // ---------- 1. 四种遍历 ----------
    cout << "【1. 四种遍历】" << endl;
    string out;

    out.clear(); bt.PreOrder(bt.root, out);
    cout << "  先序（根左右）: " << out << endl;

    out.clear(); bt.InOrder(bt.root, out);
    cout << "  中序（左根右）: " << out << endl;

    out.clear(); bt.PostOrder(bt.root, out);
    cout << "  后序（左右根）: " << out << endl;

    out.clear(); bt.LevelOrder(bt.root, out);
    cout << "  层次遍历:       " << out << endl;

    out.clear(); bt.InOrderIterative(bt.root, out);
    cout << "  中序（非递归）: " << out << endl;
    cout << endl;

    // ---------- 2. 统计 ----------
    cout << "【2. 统计信息】" << endl;
    cout << "  节点总数 = " << bt.Count(bt.root) << endl;
    cout << "  叶子节点数 = " << bt.LeafCount(bt.root) << endl;
    cout << "  度为1的节点数 = " << bt.Degree1Count(bt.root) << endl;
    cout << "  度为2的节点数 = " << bt.Degree2Count(bt.root) << endl;
    cout << "  树的高度 = " << bt.Height(bt.root) << endl;
    cout << endl;

    // ---------- 3. 验证性质 n0 = n2 + 1 ----------
    int n0 = bt.LeafCount(bt.root);
    int n2 = bt.Degree2Count(bt.root);
    cout << "【3. 验证性质：n0 = n2 + 1】" << endl;
    cout << "  叶子数 n0 = " << n0 << endl;
    cout << "  度为2的节点数 n2 = " << n2 << endl;
    cout << "  n2 + 1 = " << n2 + 1 << "，与 n0 "
         << (n0 == n2 + 1 ? "相等 ✓" : "不等 ✗") << endl;
    cout << endl;

    // ---------- 4. 查找 ----------
    cout << "【4. 查找节点】" << endl;
    for (int x : {5, 7, 99}) {
        BTNode<int>* p = bt.Find(bt.root, x);
        cout << "  查找 " << x << ": "
             << (p ? "找到了" : "没找到") << endl;
    }
    cout << endl;

    // ---------- 5. 交换左右孩子 ----------
    cout << "【5. 交换所有节点的左右孩子】" << endl;
    out.clear(); bt.InOrder(bt.root, out);
    cout << "  交换前中序: " << out << endl;

    bt.SwapChildren(bt.root);

    out.clear(); bt.InOrder(bt.root, out);
    cout << "  交换后中序: " << out << endl;
    cout << "  → 中序序列正好反转（因为左右子树互换了）" << endl;

    bt.SwapChildren(bt.root);   // 换回来
    cout << endl;

    // ---------- 6. 非完全二叉树演示 ----------
    cout << "【6. 非完全二叉树】" << endl;
    // 手工构建:
    //        A
    //       / ＼
    //      B   C
    //     /     ＼
    //    D       E
    BinaryTree<int> t2;
    t2.root = new BTNode<int>(1);
    t2.root->left = new BTNode<int>(2);
    t2.root->right = new BTNode<int>(3);
    t2.root->left->left = new BTNode<int>(4);
    t2.root->right->right = new BTNode<int>(5);

    cout << "        1" << endl;
    cout << "       / \\" << endl;
    cout << "      2   3" << endl;
    cout << "     /     \\" << endl;
    cout << "    4       5" << endl;

    out.clear(); t2.PreOrder(t2.root, out);
    cout << "  先序: " << out << endl;
    out.clear(); t2.InOrder(t2.root, out);
    cout << "  中序: " << out << endl;
    out.clear(); t2.PostOrder(t2.root, out);
    cout << "  后序: " << out << endl;
    out.clear(); t2.LevelOrder(t2.root, out);
    cout << "  层次: " << out << endl;

    cout << "  节点数 = " << t2.Count(t2.root)
         << ", 叶子数 = " << t2.LeafCount(t2.root)
         << ", 高度 = " << t2.Height(t2.root) << endl;
    cout << endl;

    // ---------- 7. 从遍历序列还原树 ----------
    cout << "【7. 已知前序+中序，求后序】" << endl;
    cout << "  前序: 1 2 4 5 3 6 7" << endl;
    cout << "  中序: 4 2 5 1 6 3 7" << endl;
    cout << "  → 先序第一个是根：1" << endl;
    cout << "  → 中序中 1 的位置把序列分成左右：左=[4 2 5], 右=[6 3 7]" << endl;
    cout << "  → 递归处理左右子树" << endl;

    BinaryTree<int> t3;
    int b[] = {1, 2, 3, 4, 5, 6, 7};
    t3.buildFromLevelArray(b, 7);
    out.clear(); t3.PostOrder(t3.root, out);
    cout << "  → 后序 = " << out << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  遍历口诀：" << endl;
    cout << "  先序 = 根左右" << endl;
    cout << "  中序 = 左根右" << endl;
    cout << "  后序 = 左右根" << endl;
    cout << "  层次 = 用队列，一层层来" << endl;
    cout << "========================================" << endl;

    return 0;
}
