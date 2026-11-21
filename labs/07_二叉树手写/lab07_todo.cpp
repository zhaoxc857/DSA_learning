// ============================================================================
// 关卡 07：二叉树手写核心操作与递归规律（学生练习版）
// 对应教材：第 4 章 二叉树存储、四种遍历、树高/叶子数、镜像翻转与销毁
//
// 本关目标：
//   1. 理解并手写二叉树的三种递归遍历（前序 / 中序 / 后序）
//   2. 用 std::queue<BiNode*> 实现层序遍历 levelOrder
//   3. 掌握“把大问题拆成左子树 + 右子树”的递归套路：treeHeight / countLeaves / invertTree
//   4. 彻底理解为什么销毁二叉树 destroyTree 必须用后序遍历且传引用 BiNode*&
//
// 运行评测（在 labs 目录下）：
//   python judge.py 07
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <queue>
#include <vector>

// 二叉链表节点定义
struct BiNode {
    int data;
    BiNode* left;
    BiNode* right;
};

/*
 * [已提供] 辅助建树函数：按扩展前序序列（-1 表示空节点）递归建树
 * 例如：{1, 2, -1, -1, 3, -1, -1} 建出的树为：
 *        1
 *       / \
 *      2   3
 * 请顺便欣赏这段短短 10 行的前序建树代码：它与前序遍历的结构一模一样！
 */
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

// ----------------------------------------------------------------------------
// 任务 1：前序遍历（根 -> 左 -> 右）
// 【函数目标】
//   将二叉树 root 的前序遍历结果依次追加到 out 中。
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，直接 return；
//   2. 访问根节点：out.push_back(root->data)；
//   3. 递归遍历左子树：preorder(root->left, out)；
//   4. 递归遍历右子树：preorder(root->right, out)。
// 【边界提醒】
//   - 空树（root == nullptr）必须直接 return，否则解引用 root->data 会崩溃。
// ----------------------------------------------------------------------------
void preorder(BiNode* root, std::vector<int>& out) {
    // TODO: 实现前序遍历
    (void)root;
    (void)out;
}

// ----------------------------------------------------------------------------
// 任务 2：中序遍历（左 -> 根 -> 右）
// 【函数目标】
//   将二叉树 root 的中序遍历结果依次追加到 out 中。
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，直接 return；
//   2. 递归遍历左子树：inorder(root->left, out)；
//   3. 访问根节点：out.push_back(root->data)；
//   4. 递归遍历右子树：inorder(root->right, out)。
// 【边界提醒】
//   - 注意对比前/中/后序：三段代码只有 out.push_back(root->data) 的位置不同！
// ----------------------------------------------------------------------------
void inorder(BiNode* root, std::vector<int>& out) {
    // TODO: 实现中序遍历
    (void)root;
    (void)out;
}

// ----------------------------------------------------------------------------
// 任务 3：后序遍历（左 -> 右 -> 根）
// 【函数目标】
//   将二叉树 root 的后序遍历结果依次追加到 out 中。
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，直接 return；
//   2. 递归遍历左子树：postorder(root->left, out)；
//   3. 递归遍历右子树：postorder(root->right, out)；
//   4. 访问根节点：out.push_back(root->data)。
// 【边界提醒】
//   - 后序遍历保证了“先处理完左右孩子，最后再处理当前节点”，这是求树高和释放内存的基础。
// ----------------------------------------------------------------------------
void postorder(BiNode* root, std::vector<int>& out) {
    // TODO: 实现后序遍历
    (void)root;
    (void)out;
}

// ----------------------------------------------------------------------------
// 任务 4：层序遍历（广度优先遍历 BFS）
// 【函数目标】
//   从上到下、每层从左到右访问二叉树所有节点，返回节点值序列。
// 【画图与思路推导】
//   1. 定义结果 res；若 root == nullptr，直接返回空 res；
//   2. 定义队列 std::queue<BiNode*> q，先把根节点入队：q.push(root)；
//   3. while (!q.empty())：
//        a) 取出队头节点：BiNode* cur = q.front(); q.pop();
//        b) 记录数值：res.push_back(cur->data);
//        c) 若 cur->left != nullptr，入队 q.push(cur->left);
//        d) 若 cur->right != nullptr，入队 q.push(cur->right);
//   4. 返回 res。
// 【边界提醒】
//   - 空树时千万不要把 nullptr 塞进队列！否则 cur->data 会触发空指针崩溃。
//   - 子节点入队顺序必须是先左后右，否则同一层顺序会颠倒。
// ----------------------------------------------------------------------------
std::vector<int> levelOrder(BiNode* root) {
    // TODO: 使用 std::queue<BiNode*> 实现层序遍历
    (void)root;
    return {};
}

