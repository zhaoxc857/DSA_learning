// ============================================================================
// 关卡 07：二叉树手写核心操作与递归规律（参考答案）
// 对应教材：第 4 章 二叉树存储、四种遍历、树高/叶子数、镜像翻转与销毁
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <queue>
#include <vector>

struct BiNode {
    int data;
    BiNode* left;
    BiNode* right;
};

// [已提供] 根据带空标记(-1)的扩展前序序列递归建树
BiNode* buildFromPreorder(const std::vector<int>& seq, int& idx) {
    if (idx >= static_cast<int>(seq.size()) || seq[idx] == -1) {
        if (idx < static_cast<int>(seq.size())) {
            ++idx;
        }
        return nullptr;
    }
    BiNode* node = new BiNode{seq[idx], nullptr, nullptr};
    ++idx;
    node->left = buildFromPreorder(seq, idx);
    node->right = buildFromPreorder(seq, idx);
    return node;
}

// 任务 1：前序遍历（根 -> 左 -> 右）
void preorder(BiNode* root, std::vector<int>& out) {
    if (root == nullptr) {
        return;
    }
    out.push_back(root->data);
    preorder(root->left, out);
    preorder(root->right, out);
}

// 任务 2：中序遍历（左 -> 根 -> 右）
void inorder(BiNode* root, std::vector<int>& out) {
    if (root == nullptr) {
        return;
    }
    inorder(root->left, out);
    out.push_back(root->data);
    inorder(root->right, out);
}

// 任务 3：后序遍历（左 -> 右 -> 根）
void postorder(BiNode* root, std::vector<int>& out) {
    if (root == nullptr) {
        return;
    }
    postorder(root->left, out);
    postorder(root->right, out);
    out.push_back(root->data);
}

// 任务 4：层序遍历（广度优先）
std::vector<int> levelOrder(BiNode* root) {
    std::vector<int> res;
    if (root == nullptr) {
        return res;
    }
    std::queue<BiNode*> q;
    q.push(root);
    while (!q.empty()) {
        BiNode* cur = q.front();
        q.pop();
        res.push_back(cur->data);
        if (cur->left != nullptr) {
            q.push(cur->left);
        }
        if (cur->right != nullptr) {
            q.push(cur->right);
        }
    }
    return res;
}

// 任务 5：求二叉树高度
int treeHeight(BiNode* root) {
    if (root == nullptr) {
        return 0;
    }
    int lh = treeHeight(root->left);
    int rh = treeHeight(root->right);
    return 1 + std::max(lh, rh);
}

// 任务 6：统计叶子节点个数
int countLeaves(BiNode* root) {
    if (root == nullptr) {
        return 0;
    }
    if (root->left == nullptr && root->right == nullptr) {
        return 1;
    }
    return countLeaves(root->left) + countLeaves(root->right);
}

// 任务 7：镜像翻转二叉树
void invertTree(BiNode* root) {
    if (root == nullptr) {
        return;
    }
    std::swap(root->left, root->right);
    invertTree(root->left);
    invertTree(root->right);
}

// 任务 8：后序销毁二叉树并置空指针
void destroyTree(BiNode*& root) {
    if (root == nullptr) {
        return;
    }
    destroyTree(root->left);
    destroyTree(root->right);
    delete root;
    root = nullptr;
}

