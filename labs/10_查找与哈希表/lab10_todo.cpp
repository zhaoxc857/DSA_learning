// ============================================================================
// 第 10 关：查找与哈希表（折半查找 + 二叉排序树 BST + 拉链法散列表）
// 对应笔记：《06-查找.md》6.2 ~ 6.4
//
// 本关核心训练：
//   Part A：折半查找（binarySearch）与下界查找（lowerBound，处理重复元素与插入位置）
//   Part B：二叉排序树 BST 的插入、查找、删除（叶子/单孩子/双孩子）、中序与销毁
//   Part C：链地址法（拉链法）哈希表的初始化、插入/更新、查找、删除与销毁（支持负数 key）
//
// 编译评测命令（在 labs 目录下）：
//   python judge.py 10
// ============================================================================

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：折半查找（0-based 有序数组）
// ============================================================================

// ----------------------------------------------------------------------------
// 任务 A1：经典迭代版折半查找
// 【函数目标】
//   在升序数组 a（下标 0 .. a.size()-1）中查找 target。
//   返回值：找到则返回其下标（0-based）；找不到返回 -1。
//
// 【画图与思路推导】
//   1. 定义左闭右闭查找区间 [low, high]：
//      int low = 0;
//      int high = static_cast<int>(a.size()) - 1;
//   2. 当 low <= high 时循环：
//      - int mid = low + (high - low) / 2;   // 防 (low + high) 溢出！
//      - 若 a[mid] == target，返回 mid；
//      - 若 a[mid] < target，说明目标在右半段，令 low = mid + 1；
//      - 否则目标在左半段，令 high = mid - 1。
//   3. 循环结束仍未找到，返回 -1。
//
// 【边界提醒】
//   - 一定要用 int（有符号）存 high！如果用 size_t，当数组为空或 target 比 a[0] 小时，
//     high - 1 会下溢变成超大无符号整数导致死循环或越界崩溃！
//   - 循环条件必须是 low <= high（带等号），否则单元素数组或首尾元素会漏查！
// ----------------------------------------------------------------------------
int binarySearch(const std::vector<int>& a, int target) {
    // TODO: 实现迭代版折半查找
    (void)a;
    (void)target;
    return -1;
}

// ----------------------------------------------------------------------------
// 任务 A2：下界查找 lowerBound（第一个 >= target 的下标）
// 【函数目标】
//   在升序数组 a 中，找到【第一个满足 a[i] >= target】的下标 i。
//   若数组为空，或所有元素都严格小于 target，返回 static_cast<int>(a.size())。
//   （这个位置正好就是把 target 插入有序数组并保持有序的位置！）
//
// 【画图与思路推导】
//   1. 定义左闭右开查找区间 [low, high)：
//      int low = 0;
//      int high = static_cast<int>(a.size());
//   2. 当 low < high 时循环：
//      - int mid = low + (high - low) / 2;
//      - 如果 a[mid] < target：mid 及左边都不可能是答案，令 low = mid + 1；
//      - 否则（a[mid] >= target）：mid 可能是答案，但左边也许还有更靠前的 >= target，
//        保留 mid，令 high = mid。
//   3. 循环结束时 low == high，返回 low。
//
// 【边界提醒】
//   - 存在重复元素（如 [1, 3, 3, 3, 5] 查 3）时，必须返回最左边的下标 1，不能停在下标 2！
//   - target 比所有元素小时返回 0；比所有元素大或空数组时返回 a.size()。
// ----------------------------------------------------------------------------
int lowerBound(const std::vector<int>& a, int target) {
    // TODO: 实现 lowerBound
    (void)a;
    (void)target;
    return -1;
}

// ============================================================================
// Part B：二叉排序树（BST）
// ============================================================================

struct BSTNode {
    int key;
    BSTNode* left;
    BSTNode* right;
};

// ----------------------------------------------------------------------------
// 任务 B1：BST 插入
// 【函数目标】
//   向以 root 为根的二叉排序树中插入关键字 key，并返回插入后的新树根。
//   约定：如果 key 已经存在于树中，则【不重复插入】，原样返回 root。
//
// 【画图与思路推导】
//   1. 递归出口：若 root == nullptr，new 一个 BSTNode（left/right 置 nullptr）并返回。
//   2. 若 key < root->key：root->left = bstInsert(root->left, key);
//   3. 若 key > root->key：root->right = bstInsert(root->right, key);
//   4. 若 key == root->key：什么也不做。
//   5. 返回 root。
//
// 【边界提醒】
//   - 新建节点务必初始化 left = nullptr, right = nullptr，否则指针指向垃圾地址会崩溃！
//   - 记得把递归返回的指针重新接回 root->left 或 root->right！
// ----------------------------------------------------------------------------
BSTNode* bstInsert(BSTNode* root, int key) {
    // TODO: 实现 BST 插入（重复 key 不插入）
    (void)root;
    (void)key;
    return nullptr;
}

