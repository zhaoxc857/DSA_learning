// ============================================================
// 04_树转二叉树.cpp
// 配套笔记：第 4 章 树 → 4.2.4 树、森林与二叉树的转换
//                        4.3.1 树的存储结构（孩子兄弟表示法）
//
// 内容：用"左孩子右兄弟"表示法把普通树存成二叉树
//       + 验证遍历序列的对应关系
//
// 编译运行：
//   g++ -std=c++11 04_树转二叉树.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <string>
#include <vector>
#include <queue>
using namespace std;

// ============================================================
// 孩子兄弟表示法的节点
// 就是"二叉树节点的另一种解读"
// ============================================================
struct CSNode {
    char    data;
    CSNode* firstChild;     // 左指针：第一个孩子
    CSNode* nextSibling;    // 右指针：下一个兄弟

    CSNode(char c) : data(c), firstChild(nullptr), nextSibling(nullptr) {}
};

// ============================================================
// 普通树（用双亲+孩子列表表示，便于输入）
// ============================================================
struct TreeNode {
    char data;
    vector<TreeNode*> children;   // 可以有任意多个孩子
    TreeNode(char c) : data(c) {}
};

// ============================================================
// 核心转换：普通树 → 孩子兄弟二叉树
// 规则：左指针 = 第一个孩子；右指针 = 下一个兄弟
// ============================================================
CSNode* toChildSibling(TreeNode* t) {
    if (t == nullptr) return nullptr;

    CSNode* node = new CSNode(t->data);

    if (!t->children.empty()) {
        // 左指针指向第一个孩子
        node->firstChild = toChildSibling(t->children[0]);

        // 第一个孩子的右指针链，串起所有兄弟
        CSNode* prev = node->firstChild;
        for (size_t i = 1; i < t->children.size(); i++) {
            CSNode* sibling = toChildSibling(t->children[i]);
            prev->nextSibling = sibling;
            prev = sibling;
        }
    }

    return node;
}

// ============================================================
// 遍历：普通树的先根遍历（先根，再依次遍历每棵子树）
// ============================================================
void treePreOrder(TreeNode* t, string& out) {
    if (!t) return;
    out += t->data;
    out += " ";
    for (TreeNode* c : t->children) {
        treePreOrder(c, out);
    }
}

// 普通树的后根遍历
void treePostOrder(TreeNode* t, string& out) {
    if (!t) return;
    for (TreeNode* c : t->children) {
        treePostOrder(c, out);
    }
    out += t->data;
    out += " ";
}

// ============================================================
// 遍历：二叉树（孩子兄弟表示）的先序 / 中序
// ============================================================
void btPreOrder(CSNode* p, string& out) {
    if (!p) return;
    out += p->data;
    out += " ";
    btPreOrder(p->firstChild, out);
    btPreOrder(p->nextSibling, out);
}

void btInOrder(CSNode* p, string& out) {
    if (!p) return;
    btInOrder(p->firstChild, out);
    out += p->data;
    out += " ";
    btInOrder(p->nextSibling, out);
}

// ============================================================
// 打印：以缩进形式展示树的结构
// ============================================================
void printTree(TreeNode* t, int depth = 0) {
    if (!t) return;
    cout << string(depth * 2, ' ') << t->data << endl;
    for (TreeNode* c : t->children) {
        printTree(c, depth + 1);
    }
}

// ============================================================
// 打印：以缩进形式展示二叉树（右子树表示兄弟）
// ============================================================
void printCS(CSNode* p, int depth = 0) {
    if (!p) return;
    cout << string(depth * 2, ' ') << p->data << endl;
    if (p->firstChild) {
        cout << string(depth * 2 + 2, ' ') << "├─ 第一个孩子:" << endl;
        printCS(p->firstChild, depth + 2);
    }
    if (p->nextSibling) {
        cout << string(depth * 2 + 2, ' ') << "└─ 下一个兄弟:" << endl;
        printCS(p->nextSibling, depth + 2);
    }
}

