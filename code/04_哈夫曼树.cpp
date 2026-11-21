// ============================================================
// 04_哈夫曼树.cpp
// 配套笔记：第 4 章 树 → 4.5 哈夫曼树的应用
//
// 内容：哈夫曼树构造 + 编码表 + 编码 + 解码 + 压缩率统计
//
// 编译运行：
//   g++ -std=c++11 04_哈夫曼树.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <queue>
#include <vector>
#include <map>
#include <string>
#include <iomanip>
#include <cstdio>
#include <algorithm>
using namespace std;

// ---------- 哈夫曼树节点 ----------
struct HTNode {
    char   ch;          // 叶子节点对应的字符（内部节点为 '\0'）
    int    weight;      // 权值（频率）
    HTNode* left;
    HTNode* right;

    HTNode(char c, int w) : ch(c), weight(w), left(nullptr), right(nullptr) {}
    bool isLeaf() const { return left == nullptr && right == nullptr; }
};

// ---------- 优先队列的比较器（小顶堆） ----------
struct Compare {
    bool operator()(HTNode* a, HTNode* b) {
        return a->weight > b->weight;    // 权值小的优先级高
    }
};

// ============================================================
// 一、构造哈夫曼树
// ============================================================
HTNode* buildHuffmanTree(const map<char, int>& freq) {
    priority_queue<HTNode*, vector<HTNode*>, Compare> pq;

    // ① 每个字符建一个单节点树
    for (auto& kv : freq) {
        pq.push(new HTNode(kv.first, kv.second));
    }

    cout << "  构造过程（每次取最小的两个合并）:" << endl;

    int step = 0;
    // ② 反复取最小的两个合并
    while (pq.size() > 1) {
        HTNode* a = pq.top(); pq.pop();
        HTNode* b = pq.top(); pq.pop();

        step++;
        cout << "    第" << step << "步: 合并 "
             << (a->isLeaf() ? string(1, a->ch) : "内部")
             << "(" << a->weight << ") 和 "
             << (b->isLeaf() ? string(1, b->ch) : "内部")
             << "(" << b->weight << ")"
             << " → 新节点(" << a->weight + b->weight << ")" << endl;

        HTNode* parent = new HTNode('\0', a->weight + b->weight);
        parent->left = a;
        parent->right = b;
        pq.push(parent);
    }

    return pq.top();
}

// ============================================================
// 二、生成编码表（左 0 右 1）
// ============================================================
void buildCodeTable(HTNode* p, string code, map<char, string>& table) {
    if (p == nullptr) return;

    if (p->isLeaf()) {
        table[p->ch] = code.empty() ? "0" : code;   // 只有一个字符时的特殊处理
        return;
    }
    buildCodeTable(p->left,  code + "0", table);    // 左走加 0
    buildCodeTable(p->right, code + "1", table);    // 右走加 1
}

// ============================================================
// 三、编码
// ============================================================
string encode(const string& text, const map<char, string>& table) {
    string result;
    for (char c : text) {
        result += table.at(c);
    }
    return result;
}

// ============================================================
// 四、解码
// ============================================================
string decode(HTNode* root, const string& encoded) {
    string result;
    HTNode* p = root;

    for (char bit : encoded) {
        p = (bit == '0') ? p->left : p->right;

        if (p->isLeaf()) {          // 走到叶子，输出一个字符
            result += p->ch;
            p = root;               // ★ 回到根，准备解下一个
        }
    }
    return result;
}

// ============================================================
// 五、计算 WPL
// ============================================================
int calcWPL(HTNode* p, int depth) {
    if (p == nullptr) return 0;
    if (p->isLeaf()) return p->weight * depth;
    return calcWPL(p->left, depth + 1) + calcWPL(p->right, depth + 1);
}

// ---------- 辅助：计算所有非叶节点的权值和（用于验证 WPL） ----------
int sumInternal(HTNode* p) {
    if (p == nullptr || p->isLeaf()) return 0;
    return p->weight + sumInternal(p->left) + sumInternal(p->right);
}

// ---------- 辅助：计算百分比字符串 ----------
string percent(long long part, long long total) {
    if (total == 0) return "0%";
    double p = 100.0 * part / total;
    char buf[32];
    snprintf(buf, sizeof(buf), "%.1f%%", p);
    return string(buf);
}

// ---------- 释放 ----------
void destroy(HTNode* p) {
    if (!p) return;
    destroy(p->left);
    destroy(p->right);
    delete p;
}

