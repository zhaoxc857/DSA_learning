// ============================================================================
// 关卡 08：哈夫曼树构造、WPL 计算与前缀编码/解码（学生练习版）
// 对应教材：第 4 章 4.5 哈夫曼树与哈夫曼编码（静态数组三叉链表存储）
//
// 本关目标：
//   1. 理解教材经典的静态数组节点 HNode（用数组下标代替指针，-1 表示空）
//   2. 实现 selectTwoMin：在尚未合并的节点中挑出权值最小的两个
//   3. 实现 buildHuffmanTree：用 n 个叶子构造共 2n - 1 个节点的哈夫曼树
//   4. 实现 calcWPL：计算带权路径长度（并体会“非叶节点权值之和 == WPL”）
//   5. 实现 buildHuffmanCodes 与 decodeHuffman：完成编码 -> 解码完整闭环
//
// 运行评测（在 labs 目录下）：
//   python judge.py 08
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <string>
#include <vector>

// 静态数组哈夫曼树节点（parent / lchild / rchild 无对应时约定为 -1）
struct HNode {
    int weight;
    int parent;
    int lchild;
    int rchild;
};

// ----------------------------------------------------------------------------
// 任务 1：选出权值最小的两个根节点
// 【函数目标】
//   在 tree[0 .. endIdx - 1] 范围内，找出所有 parent == -1（尚未被合并）的节点中
//   权值最小的两个节点下标，通过引用参数存入 s1 和 s2，
//   并保证 tree[s1].weight <= tree[s2].weight。
//   若可选节点不足 2 个，找不到者设为 -1。
// 【画图与思路推导】
//   1. 初始化 s1 = -1, s2 = -1；
//   2. 循环 i = 0 .. endIdx - 1：
//        a) 若 tree[i].parent != -1，跳过（该节点已归属某棵子树，不再参与竞争）；
//        b) 若 s1 == -1 || tree[i].weight < tree[s1].weight：
//             先让原来的最小退居次小：s2 = s1;
//             再更新最小：s1 = i;
//        c) 否则若 s2 == -1 || tree[i].weight < tree[s2].weight：
//             更新次小：s2 = i;
// 【边界提醒】
//   - 更新 s1 之前一定要先写 s2 = s1，否则原来的最小值就被直接覆盖弄丢了！
//   - 千万不要忘记过滤 tree[i].parent != -1 的节点。
//   - 用 s1 == -1 判首次赋值比硬编码“999999”更安全，不怕大权值出错。
// ----------------------------------------------------------------------------
void selectTwoMin(const std::vector<HNode>& tree, int endIdx, int& s1, int& s2) {
    // TODO: 在 [0, endIdx) 中找 parent == -1 且权值最小的两个下标 s1, s2
    (void)tree;
    (void)endIdx;
    s1 = -1;
    s2 = -1;
}

// ----------------------------------------------------------------------------
// 任务 2：构造静态数组哈夫曼树
// 【函数目标】
//   根据 n 个叶子的权值数组 weights，构造共 2n - 1 个节点的哈夫曼树并返回：
//   - 若 weights 为空（n == 0），返回空 vector {}；
//   - 下标 0 .. n-1 存放 n 个叶子节点：weight = weights[i]，parent = lchild = rchild = -1；
//   - 下标 n .. 2n-2 存放 n - 1 次合并产生的新内部节点；
//   - 约定最终树根位于下标 2n - 2（当 n == 1 时，根即下标 0）。
// 【画图与思路推导】
//   1. n = weights.size()；若 n == 0 返回 {}；
//   2. 总节点数 m = 2 * n - 1，创建 vector<HNode> tree(m, {0, -1, -1, -1})；
//   3. 将前 n 个节点权值设为 weights[0 .. n-1]；
//   4. 合并 n - 1 次，i 从 n 到 m - 1：
//        a) 调用 selectTwoMin(tree, i, s1, s2)；
//        b) 双向挂接父子关系：
//             tree[s1].parent = i;
//             tree[s2].parent = i;
//             tree[i].lchild = s1;
//             tree[i].rchild = s2;
//             tree[i].weight = tree[s1].weight + tree[s2].weight;
//   5. 返回 tree。
// 【边界提醒】
//   - 当 n == 1 时，m = 1，循环 i = 1; i < 1 不执行，正好返回唯一的节点 0。
//   - 别漏掉双向连边：孩子的 parent 和父亲的 lchild / rchild 都要赋值！
// ----------------------------------------------------------------------------
std::vector<HNode> buildHuffmanTree(const std::vector<int>& weights) {
    // TODO: 构造 2n - 1 个节点的哈夫曼树
    (void)weights;
    return {};
}