// ----------------------------------------------------------------------------
// 任务 B2：BST 查找
// 【函数目标】
//   判断关键字 key 是否存在于以 root 为根的 BST 中，存在返回 true，否则返回 false。
//
// 【画图与思路推导】
//   1. 可用迭代或递归：从 cur = root 开始，只要 cur != nullptr：
//      - cur->key == key -> 返回 true；
//      - key < cur->key  -> cur = cur->left；
//      - key > cur->key  -> cur = cur->right。
//   2. 走到空指针还没找到，返回 false。
//
// 【边界提醒】
//   - 空树（root == nullptr）应直接返回 false，不要解引用空指针。
// ----------------------------------------------------------------------------
bool bstSearch(BSTNode* root, int key) {
    // TODO: 实现 BST 查找
    (void)root;
    (void)key;
    return false;
}

// ----------------------------------------------------------------------------
// 任务 B3：BST 删除（重点！）
// 【函数目标】
//   从以 root 为根的 BST 中删除关键字为 key 的节点，并返回删除后的新树根。
//   如果 key 不存在，保持树结构不变，直接返回 root。
//
// 【画图与思路推导】
//   1. 若 root == nullptr，说明没找到，返回 nullptr。
//   2. 向下定位目标节点：
//      - 若 key < root->key：root->left = bstDelete(root->left, key); 返回 root。
//      - 若 key > root->key：root->right = bstDelete(root->right, key); 返回 root。
//   3. 此时 key == root->key，分 3 种情况删除当前节点 root：
//      - 情况 1（叶子节点：left == nullptr && right == nullptr）：
//          delete root; 返回 nullptr。
//      - 情况 2（只有单孩子：left == nullptr 或 right == nullptr）：
//          记下唯一的非空孩子 child，delete root; 返回 child。
//          （提示：情况 1 其实是情况 2 的特例，可以合并写成 if (root->left == nullptr) ...）
//      - 情况 3（左右孩子都在！）：
//          a) 找右子树的最小节点 succ（中序后继）：
//             BSTNode* succ = root->right;
//             while (succ->left != nullptr) succ = succ->left;
//          b) 用后继的值覆盖当前节点：root->key = succ->key;
//          c) 到右子树递归删除那个被借用值的节点：
//             root->right = bstDelete(root->right, succ->key);
//          d) 返回 root。
//
// 【边界提醒】
//   - 删叶子或单孩子时，千万别忘了先保存 child 再 delete root，防止内存泄漏！
//   - 删双孩子时，千万别直接 delete succ！因为 succ 可能还有右孩子！
//     用 root->right = bstDelete(root->right, succ->key) 交给情况 1/2 自动处理最安全！
// ----------------------------------------------------------------------------
BSTNode* bstDelete(BSTNode* root, int key) {
    // TODO: 实现 BST 删除（覆盖叶子、单孩子、双孩子 3 种情况）
    (void)root;
    (void)key;
    return nullptr;
}

// ----------------------------------------------------------------------------
// 任务 B4：BST 中序遍历
// 【函数目标】
//   按“左 -> 根 -> 右”的顺序收集 BST 中所有节点的 key 到 out 中。
//   （BST 的核心性质：中序遍历结果必然严格递增！）
//
// 【画图与思路推导】
//   1. 若 root == nullptr，直接 return。
//   2. 递归 bstInorder(root->left, out)。
//   3. out.push_back(root->key)。
//   4. 递归 bstInorder(root->right, out)。
//
// 【边界提醒】
//   - 不要在函数内部清空 out（调用方会传入空 vector），否则递归中会把左子树结果清掉！
// ----------------------------------------------------------------------------
void bstInorder(BSTNode* root, std::vector<int>& out) {
    // TODO: 实现 BST 中序遍历
    (void)root;
    (void)out;
}

