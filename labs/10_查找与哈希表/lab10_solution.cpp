// ============================================================================
// 第 10 关【参考答案】：查找与哈希表（折半查找 + 二叉排序树 BST + 拉链法散列表）
// 对应笔记：《06-查找.md》6.2 ~ 6.4
// ============================================================================

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：折半查找（0-based 有序数组）
// ============================================================================

int binarySearch(const std::vector<int>& a, int target) {
    int low = 0;
    int high = static_cast<int>(a.size()) - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (a[mid] == target) {
            return mid;
        } else if (a[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

int lowerBound(const std::vector<int>& a, int target) {
    int low = 0;
    int high = static_cast<int>(a.size());
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (a[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

// ============================================================================
// Part B：二叉排序树（BST）
// ============================================================================

struct BSTNode {
    int key;
    BSTNode* left;
    BSTNode* right;
};

BSTNode* bstInsert(BSTNode* root, int key) {
    if (root == nullptr) {
        BSTNode* node = new BSTNode;
        node->key = key;
        node->left = nullptr;
        node->right = nullptr;
        return node;
    }
    if (key < root->key) {
        root->left = bstInsert(root->left, key);
    } else if (key > root->key) {
        root->right = bstInsert(root->right, key);
    }
    // key == root->key 时不重复插入
    return root;
}

bool bstSearch(BSTNode* root, int key) {
    BSTNode* cur = root;
    while (cur != nullptr) {
        if (key == cur->key) {
            return true;
        } else if (key < cur->key) {
            cur = cur->left;
        } else {
            cur = cur->right;
        }
    }
    return false;
}

BSTNode* bstDelete(BSTNode* root, int key) {
    if (root == nullptr) {
        return nullptr;
    }
    if (key < root->key) {
        root->left = bstDelete(root->left, key);
        return root;
    }
    if (key > root->key) {
        root->right = bstDelete(root->right, key);
        return root;
    }

    // 找到目标节点 root，分 3 种情况处理：
    // 情况 1 & 2a：左子树为空（含叶子节点与只有右孩子）
    if (root->left == nullptr) {
        BSTNode* rightChild = root->right;
        delete root;
        return rightChild;
    }
    // 情况 2b：右子树为空（只有左孩子）
    if (root->right == nullptr) {
        BSTNode* leftChild = root->left;
        delete root;
        return leftChild;
    }

    // 情况 3：左右孩子均非空 -> 用右子树最小节点替代后递归删除
    BSTNode* succ = root->right;
    while (succ->left != nullptr) {
        succ = succ->left;
    }
    root->key = succ->key;
    root->right = bstDelete(root->right, succ->key);
    return root;
}

void bstInorder(BSTNode* root, std::vector<int>& out) {
    if (root == nullptr) {
        return;
    }
    bstInorder(root->left, out);
    out.push_back(root->key);
    bstInorder(root->right, out);
}

void bstDestroy(BSTNode*& root) {
    if (root == nullptr) {
        return;
    }
    bstDestroy(root->left);
    bstDestroy(root->right);
    delete root;
    root = nullptr;
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
    std::vector<HashNode*> buckets;
    int cap;
};

void htInit(HashTable& ht, int cap) {
    ht.cap = (cap > 0) ? cap : 1;
    ht.buckets.assign(ht.cap, nullptr);
}

void htPut(HashTable& ht, int key, int value) {
    if (ht.cap <= 0 || ht.buckets.empty()) {
        return;
    }
    int idx = ((key % ht.cap) + ht.cap) % ht.cap;
    HashNode* cur = ht.buckets[idx];
    while (cur != nullptr) {
        if (cur->key == key) {
            cur->value = value;
            return;
        }
        cur = cur->next;
    }
    HashNode* node = new HashNode;
    node->key = key;
    node->value = value;
    node->next = ht.buckets[idx];
    ht.buckets[idx] = node;
}

bool htGet(const HashTable& ht, int key, int& outVal) {
    if (ht.cap <= 0 || ht.buckets.empty()) {
        return false;
    }
    int idx = ((key % ht.cap) + ht.cap) % ht.cap;
    HashNode* cur = ht.buckets[idx];
    while (cur != nullptr) {
        if (cur->key == key) {
            outVal = cur->value;
            return true;
        }
        cur = cur->next;
    }
    return false;
}

bool htRemove(HashTable& ht, int key) {
    if (ht.cap <= 0 || ht.buckets.empty()) {
        return false;
    }
    int idx = ((key % ht.cap) + ht.cap) % ht.cap;
    HashNode* prev = nullptr;
    HashNode* cur = ht.buckets[idx];
    while (cur != nullptr) {
        if (cur->key == key) {
            if (prev == nullptr) {
                ht.buckets[idx] = cur->next;
            } else {
                prev->next = cur->next;
            }
            delete cur;
            return true;
        }
        prev = cur;
        cur = cur->next;
    }
    return false;
}

void htDestroy(HashTable& ht) {
    for (size_t i = 0; i < ht.buckets.size(); ++i) {
        HashNode* cur = ht.buckets[i];
        while (cur != nullptr) {
            HashNode* nxt = cur->next;
            delete cur;
            cur = nxt;
        }
        ht.buckets[i] = nullptr;
    }
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