// ---------- 释放 ----------
void destroyTree(TreeNode* t) {
    if (!t) return;
    for (TreeNode* c : t->children) destroyTree(c);
    delete t;
}
void destroyCS(CSNode* p) {
    if (!p) return;
    destroyCS(p->firstChild);
    destroyCS(p->nextSibling);
    delete p;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  树 转 二叉树（左孩子右兄弟）" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 构建一棵普通树 ----------
    //           A
    //        /  |  ＼
    //       B   C   D
    //      / ＼      |
    //     E   F     G
    TreeNode* A = new TreeNode('A');
    TreeNode* B = new TreeNode('B');
    TreeNode* C = new TreeNode('C');
    TreeNode* D = new TreeNode('D');
    TreeNode* E = new TreeNode('E');
    TreeNode* F = new TreeNode('F');
    TreeNode* G = new TreeNode('G');

    A->children = {B, C, D};
    B->children = {E, F};
    D->children = {G};

    cout << "【1. 原树结构】" << endl;
    cout << "           A" << endl;
    cout << "        /  |  \\" << endl;
    cout << "       B   C   D" << endl;
    cout << "      / \\      |" << endl;
    cout << "     E   F     G" << endl << endl;

    // ---------- 2. 转换为孩子兄弟表示 ----------
    cout << "【2. 转换规则】" << endl;
    cout << "  左指针 → 第一个孩子" << endl;
    cout << "  右指针 → 下一个兄弟" << endl << endl;

    CSNode* cs = toChildSibling(A);

    cout << "  转换后的对应关系:" << endl;
    cout << "    A 的第一个孩子 = " << (cs->firstChild ? cs->firstChild->data : '-') << endl;
    cout << "    B 的第一个孩子 = "
         << (cs->firstChild && cs->firstChild->firstChild
             ? cs->firstChild->firstChild->data : '-') << endl;
    cout << "    B 的下一个兄弟 = " << (cs->firstChild && cs->firstChild->nextSibling
                                        ? cs->firstChild->nextSibling->data : '-') << endl;
    cout << endl;

    cout << "  转换后的二叉树结构:" << endl;
    printCS(cs);
    cout << endl;

    // ---------- 3. 遍历序列的对应关系 ----------
    cout << "【3. 遍历序列的对应关系】" << endl;

    string treePre, treePost, csPre, csIn;

    treePreOrder(A, treePre);       // 树的先根遍历
    treePostOrder(A, treePost);     // 树的后根遍历
    btPreOrder(cs, csPre);          // 二叉树的先序
    btInOrder(cs, csIn);            // 二叉树的中序

    cout << "  原树的先根遍历:       " << treePre << endl;
    cout << "  二叉树的先序遍历:     " << csPre << endl;
    cout << "  → " << (treePre == csPre ? "一致 ✓" : "不一致 ✗") << endl << endl;

    cout << "  原树的后根遍历:       " << treePost << endl;
    cout << "  二叉树的中序遍历:     " << csIn << endl;
    cout << "  → " << (treePost == csIn ? "一致 ✓" : "不一致 ✗") << endl << endl;

    cout << "  重要结论：" << endl;
    cout << "    树的先根遍历 = 对应二叉树的先序遍历" << endl;
    cout << "    树的后根遍历 = 对应二叉树的中序遍历" << endl;
    cout << endl;

    // ---------- 4. 手工验证转换结果 ----------
    cout << "【4. 手工推导转换结果】" << endl;
    cout << "  A: 第一个孩子 B → 左孩子 = B" << endl;
    cout << "  B: 第一个孩子 E → 左孩子 = E" << endl;
    cout << "     B 的下一个兄弟 C → 右孩子 = C" << endl;
    cout << "  C: 没有孩子 → 左孩子 = 空" << endl;
    cout << "     C 的下一个兄弟 D → 右孩子 = D" << endl;
    cout << "  D: 第一个孩子 G → 左孩子 = G" << endl;
    cout << "  E: 没有孩子 → 左孩子 = 空" << endl;
    cout << "     E 的下一个兄弟 F → 右孩子 = F" << endl;
    cout << "  F、G: 都没有孩子和兄弟" << endl;
    cout << endl;

    cout << "  所以二叉树是:" << endl;
    cout << "        A" << endl;
    cout << "       /" << endl;
    cout << "      B" << endl;
    cout << "     / \\" << endl;
    cout << "    E   C" << endl;
    cout << "     \\   \\" << endl;
    cout << "      F   D" << endl;
    cout << "           \\" << endl;
    cout << "            G" << endl << endl;

    // 验证：从这个结构做先序 = A B E F C D G
    cout << "  验证先序: A B E F C D G" << endl;
    cout << "  实际先序: " << csPre << endl;
    cout << "  → " << (csPre == "A B E F C D G " ? "一致 ✓" : "不一致 ✗") << endl;
    cout << endl;

    // ---------- 5. 为什么这样做 ----------
    cout << "【5. 为什么要转成二叉树？】" << endl;
    cout << "  1. 结构统一：所有节点都是两个指针" << endl;
    cout << "  2. 复用算法：二叉树的所有算法直接可用" << endl;
    cout << "  3. 存储高效：不需要预知孩子个数" << endl;
    cout << "  4. 遍历对应：树的遍历 = 二叉树的遍历" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  记忆口诀：左孩子，右兄弟" << endl;
    cout << "  （左指针管 [往下]，右指针管 [旁边]）" << endl;
    cout << "========================================" << endl;

    destroyTree(A);
    destroyCS(cs);

    return 0;
}