// ----------------------------------------------------------------------------
// 任务 B5：BST 销毁
// 【函数目标】
//   释放以 root 为根的整棵 BST 的全部堆内存，并将外部指针 root 置为 nullptr。
//
// 【画图与思路推导】
//   1. 若 root == nullptr，直接 return。
//   2. 后序释放：先 bstDestroy(root->left)，再 bstDestroy(root->right)。
//   3. delete root; root = nullptr;
//
// 【边界提醒】
//   - 必须先递归销毁左右子树，最后再 delete root，否则释放后访问 root->left 是悬空指针！
//   - 参数是指针的引用 BSTNode*& root，记得置空 root = nullptr。
// ----------------------------------------------------------------------------
void bstDestroy(BSTNode*& root) {
    // TODO: 后序释放 BST 并置空 root
    (void)root;
}

// ============================================================================
// Part C：链地址法（拉链法）哈希表
// ============================================================================

struct HashNode {
    int key;
    int value;
    HashNode* next;
};

struct HashTable {
    std::vector<HashNode*> buckets;  // 桶数组，每个桶是一条不带头结点的单链表
    int cap;                         // 桶数量（模数）
};

// ----------------------------------------------------------------------------
// 任务 C1：哈希表初始化
// 【函数目标】
//   初始化哈希表 ht，设置桶数量为 cap（若 cap <= 0 则按 1 处理），
//   并将 buckets 调整为长度为 ht.cap、全部初始化为 nullptr。
//
// 【画图与思路推导】
//   1. ht.cap = (cap > 0) ? cap : 1;
//   2. ht.buckets.assign(ht.cap, nullptr);
//
// 【边界提醒】
//   - 所有桶指针初始必须是 nullptr，不能留野指针。
// ----------------------------------------------------------------------------
void htInit(HashTable& ht, int cap) {
    // TODO: 初始化哈希表
    (void)ht;
    (void)cap;
}

// ----------------------------------------------------------------------------
// 任务 C2：哈希表插入 / 更新
// 【函数目标】
//   向哈希表 ht 写入键值对 (key, value)：
//   - 若 key 已存在，则更新其 value（不能插入重复 key 节点！）；
//   - 若 key 不存在，则创建新 HashNode，用【头插法】插入对应桶的链表头部。
//
// 【画图与思路推导】
//   1. 计算桶下标（支持负数 key 的安全取模！）：
//      int idx = ((key % ht.cap) + ht.cap) % ht.cap;
//   2. 遍历桶链表 HashNode* cur = ht.buckets[idx]：
//      若 cur->key == key，更新 cur->value = value 并立刻 return。
//   3. 没找到则头插新节点：
//      HashNode* node = new HashNode{key, value, ht.buckets[idx]};
//      ht.buckets[idx] = node;
//
// 【边界提醒】
//   - 在 C++ 中，-1 % 5 的结果是 -1（不是 4！），直接用作下标会越界崩溃！
//     必须写 ((key % ht.cap) + ht.cap) % ht.cap 保证结果落在 [0, ht.cap - 1]！
//   - 若 ht.cap <= 0 或 ht.buckets 为空，直接 return 防止除零。
// ----------------------------------------------------------------------------
void htPut(HashTable& ht, int key, int value) {
    // TODO: 实现拉链法插入/更新（注意负数 key 安全取模）
    (void)ht;
    (void)key;
    (void)value;
}

// ----------------------------------------------------------------------------
// 任务 C3：哈希表查找
// 【函数目标】
//   在哈希表 ht 中查找 key：
//   - 找到则将对应值写入 outVal，返回 true；
//   - 找不到返回 false（不修改 outVal）。
//
// 【画图与思路推导】
//   1. 若 ht.cap <= 0 || ht.buckets.empty()，返回 false。
//   2. 计算安全桶下标 idx = ((key % ht.cap) + ht.cap) % ht.cap。
//   3. 顺着 ht.buckets[idx] 遍历链表，找到 cur->key == key 时赋值 outVal 并返回 true。
//   4. 遍历完毕仍未找到，返回 false。
//
// 【边界提醒】
//   - 同样必须使用负数安全取模公式！
// ----------------------------------------------------------------------------
bool htGet(const HashTable& ht, int key, int& outVal) {
    // TODO: 实现拉链法查找
    (void)ht;
    (void)key;
    (void)outVal;
    return false;
}