// ----------------------------------------------------------------------------
// 任务 3：计算哈夫曼树的带权路径长度 WPL
// 【函数目标】
//   计算并返回哈夫曼树的 WPL = sum(叶子权值 * 叶子到根的边数)。
//   其中前 n 个节点（下标 0 .. n-1）为叶子节点。
// 【画图与思路推导】
//   方法一（按定义逐个叶子向上爬到根）：
//     1. 若 n <= 1 或 tree.empty()，返回 0（单节点路径长度为 0）；
//     2. 对每个叶子 i = 0 .. n - 1：
//          设 depth = 0, cur = i；
//          while (tree[cur].parent != -1) { cur = tree[cur].parent; depth++; }
//          wpl += tree[i].weight * depth;
//   方法二（超实用的数学性质！）：
//     哈夫曼树中，所有【非叶节点】（下标 n .. 2n-2）的权值之和也严格等于 WPL！
//     想一想为什么：每次把两棵子树合并成新节点，新节点权值 = 两子树所有叶子权值之和，
//     相当于每多走一层边，子树里每个叶子的权值就被多累加了一次！
//   两种方法结果完全一致，推荐自己用定义法实现一遍，再在草稿纸上用性质法心算验算。
// 【边界提醒】
//   - n <= 1 时 WPL 为 0。
//   - 路径长度算的是“边数”不是“节点数”，别多加 1！
// ----------------------------------------------------------------------------
int calcWPL(const std::vector<HNode>& tree, int n) {
    // TODO: 计算带权路径长度 WPL
    (void)tree;
    (void)n;
    return 0;
}

// ----------------------------------------------------------------------------
// 任务 4：生成哈夫曼前缀编码
// 【函数目标】
//   为前 n 个叶子节点（下标 0 .. n-1）生成对应的 0/1 哈夫曼前缀码：
//   - 约定从父节点走向左孩子（lchild）记 '0'，走向右孩子（rchild）记 '1'；
//   - 返回长度为 n 的 vector<std::string>，codes[i] 对应叶子 i 的编码；
//   - 特殊边界：n <= 0 返回 {}；当 n == 1 时，唯一字符编码约定为 "0"。
// 【画图与思路推导】
//   1. 若 n <= 0 或 tree.empty() 返回 {}；
//   2. 若 n == 1，直接返回 {"0"}；
//   3. 对每个叶子 i = 0 .. n - 1：
//        a) 设 cur = i，p = tree[cur].parent，string code;
//        b) 沿 parent 一路回溯到根（while (p != -1)）：
//             若 tree[p].lchild == cur，则 code.push_back('0');
//             否则 code.push_back('1');
//             cur = p;
//             p = tree[cur].parent;
//        c) 因为是从叶子往根收集的，方向反了，调用 std::reverse(code.begin(), code.end());
//        d) 存入 codes[i] = code。
//   4. 返回 codes。
// 【边界提醒】
//   - 千万别忘记反转 code！否则生成的不是合法前缀码，解码会完全错乱。
//   - 判左右孩子时是看 cur 是否等于 tree[p].lchild。
//   - n == 1 时必须特判返回 {"0"}（若不特判，while 循环不执行会得到空串 ""）。
// ----------------------------------------------------------------------------
std::vector<std::string> buildHuffmanCodes(const std::vector<HNode>& tree, int n) {
    // TODO: 从每个叶子回溯到根，左 0 右 1 再反转生成哈夫曼编码
    (void)tree;
    (void)n;
    return {};
}

// ----------------------------------------------------------------------------
// 任务 5：哈夫曼解码
// 【函数目标】
//   给定哈夫曼树 tree、字符表 chars（chars[i] 对应叶子下标 i，共 n = chars.size() 个字符）
//   以及 0/1 编码比特串 bits，从根出发按 '0' 走左、'1' 走右，还原并返回原始字符串。
// 【画图与思路推导】
//   1. 边界：若 tree.empty() || chars.empty() || bits.empty()，返回 ""；
//   2. 特判单字符情况 chars.size() == 1：
//      由于 n == 1 时约定编码为 "0"，遍历 bits，每遇到一个 '0' 就追加 chars[0]；
//   3. 常规情况（n >= 2）：
//      a) 根节点下标 root = (int)tree.size() - 1（即 2n - 2），设 cur = root；
//      b) 遍历 bits 中的每个字符 ch：
//           若 ch == '0'，cur = tree[cur].lchild;
//           否则若 ch == '1'，cur = tree[cur].rchild;
//           检查是否走到叶子（tree[cur].lchild == -1 && tree[cur].rchild == -1）：
//             若是叶子：result.push_back(chars[cur]);
//                       cur = root; // 重置回根，准备解码下一个字符！
//   4. 返回 result。
// 【边界提醒】
//   - 到达叶子输出一个字符后，必须把 cur 重置回 root，否则下一步会访问 tree[-1] 崩溃！
//   - n == 1 时根节点本身就是叶子（lchild == -1），若不特判直接走 lchild 会越界！
// ----------------------------------------------------------------------------
std::string decodeHuffman(const std::vector<HNode>& tree,
                          const std::vector<char>& chars,
                          const std::string& bits) {
    // TODO: 从根按 '0' 走左、'1' 走右解码还原原文
    (void)tree;
    (void)chars;
    (void)bits;
    return "";
}

// ============================================================================
// [测试辅助] 校验编码表是否满足前缀码性质，及按编码表编码字符串（请勿修改）
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
// 自动测试套件（请勿修改 main 函数，保持与评测系统一致）
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