// ============================================================================
// 自动测试套件（与 lab07_todo.cpp 保持完全一致）
// ============================================================================
int main() {
    labtest::beginLab("关卡 07：二叉树遍历、高度、叶子数、镜像与销毁");

    // ---------- 1. 空树边界测试 ----------
    {
        BiNode* empty = nullptr;
        std::vector<int> pre, in, post;
        preorder(empty, pre);
        inorder(empty, in);
        postorder(empty, post);

        labtest::expectEqVec("空树前序遍历", {}, pre, "root == nullptr 时应直接 return");
        labtest::expectEqVec("空树中序遍历", {}, in, "root == nullptr 时应直接 return");
        labtest::expectEqVec("空树后序遍历", {}, post, "root == nullptr 时应直接 return");
        labtest::expectEqVec("空树层序遍历", {}, levelOrder(empty), "空树千万不要把 nullptr 入队，应直接返回 {}");
        labtest::expectEqInt("空树高度为 0", 0, treeHeight(empty), "空树高度规定为 0");
        labtest::expectEqInt("空树叶子数为 0", 0, countLeaves(empty), "空树没有叶子节点，应返回 0");
        invertTree(empty);
        destroyTree(empty);
        labtest::expectTrue("空树翻转与销毁安全且仍为 nullptr", empty == nullptr,
            "空树调用 invertTree / destroyTree 应安全返回且保持 nullptr");
    }

    // ---------- 2. 单节点树测试 ----------
    {
        int idx = 0;
        BiNode* single = buildFromPreorder({42, -1, -1}, idx);
        std::vector<int> pre, in, post;
        preorder(single, pre);
        inorder(single, in);
        postorder(single, post);

        labtest::expectEqVec("单节点前序", {42}, pre, "检查是否正确 push_back(root->data)");
        labtest::expectEqVec("单节点中序", {42}, in, "检查是否正确 push_back(root->data)");
        labtest::expectEqVec("单节点后序", {42}, post, "检查是否正确 push_back(root->data)");
        labtest::expectEqVec("单节点层序", {42}, levelOrder(single), "根节点入队后出队输出 42");
        labtest::expectEqInt("单节点高度为 1", 1, treeHeight(single), "1 + max(0, 0) 应为 1");
        labtest::expectEqInt("单节点叶子数为 1", 1, countLeaves(single), "左右孩子均为空的根节点本身也是叶子");

        invertTree(single);
        labtest::expectEqVec("单节点翻转后层序不变", {42}, levelOrder(single), "单节点翻转后仍为 {42}");

        destroyTree(single);
        labtest::expectTrue("单节点销毁后 root == nullptr", single == nullptr,
            "检查 destroyTree 是否以 BiNode*& 传参并在 delete root 后置 root = nullptr");
    }

    // ---------- 3. 斜树（退化成链表）测试 ----------
    // 左斜树：1 -> 左2 -> 左3
    {
        int idx = 0;
        BiNode* skew = buildFromPreorder({1, 2, 3, -1, -1, -1, -1}, idx);
        std::vector<int> pre, in, post;
        preorder(skew, pre);
        inorder(skew, in);
        postorder(skew, post);

        labtest::expectEqVec("左斜树前序", {1, 2, 3}, pre, "前序顺序：根->左->右");
        labtest::expectEqVec("左斜树中序", {3, 2, 1}, in, "左斜树中序应自底向上为 {3, 2, 1}");
        labtest::expectEqVec("左斜树后序", {3, 2, 1}, post, "左斜树后序应为 {3, 2, 1}");
        labtest::expectEqVec("左斜树层序", {1, 2, 3}, levelOrder(skew), "每层一个节点，层序为 {1, 2, 3}");
        labtest::expectEqInt("左斜树高度为 3", 3, treeHeight(skew), "3 个节点连成斜链高度应为 3");
        labtest::expectEqInt("左斜树叶子数为 1", 1, countLeaves(skew), "只有最底端的节点 3 左右均为空，是唯一叶子");

        invertTree(skew); // 翻转后变为右斜树：1 -> 右2 -> 右3
        std::vector<int> inAfter;
        inorder(skew, inAfter);
        labtest::expectEqVec("左斜树翻转成右斜树后中序变为 {1, 2, 3}", {1, 2, 3}, inAfter,
            "镜像翻转后中序序列应与翻转前完全逆序");

        destroyTree(skew);
        labtest::expectTrue("斜树销毁后 root == nullptr", skew == nullptr,
            "销毁后外部指针必须被置为 nullptr");
    }

    // ---------- 4. 常规不对称树测试 ----------
    /*
            1
          /   \
         2     3
        / \     \
       4   5     6
          /
         7
    */
    {
        std::vector<int> seq = {1, 2, 4, -1, -1, 5, 7, -1, -1, -1, 3, -1, 6, -1, -1};
        int idx = 0;
        BiNode* root = buildFromPreorder(seq, idx);

        std::vector<int> pre, in, post;
        preorder(root, pre);
        inorder(root, in);
        postorder(root, post);

        labtest::expectEqVec("不对称树前序遍历", {1, 2, 4, 5, 7, 3, 6}, pre,
            "前序应按 根->左->右 顺序访问");
        labtest::expectEqVec("不对称树中序遍历", {4, 2, 7, 5, 1, 3, 6}, in,
            "中序应按 左->根->右 顺序访问");
        labtest::expectEqVec("不对称树后序遍历", {4, 7, 5, 2, 6, 3, 1}, post,
            "后序应按 左->右->根 顺序访问");
        labtest::expectEqVec("不对称树层序遍历", {1, 2, 3, 4, 5, 6, 7}, levelOrder(root),
            "层序应逐层从左到右：第1层[1], 第2层[2,3], 第3层[4,5,6], 第4层[7]");
        labtest::expectEqInt("不对称树高度为 4", 4, treeHeight(root),
            "最长路径 1->2->5->7 含 4 个节点，高度为 4");
        labtest::expectEqInt("不对称树叶子数为 3", 3, countLeaves(root),
            "叶子节点为 4、7、6 共 3 个（节点 3 和 5 都有孩子，不是叶子）");

        /* 镜像翻转后：
                1
              /   \
             3     2
            /     / \
           6     5   4
                  \
                   7
        */
        invertTree(root);
        std::vector<int> preInv, inInv, postInv;
        preorder(root, preInv);
        inorder(root, inInv);
        postorder(root, postInv);

        labtest::expectEqVec("翻转后前序遍历", {1, 3, 6, 2, 5, 7, 4}, preInv,
            "检查 invertTree 是否既交换当前节点左右指针，又递归翻转了左右两棵子树");
        labtest::expectEqVec("翻转后中序遍历（应为原中序逆序）", {6, 3, 1, 5, 7, 2, 4}, inInv,
            "二叉树镜像翻转后，中序序列必为原中序的严格逆序");
        labtest::expectEqVec("翻转后后序遍历", {6, 3, 7, 5, 4, 2, 1}, postInv,
            "检查镜像翻转后的后序序列");
        labtest::expectEqVec("翻转后层序遍历", {1, 3, 2, 6, 5, 4, 7}, levelOrder(root),
            "每一层节点顺序都应左右镜像反转");
        labtest::expectEqInt("翻转后树高保持为 4", 4, treeHeight(root),
            "镜像翻转不应改变树的高度");
        labtest::expectEqInt("翻转后叶子数保持为 3", 3, countLeaves(root),
            "镜像翻转不应改变叶子节点数");

        destroyTree(root);
        labtest::expectTrue("不对称树销毁后 root == nullptr", root == nullptr,
            "必须后序释放所有节点并将 root 置为 nullptr");
    }

    return labtest::endLab();
}