// ----------------------------------------------------------------------------
// 任务 C4：哈希表删除
// 【函数目标】
//   在哈希表 ht 中删除关键字为 key 的节点：
//   - 若存在并成功删除（释放该节点内存），返回 true；
//   - 若不存在，返回 false。
//
// 【画图与思路推导】
//   1. 若 ht.cap <= 0 || ht.buckets.empty()，返回 false。
//   2. 计算安全桶下标 idx = ((key % ht.cap) + ht.cap) % ht.cap。
//   3. 维护双指针 prev = nullptr, cur = ht.buckets[idx] 遍历链表：
//      当 cur != nullptr 时：
//      - 如果 cur->key == key：
//          * 如果 prev == nullptr（删的是链头）：ht.buckets[idx] = cur->next;
//          * 否则（删的是链中或链尾）：prev->next = cur->next;
//          * delete cur;
//          * return true;
//      - 否则：prev = cur; cur = cur->next;
//   4. 循环结束没找到，返回 false。
//
// 【边界提醒】
//   - 删链头、删链中、删链尾三种情况都要正确衔接链表，并 delete 掉被删节点！
// ----------------------------------------------------------------------------
bool htRemove(HashTable& ht, int key) {
    // TODO: 实现拉链法删除（处理链头/链中/链尾）
    (void)ht;
    (void)key;
    return false;
}

// ----------------------------------------------------------------------------
// 任务 C5：哈希表销毁
// 【函数目标】
//   释放哈希表 ht 中所有桶链表上的全部 HashNode 内存，并将每个桶指针置为 nullptr。
//
// 【画图与思路推导】
//   1. 遍历每个桶 i = 0 .. ht.buckets.size()-1：
//      用 cur = ht.buckets[i] 逐个释放：
//        while (cur != nullptr) {
//            HashNode* nxt = cur->next;
//            delete cur;
//            cur = nxt;
//        }
//      ht.buckets[i] = nullptr;
//
// 【边界提醒】
//   - delete cur 之前必须先保存 cur->next！
// ----------------------------------------------------------------------------
void htDestroy(HashTable& ht) {
    // TODO: 释放哈希表全部链表节点并置空桶指针
    (void)ht;
}

// ============================== 自动评测代码 ==============================
// 注意：请不要修改 main() 中的测试逻辑！