// ----------------------------------------------------------------------------
// 任务 5：计算二叉树高度
// 【函数目标】
//   返回二叉树的高度（最大深度）：空树高度为 0，单节点树高度为 1。
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，返回 0；
//   2. 递归求左子树高度 lh = treeHeight(root->left)；
//   3. 递归求右子树高度 rh = treeHeight(root->right)；
//   4. 整棵树高度 = 1 + std::max(lh, rh)。
// 【边界提醒】
//   - 别忘了加 1（根节点本身占 1 层）。
//   - 空树返回 0，单节点树得到 1 + max(0, 0) = 1，完全自洽。
// ----------------------------------------------------------------------------
int treeHeight(BiNode* root) {
    // TODO: 递归计算二叉树高度
    (void)root;
    return 0;
}

// ----------------------------------------------------------------------------
// 任务 6：统计叶子节点个数
// 【函数目标】
//   返回二叉树中叶子节点的总数（左孩子和右孩子都为空的节点才是叶子）。
//   空树返回 0，单节点树返回 1。
// 【画图与思路推导】
//   1. 递归出口 1：若 root == nullptr，返回 0；
//   2. 递归出口 2：若 root->left == nullptr && root->right == nullptr，
//      说明当前节点是叶子，返回 1；
//   3. 否则返回 countLeaves(root->left) + countLeaves(root->right)。
// 【边界提醒】
//   - 只有左孩子或只有右孩子的节点（度为 1）不是叶子！
//   - 必须用 && 同时判断左右孩子均为空，不能写成 ||。
// ----------------------------------------------------------------------------
int countLeaves(BiNode* root) {
    // TODO: 递归统计叶子节点个数
    (void)root;
    return 0;
}

// ----------------------------------------------------------------------------
// 任务 7：镜像翻转二叉树（左右子树互换）
// 【函数目标】
//   原地将二叉树 root 变为它的左右镜像（每个节点的左、右子树互换）。
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，直接 return；
//   2. 交换当前节点的左右孩子指针：std::swap(root->left, root->right)；
//   3. 递归翻转左子树：invertTree(root->left)；
//   4. 递归翻转右子树：invertTree(root->right)。
// 【边界提醒】
//   - 前序（先换再递归）和后序（先递归再换）都正确；
//   - 千万不要写“中序翻转”（先 invert(left)，swap，再 invert(left) 很容易写错成翻两次同一棵子树！）。
// ----------------------------------------------------------------------------
void invertTree(BiNode* root) {
    // TODO: 递归实现二叉树镜像翻转
    (void)root;
}

// ----------------------------------------------------------------------------
// 任务 8：销毁整棵二叉树并置空根指针
// 【函数目标】
//   释放二叉树所有动态分配的 BiNode 节点内存，并将传入的指针变量置为 nullptr。
// 【画图与思路推导】（为什么必须用后序遍历？）
//   假设你先写了 delete root，再写 destroyTree(root->left)：
//     delete root 之后，root 指向的内存已经被归还给操作系统，此时再去读取
//     root->left 和 root->right 就是严重的“悬空指针非法访问（Use-After-Free）”！
//   因此必须严格遵循【后序顺序（左 -> 右 -> 根）】：
//   1. 递归出口：若 root == nullptr，直接 return；
//   2. 先释放左子树：destroyTree(root->left)；
//   3. 再释放右子树：destroyTree(root->right)；
//   4. 最后安全释放当前节点并置空：delete root; root = nullptr;
// 【边界提醒】
//   - 注意参数是引用类型 BiNode*& root：如果少了 &，函数里的 root = nullptr
//     只改了形参副本，调用方的根指针依然是指向已释放内存的“野指针”！
// ----------------------------------------------------------------------------
void destroyTree(BiNode*& root) {
    // TODO: 后序遍历释放整棵树，并将 root 置为 nullptr
    (void)root;
}

// ============================================================================
// 自动测试套件（请勿修改 main 函数，保持与评测系统一致）
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