// ---------- 打印树（横向） ----------
void printTree(HTNode* p, int depth = 0) {
    if (!p) return;
    printTree(p->right, depth + 1);
    cout << string(depth * 4, ' ');
    if (p->isLeaf()) cout << "'" << p->ch << "'(" << p->weight << ")";
    else             cout << "(" << p->weight << ")";
    cout << endl;
    printTree(p->left, depth + 1);
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  哈夫曼树 与 哈夫曼编码" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 例1：教材例子 A:7 B:5 C:2 D:4 ----------
    cout << "【例1】权值 A:7, B:5, C:2, D:4" << endl;
    cout << "----------------------------------------" << endl;

    map<char, int> freq1 = {{'A',7}, {'B',5}, {'C',2}, {'D',4}};
    HTNode* root1 = buildHuffmanTree(freq1);
    cout << endl;

    cout << "  哈夫曼树结构（横过来看，右子树在上）:" << endl;
    printTree(root1);
    cout << endl;

    map<char, string> table1;
    buildCodeTable(root1, "", table1);

    cout << "  编码表（左0右1）:" << endl;
    for (auto& kv : table1) {
        cout << "    " << kv.first << " (权值" << freq1[kv.first] << ") → "
             << kv.second << "  （" << kv.second.size() << " 位）" << endl;
    }
    cout << endl;

    int wpl1 = calcWPL(root1, 0);
    int internal1 = sumInternal(root1);
    cout << "  WPL = " << wpl1 << endl;
    cout << "  验证（非叶节点权值和）= " << internal1
         << (wpl1 == internal1 ? "  ✓ 一致" : "  ✗ 不一致") << endl;
    cout << endl;

    // ---------- 例2：实际文本压缩 ----------
    cout << "【例2】实际文本压缩演示" << endl;
    cout << "----------------------------------------" << endl;

    string text = "AAAAABBBCCDAAAAABBBCCDAAAAABBBCCDAAAAABBBCCDAAAAAB";
    cout << "  原文: \"" << text << "\"" << endl;
    cout << "  长度 = " << text.size() << " 个字符" << endl << endl;

    // 统计频率
    map<char, int> freq2;
    for (char c : text) freq2[c]++;

    cout << "  字符频率统计:" << endl;
    for (auto& kv : freq2) {
        cout << "    '" << kv.first << "': " << kv.second << " 次" << endl;
    }
    cout << endl;

    HTNode* root2 = buildHuffmanTree(freq2);
    cout << endl;

    map<char, string> table2;
    buildCodeTable(root2, "", table2);

    cout << "  编码表:" << endl;
    for (auto& kv : table2) {
        cout << "    '" << kv.first << "' → " << kv.second << endl;
    }
    cout << endl;

    // 编码
    string encoded = encode(text, table2);
    cout << "  编码结果（前 80 位）: " << encoded.substr(0, min((size_t)80, encoded.size())) << "..." << endl;
    cout << "  编码后总长度 = " << encoded.size() << " 位" << endl;
    cout << endl;

    // 对比等长编码
    int charKinds = freq2.size();
    int bitsPerChar = 1;
    while ((1 << bitsPerChar) < charKinds) bitsPerChar++;   // 计算需要的位数
    int fixedLen = text.size() * bitsPerChar;

    cout << "  对比：" << endl;
    cout << "    等长编码（每个字符 " << bitsPerChar << " 位）: "
         << fixedLen << " 位" << endl;
    cout << "    哈夫曼编码: " << encoded.size() << " 位" << endl;
    cout << "    占等长编码的: " << percent(encoded.size(), fixedLen) << endl;
    cout << endl;

    // 解码验证
    string decoded = decode(root2, encoded);
    cout << "  解码验证: " << (decoded == text ? "✓ 完全还原" : "✗ 解码错误！") << endl;
    cout << endl;

    // ---------- 例3：英文文本 ----------
    cout << "【例3】英文文本的编码效果" << endl;
    cout << "----------------------------------------" << endl;

    string english = "the quick brown fox jumps over the lazy dog "
                     "the quick brown fox jumps over the lazy dog";

    map<char, int> freq3;
    for (char c : english) freq3[c]++;

    HTNode* root3 = buildHuffmanTree(freq3);
    map<char, string> table3;
    buildCodeTable(root3, "", table3);

    cout << endl << "  编码表（按编码长度排序，前 12 个）:" << endl;
    vector<pair<char,string>> codes(table3.begin(), table3.end());
    sort(codes.begin(), codes.end(),
         [](const pair<char,string>& a, const pair<char,string>& b) {
             return a.second.size() < b.second.size();
         });
    for (int i = 0; i < 12 && i < (int)codes.size(); i++) {
        cout << "    '" << (codes[i].first == ' ' ? "空格" : string(1,codes[i].first))
             << "' (频率" << freq3[codes[i].first] << ") → " << codes[i].second << endl;
    }
    cout << endl;

    string enc3 = encode(english, table3);
    cout << "  原文长度: " << english.size() << " 字符" << endl;
    cout << "  ASCII 编码: " << english.size() * 8 << " 位（每字符 8 位）" << endl;
    cout << "  哈夫曼编码: " << enc3.size() << " 位" << endl;
    cout << "  → 压缩到原来的 "
         << percent(enc3.size(), english.size() * 8) << endl;

    int wpl3 = calcWPL(root3, 0);
    cout << "  WPL = " << wpl3 << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. 每次合并权值最小的两个节点" << endl;
    cout << "  2. 左分支记 0，右分支记 1" << endl;
    cout << "  3. 频率高的字符编码短 → 总长度最小" << endl;
    cout << "  4. 所有字符都在叶子上 → 天然前缀编码 → 解码无歧义" << endl;
    cout << "  5. WPL = 所有非叶节点权值之和" << endl;
    cout << "========================================" << endl;

    // 清理
    destroy(root1);
    destroy(root2);
    destroy(root3);

    return 0;
}