int main() {
    labtest::beginLab("Lab 10: 查找与哈希表 (折半查找 + BST + 拉链法哈希表)");

    // ==================== Part A：折半查找测试 ====================
    {
        std::vector<int> emptyArr;
        labtest::expectEqInt(
            "binarySearch 空数组查找",
            -1,
            binarySearch(emptyArr, 10),
            "空数组 high = -1，不能用无符号 size_t 作为 high 否则会下溢崩溃");
        labtest::expectEqInt(
            "lowerBound 空数组查找",
            0,
            lowerBound(emptyArr, 10),
            "空数组没有任何元素，a.size() 为 0，应返回 0");

        std::vector<int> singleArr{7};
        labtest::expectEqInt(
            "binarySearch 单元素命中",
            0,
            binarySearch(singleArr, 7),
            "单元素数组 low==high==0，循环条件必须是 low <= high");
        labtest::expectEqInt(
            "binarySearch 单元素未命中",
            -1,
            binarySearch(singleArr, 5),
            "找不到应返回 -1");
        labtest::expectEqInt(
            "lowerBound 单元素（目标小于唯一元素）",
            0,
            lowerBound(singleArr, 5),
            "a[0]=7 >= 5，第一个 >=5 的下标是 0");
        labtest::expectEqInt(
            "lowerBound 单元素（目标大于唯一元素）",
            1,
            lowerBound(singleArr, 9),
            "所有元素都小于 9，应返回 a.size() == 1");

        std::vector<int> arr{2, 5, 8, 12, 16, 23, 38};
        labtest::expectEqInt(
            "binarySearch 命中首元素",
            0,
            binarySearch(arr, 2),
            "检查左边界收缩 high = mid - 1 及 low <= high");
        labtest::expectEqInt(
            "binarySearch 命中尾元素",
            6,
            binarySearch(arr, 38),
            "检查右边界收缩 low = mid + 1 及 low <= high");
        labtest::expectEqInt(
            "binarySearch 命中中间元素",
            3,
            binarySearch(arr, 12),
            "12 位于下标 3");
        labtest::expectEqInt(
            "binarySearch 中间缺失元素",
            -1,
            binarySearch(arr, 15),
            "15 不在数组中，应返回 -1");

        std::vector<int> dupArr{1, 3, 3, 3, 5, 8};
        labtest::expectEqInt(
            "lowerBound 重复元素返回最左下标",
            1,
            lowerBound(dupArr, 3),
            "有多个 3 时必须返回第一个 3 的下标 1：当 a[mid] >= target 时令 high = mid");
        labtest::expectEqInt(
            "lowerBound 目标不存在（位于中间）",
            4,
            lowerBound(dupArr, 4),
            "第一个 >= 4 的元素是 5，位于下标 4");
        labtest::expectEqInt(
            "lowerBound 目标小于最小值",
            0,
            lowerBound(dupArr, 0),
            "第一个 >= 0 的元素位于下标 0");
        labtest::expectEqInt(
            "lowerBound 目标大于最大值",
            6,
            lowerBound(dupArr, 10),
            "所有元素都 < 10，应返回 a.size() == 6");
    }

    // ==================== Part B：二叉排序树 BST 测试 ====================
    {
        BSTNode* root = nullptr;
        labtest::expectTrue(
            "BST 空树查找返回 false",
            !bstSearch(root, 50),
            "空树查找必须先判 root == nullptr 返回 false");

        /*
         * 构造经典 BST：
         *            50
         *          /    \
         *        30      70
         *       /  \    /  \
         *      20  40  60  80
         *         /      \
         *        35      65
         */
        int keys[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 30, 50};  // 含重复 30 和 50
        for (int k : keys) {
            root = bstInsert(root, k);
        }

        std::vector<int> inorder;
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 插入（含去重）后中序遍历有序",
            std::vector<int>{20, 30, 35, 40, 50, 60, 65, 70, 80},
            inorder,
            "重复插入 30、50 不应产生重复节点，中序遍历应严格升序");

        labtest::expectTrue(
            "BST 查找存在元素 35",
            bstSearch(root, 35),
            "35 应存在于树中，检查向左/向右分支判断");
        labtest::expectTrue(
            "BST 查找不存在元素 45",
            !bstSearch(root, 45),
            "45 不在树中，应返回 false");

        // 删不存在的 key
        root = bstDelete(root, 999);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 删除不存在的 key（树不变）",
            std::vector<int>{20, 30, 35, 40, 50, 60, 65, 70, 80},
            inorder,
            "删除不存在的 key 时应原样返回，不能误删节点");

        // 情况 1：删除叶子节点 20
        root = bstDelete(root, 20);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 删除叶子节点 20",
            std::vector<int>{30, 35, 40, 50, 60, 65, 70, 80},
            inorder,
            "删叶子节点后应返回 nullptr 接回父节点，并释放原节点");

        // 情况 2a：删除左空单孩子节点 60（只有右孩子 65）
        root = bstDelete(root, 60);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 删除左空单孩子节点 60",
            std::vector<int>{30, 35, 40, 50, 65, 70, 80},
            inorder,
            "60 只有右孩子 65，删除后应返回 root->right (65) 接替位置");

        // 情况 2b：删除右空单孩子节点 40（只有左孩子 35）
        root = bstDelete(root, 40);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 删除右空单孩子节点 40",
            std::vector<int>{30, 35, 50, 65, 70, 80},
            inorder,
            "40 只有左孩子 35，删除后应返回 root->left (35) 接替位置");

        // 情况 3：删除双孩子根节点 50（右子树最小节点是 65）
        root = bstDelete(root, 50);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 删除双孩子根节点 50 后中序有序",
            std::vector<int>{30, 35, 65, 70, 80},
            inorder,
            "双孩子删除：用右子树最小节点 65 替换根的 key，再递归删除右子树中的 65");
        labtest::expectTrue(
            "BST 删除双孩子根节点后新根 key 为右子树最小值 65",
            root != nullptr && root->key == 65,
            "按右子树最小节点替代策略，删除 50 后新根节点 key 应为 65");
        labtest::expectTrue(
            "BST 删除 50 后再查找 50 返回 false",
            !bstSearch(root, 50),
            "50 已被删除，不应再被查找到");

        // 再删一次双孩子节点（此时根 65 左右子树为 30(右35) 和 70(右80)）
        root = bstDelete(root, 65);
        inorder.clear();
        bstInorder(root, inorder);
        labtest::expectEqVec(
            "BST 连续删除双孩子节点 65（后继 70 自带右孩子 80）",
            std::vector<int>{30, 35, 70, 80},
            inorder,
            "当右子树最小节点 70 还有右孩子 80 时，递归调用 bstDelete(root->right, 70) 才能正确接上 80");

        bstDestroy(root);
        labtest::expectTrue(
            "BST 销毁后根指针置为 nullptr",
            root == nullptr,
            "bstDestroy 释放所有节点后必须执行 root = nullptr");
    }

    // ==================== Part C：链地址法哈希表测试 ====================
    {
        HashTable ht;
        ht.cap = 0;
        htInit(ht, 5);
        labtest::expectTrue(
            "HashTable 初始化容量与桶数组",
            ht.cap == 5 && ht.buckets.size() == 5,
            "htInit 应设置 ht.cap = cap 并分配 cap 个初始化为 nullptr 的桶");

        // 插入 4 个必然冲突的 key（对 5 取模全都落在桶 1）
        htPut(ht, 1, 100);
        htPut(ht, 6, 600);
        htPut(ht, 11, 1100);
        htPut(ht, 16, 1600);

        int val = -1;
        bool ok1 = htGet(ht, 1, val) && val == 100;
        bool ok6 = htGet(ht, 6, val) && val == 600;
        bool ok11 = htGet(ht, 11, val) && val == 1100;
        bool ok16 = htGet(ht, 16, val) && val == 1600;
        labtest::expectTrue(
            "HashTable 同桶碰撞链全部可查",
            ok1 && ok6 && ok11 && ok16,
            "1, 6, 11, 16 均映射到桶 1，检查头插法是否丢失原链表节点");

        // 更新已有 key
        htPut(ht, 6, 666);
        val = -1;
        labtest::expectTrue(
            "HashTable 更新已有 key 覆盖旧值",
            htGet(ht, 6, val) && val == 666,
            "htPut 发现 key 已存在时应原地更新 value，而不是头插一个重复节点");

        // 删除不存在的 key
        labtest::expectTrue(
            "HashTable 删除不存在的 key 返回 false",
            !htRemove(ht, 99),
            "找不到要删除的 key 时应返回 false");

        // 此时桶 1 头插顺序为：16 -> 11 -> 6 -> 1
        // 1) 删除链头 16
        labtest::expectTrue(
            "HashTable 删除碰撞链【链头】16",
            htRemove(ht, 16) && !htGet(ht, 16, val) && htGet(ht, 11, val) && val == 1100,
            "删除链头时（prev == nullptr）必须更新 ht.buckets[idx] = cur->next");

        // 2) 删除链中 6
        labtest::expectTrue(
            "HashTable 删除碰撞链【链中】6",
            htRemove(ht, 6) && !htGet(ht, 6, val) && htGet(ht, 1, val) && val == 100,
            "删除链中节点时必须令 prev->next = cur->next，不能断链丢失后面的 1");

        // 3) 删除链尾 1
        labtest::expectTrue(
            "HashTable 删除碰撞链【链尾】1",
            htRemove(ht, 1) && !htGet(ht, 1, val) && htGet(ht, 11, val) && val == 1100,
            "删除链尾节点后，剩下的节点 11 应依然可正常查出");

        // 负数 key 测试（-1, -6, 4 对 5 安全取模均落在桶 4）
        htPut(ht, -1, -10);
        htPut(ht, -6, -60);
        htPut(ht, 4, 40);
        htPut(ht, -1, -11);  // 更新负数 key
        bool negOk1 = htGet(ht, -1, val) && val == -11;
        bool negOk2 = htGet(ht, -6, val) && val == -60;
        bool negOk3 = htGet(ht, 4, val) && val == 40;
        bool negDel = htRemove(ht, -6) && !htGet(ht, -6, val) && htGet(ht, -1, val) && val == -11;
        labtest::expectTrue(
            "HashTable 负数 key 安全取模与增查改删",
            negOk1 && negOk2 && negOk3 && negDel,
            "C++ 负数直接 % cap 会得负数下标越界！请使用 ((key % ht.cap) + ht.cap) % ht.cap");

        htDestroy(ht);
        bool allNull = !ht.buckets.empty();
        for (size_t i = 0; i < ht.buckets.size(); ++i) {
            if (ht.buckets[i] != nullptr) {
                allNull = false;
            }
        }
        labtest::expectTrue(
            "HashTable 销毁后所有桶指针均置为 nullptr",
            allNull,
            "htDestroy 释放每条链后必须将 ht.buckets[i] 置为 nullptr");
    }

    return labtest::endLab();
}
