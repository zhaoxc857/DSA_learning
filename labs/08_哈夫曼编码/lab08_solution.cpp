// ============================================================================
// 关卡 08：哈夫曼树构造、WPL 计算与前缀编码/解码（参考答案）
// 对应教材：第 4 章 4.5 哈夫曼树与哈夫曼编码（静态数组三叉链表存储）
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <string>
#include <vector>

struct HNode {
    int weight;
    int parent;
    int lchild;
    int rchild;
};

// 任务 1：选出 [0, endIdx) 中 parent == -1 且权值最小的两个节点下标
void selectTwoMin(const std::vector<HNode>& tree, int endIdx, int& s1, int& s2) {
    s1 = -1;
    s2 = -1;
    for (int i = 0; i < endIdx; ++i) {
        if (tree[i].parent != -1) {
            continue;
        }
        if (s1 == -1 || tree[i].weight < tree[s1].weight) {
            s2 = s1;
            s1 = i;
        } else if (s2 == -1 || tree[i].weight < tree[s2].weight) {
            s2 = i;
        }
    }
}

// 任务 2：构造共 2n - 1 个节点的静态数组哈夫曼树
std::vector<HNode> buildHuffmanTree(const std::vector<int>& weights) {
    int n = static_cast<int>(weights.size());
    if (n == 0) {
        return {};
    }
    int m = 2 * n - 1;
    std::vector<HNode> tree(m, {0, -1, -1, -1});
    for (int i = 0; i < n; ++i) {
        tree[i].weight = weights[i];
    }

    for (int i = n; i < m; ++i) {
        int s1 = -1, s2 = -1;
        selectTwoMin(tree, i, s1, s2);
        tree[s1].parent = i;
        tree[s2].parent = i;
        tree[i].lchild = s1;
        tree[i].rchild = s2;
        tree[i].weight = tree[s1].weight + tree[s2].weight;
    }
    return tree;
}

// 任务 3：计算带权路径长度 WPL
int calcWPL(const std::vector<HNode>& tree, int n) {
    if (n <= 1 || tree.empty()) {
        return 0;
    }
    int wpl = 0;
    for (int i = 0; i < n; ++i) {
        int depth = 0;
        int cur = i;
        while (tree[cur].parent != -1) {
            cur = tree[cur].parent;
            ++depth;
        }
        wpl += tree[i].weight * depth;
    }
    return wpl;
}

// 任务 4：生成哈夫曼前缀编码（左 0 右 1）
std::vector<std::string> buildHuffmanCodes(const std::vector<HNode>& tree, int n) {
    if (n <= 0 || tree.empty()) {
        return {};
    }
    if (n == 1) {
        return {"0"};
    }
    std::vector<std::string> codes(n);
    for (int i = 0; i < n; ++i) {
        std::string code;
        int cur = i;
        int p = tree[cur].parent;
        while (p != -1) {
            if (tree[p].lchild == cur) {
                code.push_back('0');
            } else {
                code.push_back('1');
            }
            cur = p;
            p = tree[cur].parent;
        }
        std::reverse(code.begin(), code.end());
        codes[i] = code;
    }
    return codes;
}

// 任务 5：哈夫曼解码
std::string decodeHuffman(const std::vector<HNode>& tree,
                          const std::vector<char>& chars,
                          const std::string& bits) {
    if (tree.empty() || chars.empty() || bits.empty()) {
        return "";
    }
    std::string result;
    if (chars.size() == 1) {
        for (size_t i = 0; i < bits.size(); ++i) {
            if (bits[i] == '0') {
                result.push_back(chars[0]);
            }
        }
        return result;
    }

    int root = static_cast<int>(tree.size()) - 1;
    int cur = root;
    for (size_t i = 0; i < bits.size(); ++i) {
        if (bits[i] == '0') {
            cur = tree[cur].lchild;
        } else if (bits[i] == '1') {
            cur = tree[cur].rchild;
        }
        if (cur >= 0 && tree[cur].lchild == -1 && tree[cur].rchild == -1) {
            result.push_back(chars[cur]);
            cur = root;
        }
    }
    return result;
}

// ============================================================================
// [测试辅助] 校验编码表是否满足前缀码性质，及按编码表编码字符串（与 todo 一致）
// ============================================================================
static bool isValidPrefixCodes(const std::vector<std::string>& codes, int n) {
    if (static_cast<int>(codes.size()) != n) {
        return false;
    }
    for (int i = 0; i < n; ++i) {
        if (codes[i].empty()) {
            return false;
        }
        for (size_t k = 0; k < codes[i].size(); ++k) {
            if (codes[i][k] != '0' && codes[i][k] != '1') {
                return false;
            }
        }
    }
    // 任意两个不同编码互不为前缀
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            if (i == j) continue;
            if (codes[i].size() <= codes[j].size() &&
                codes[j].compare(0, codes[i].size(), codes[i]) == 0) {
                return false;
            }
        }
    }
    return true;
}

static int calcWPLByCodes(const std::vector<int>& weights, const std::vector<std::string>& codes) {
    if (weights.size() != codes.size()) {
        return -1;
    }
    int sum = 0;
    for (size_t i = 0; i < weights.size(); ++i) {
        sum += weights[i] * static_cast<int>(codes[i].size());
    }
    return sum;
}

static std::string encodeText(const std::string& text,
                              const std::vector<char>& chars,
                              const std::vector<std::string>& codes) {
    if (chars.size() != codes.size()) {
        return "";
    }
    std::string bits;
    for (size_t i = 0; i < text.size(); ++i) {
        for (size_t k = 0; k < chars.size(); ++k) {
            if (chars[k] == text[i]) {
                bits += codes[k];
                break;
            }
        }
    }
    return bits;
}

// ============================================================================
// 自动测试套件（与 lab08_todo.cpp 保持完全一致）
// ============================================================================
int main() {
    labtest::beginLab("关卡 08：哈夫曼树构造、WPL 计算与前缀编码/解码");

    // ---------- 1. selectTwoMin 专项测试 ----------
    {
        std::vector<HNode> nodes = {
            {10, -1, -1, -1}, // 0: 可选
            {3,   5, -1, -1}, // 1: parent != -1，已合并，必须跳过！
            {8,  -1, -1, -1}, // 2: 可选
            {4,  -1, -1, -1}, // 3: 可选（最小）
            {6,  -1, -1, -1}, // 4: 可选（次小）
            {9,  -1,  1, -1}  // 5: 处于 endIdx 之外（本次不看）
        };
        int s1 = -1, s2 = -1;
        selectTwoMin(nodes, 5, s1, s2);
        labtest::expectEqInt("selectTwoMin 跳过已合并节点并找出最小下标 s1", 3, s1,
            "下标 1 的 parent != -1 必须跳过，剩余最小权值为下标 3 (weight=4)");
        labtest::expectEqInt("selectTwoMin 找出次小下标 s2", 4, s2,
            "次小权值为下标 4 (weight=6)，注意更新 s1 前必须先 s2 = s1");
        labtest::expectTrue("selectTwoMin 满足 weight[s1] <= weight[s2]",
            s1 >= 0 && s2 >= 0 && nodes[s1].weight <= nodes[s2].weight,
            "约定 s1 权值不大于 s2 权值");
    }

    // ---------- 2. 经典小例 {2, 3, 4, 7} 全流程测试 ----------
    {
        std::vector<int> weights = {2, 3, 4, 7};
        std::vector<char> chars  = {'A', 'B', 'C', 'D'};
        int n = static_cast<int>(weights.size());

        std::vector<HNode> tree = buildHuffmanTree(weights);
        labtest::expectEqInt("{2,3,4,7} 哈夫曼树节点总数应为 2n-1 = 7", 7,
            static_cast<int>(tree.size()),
            "n 个叶子构造的哈夫曼树共有 2n - 1 个节点");

        int rootWeight = (!tree.empty()) ? tree.back().weight : -1;
        int rootParent = (!tree.empty()) ? tree.back().parent : -2;
        labtest::expectEqInt("{2,3,4,7} 根节点权值应等于总权值和 16", 16, rootWeight,
            "根节点位于 2n - 2，权值应等于 2 + 3 + 4 + 7 = 16");
        labtest::expectEqInt("{2,3,4,7} 根节点 parent 应为 -1", -1, rootParent,
            "根节点没有父节点，parent 必须保持 -1");

        // 合并过程：2+3=5, 4+5=9, 7+9=16 => WPL = 5 + 9 + 16 = 30
        labtest::expectEqInt("{2,3,4,7} 精确 WPL = 30", 30,
            calcWPL(tree, n),
            "2*3 + 3*3 + 4*2 + 7*1 = 30（也等于非叶节点权值和 5 + 9 + 16）");

        std::vector<std::string> codes = buildHuffmanCodes(tree, n);
        labtest::expectTrue("{2,3,4,7} 生成合法前缀码（非空、仅0/1、无前缀冲突）",
            isValidPrefixCodes(codes, n),
            "检查是否从叶子回溯到根、左0右1，且别忘了 std::reverse 反转编码串！");

        labtest::expectEqInt("{2,3,4,7} 编码长度加权和应严格等于 WPL (30)", 30,
            calcWPLByCodes(weights, codes),
            "每个叶子的编码长度必须等于其到根的边数，总加权长度必等于 30");

        std::string plain = "DCBAADCBBDCA";
        std::string encoded = encodeText(plain, chars, codes);
        std::string decoded = decodeHuffman(tree, chars, encoded);
        labtest::expectEqStr("{2,3,4,7} 编码后解码还原原文", plain, decoded,
            "检查 decodeHuffman 是否从根 2n-2 出发，'0'走lchild，'1'走rchild，到叶子输出后重置 cur=root");
    }

    // ---------- 3. 教材经典 8 字符用例 {5, 29, 7, 8, 14, 23, 3, 11} ----------
    {
        std::vector<int> weights = {5, 29, 7, 8, 14, 23, 3, 11};
        std::vector<char> chars  = {'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'};
        int n = static_cast<int>(weights.size());

        std::vector<HNode> tree = buildHuffmanTree(weights);
        labtest::expectEqInt("8 字符哈夫曼树节点总数应为 15", 15,
            static_cast<int>(tree.size()),
            "2 * 8 - 1 = 15");

        int rootWeight = (!tree.empty()) ? tree.back().weight : -1;
        labtest::expectEqInt("8 字符根节点权值应等于总权值和 100", 100, rootWeight,
            "5+29+7+8+14+23+3+11 = 100");

        // 合并过程：3+5=8, 7+8=15, 8+11=19, 14+15=29, 19+23=42, 29+29=58, 42+58=100
        // WPL = 8 + 15 + 19 + 29 + 42 + 58 + 100 = 271
        labtest::expectEqInt("教材经典 8 字符精确 WPL = 271", 271,
            calcWPL(tree, n),
            "合并产生的 7 个内部节点权值依次为 8,15,19,29,42,58,100，其和 = 271；检查 selectTwoMin 是否每次选全局最小两个未合并节点");

        std::vector<std::string> codes = buildHuffmanCodes(tree, n);
        labtest::expectTrue("8 字符前缀码无冲突校验",
            isValidPrefixCodes(codes, n),
            "任意两个字符的编码不能互为前缀，请检查是否漏了反转或左右孩子判断有误");

        labtest::expectEqInt("8 字符编码加权长度等于 WPL (271)", 271,
            calcWPLByCodes(weights, codes),
            "sum(weights[i] * codes[i].size()) 应等于 271");

        std::string plain = "abcdefghhgfedcbabbfbeee";
        std::string encoded = encodeText(plain, chars, codes);
        std::string decoded = decodeHuffman(tree, chars, encoded);
        labtest::expectEqStr("8 字符编码再解码与原文完全一致", plain, decoded,
            "检查解码循环：每次到达叶子（lchild == -1 && rchild == -1）输出 chars[cur] 后必须重置 cur = root");
    }

    // ---------- 4. 单字符边界 n == 1 与空输入测试 ----------
    {
        std::vector<HNode> emptyTree = buildHuffmanTree({});
        labtest::expectEqInt("空权值数组构造空树", 0,
            static_cast<int>(emptyTree.size()),
            "weights.empty() 时应返回空 vector {}");

        std::vector<int> w1 = {15};
        std::vector<char> c1 = {'X'};
        std::vector<HNode> tree1 = buildHuffmanTree(w1);
        labtest::expectEqInt("单字符 n==1 树节点数为 1", 1,
            static_cast<int>(tree1.size()),
            "2 * 1 - 1 = 1，直接返回包含 1 个节点的 vector");
        labtest::expectEqInt("单字符 n==1 WPL 为 0", 0,
            calcWPL(tree1, 1),
            "只有一个叶子时其自身就是根，路径边数为 0，WPL = 0");

        std::vector<std::string> codes1 = buildHuffmanCodes(tree1, 1);
        labtest::expectTrue("单字符 n==1 编码约定为 {\"0\"}",
            codes1.size() == 1 && codes1[0] == "0",
            "n == 1 时需特判返回 {\"0\"}，避免返回空串 \"\"");

        std::string encoded1 = encodeText("XXXX", c1, codes1);
        labtest::expectEqStr("单字符编码 \"XXXX\" -> \"0000\"", "0000", encoded1,
            "单个字符编码为 \"0\"，4 个 X 编为 \"0000\"");
        labtest::expectEqStr("单字符解码 \"0000\" -> \"XXXX\"", "XXXX",
            decodeHuffman(tree1, c1, encoded1),
            "n == 1 时根节点 lchild == -1，必须特判按 '0' 输出 chars[0]，切勿直接访问 tree[-1] 越界！");
    }

    return labtest::endLab();
}
