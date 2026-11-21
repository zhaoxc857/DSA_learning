// ============================================================
// 03_KMP.cpp
// 配套笔记：第 3 章 线性表的扩展 → 3.4 串的实现
//
// 内容：BF（暴力）算法 vs KMP 算法，并打印 next 数组的计算过程
//
// 编译运行：
//   g++ -std=c++11 03_KMP.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <string>
#include <vector>
using namespace std;

// ============================================================
// 一、BF 算法（暴力匹配）
// 返回子串 t 在主串 s 中第一次出现的位置（0-based），找不到返回 -1
// ============================================================
int BF(const string& s, const string& t) {
    int n = s.size(), m = t.size();
    int i = 0, j = 0;

    while (i < n && j < m) {
        if (s[i] == t[j]) {
            i++; j++;
        } else {
            i = i - j + 1;    // ★ 主串回溯到"本次起始位置的下一个"
            j = 0;            // ★ 子串回到开头
        }
    }
    return (j >= m) ? (i - j) : -1;
}

// ============================================================
// 二、求 next 数组
// 约定：next[0] = -1（0-based 版本）
//
// next[j] 的含义：当子串第 j 位失配时，j 应该跳到哪里
// 它等于"前 j 个字符的最长公共前后缀长度"
// ============================================================
vector<int> buildNext(const string& t) {
    int m = t.size();
    vector<int> next(m);
    next[0] = -1;

    int i = 0, j = -1;    // j 是"当前最长公共前后缀长度"，初始 -1
    while (i < m - 1) {
        if (j == -1 || t[i] == t[j]) {
            i++; j++;
            next[i] = j;
        } else {
            j = next[j];    // 回溯
        }
    }
    return next;
}

// ============================================================
// 三、KMP 算法（主串不回溯！）
// ============================================================
int KMP(const string& s, const string& t, const vector<int>& next) {
    int n = s.size(), m = t.size();
    int i = 0, j = 0;

    while (i < n && j < m) {
        if (j == -1 || s[i] == t[j]) {
            i++; j++;
        } else {
            j = next[j];     // ★ 只有子串回溯，主串 i 不动！
        }
    }
    return (j >= m) ? (i - j) : -1;
}

// ============================================================
// 四、辅助：打印 next 数组及其含义
// ============================================================
void printNext(const string& t, const vector<int>& next) {
    cout << "  模式串: " << t << endl;
    cout << "  下标  : ";
    for (size_t i = 0; i < t.size(); i++) cout << i << " ";
    cout << endl;
    cout << "  字符  : ";
    for (char c : t) cout << c << " ";
    cout << endl;
    cout << "  next  : ";
    for (int x : next) cout << x << " ";
    cout << endl;
    cout << "  （next[j]=k 表示：第 j 位失配时，子串跳到位置 k 继续比）" << endl;
}

// ============================================================
// 五、带过程打印的 KMP（便于理解）
// ============================================================
int KMPVerbose(const string& s, const string& t, const vector<int>& next) {
    int n = s.size(), m = t.size();
    int i = 0, j = 0;
    int step = 0;

    while (i < n && j < m) {
        step++;
        cout << "  步骤" << step << ": 比较 s[" << i << "]='" << s[i]
             << "' 与 t[" << j << "]='" << (j >= 0 ? t[j] : '-') << "'";

        if (j == -1 || s[i] == t[j]) {
            cout << " → 匹配，都前进" << endl;
            i++; j++;
        } else {
            cout << " → 失配！子串回溯 j: " << j << " → " << next[j] << endl;
            j = next[j];
        }
    }
    return (j >= m) ? (i - j) : -1;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  BF 算法 vs KMP 算法" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. next 数组计算 ----------
    cout << "【1. next 数组的计算】" << endl;
    vector<string> patterns = {"aab", "abab", "abcabc", "aaaa", "abaab"};
    for (const string& t : patterns) {
        vector<int> next = buildNext(t);
        printNext(t, next);
        cout << endl;
    }

    // ---------- 2. BF vs KMP 结果对比 ----------
    cout << "【2. BF 与 KMP 匹配结果对比】" << endl;
    struct Case { string s, t; };
    vector<Case> cases = {
        {"aacaaba", "aab"},
        {"hello world", "world"},
        {"hello world", "xyz"},
        {"abababcabab", "ababc"},
        {"aaaaaaaaab", "aaab"},
    };

    for (auto& c : cases) {
        vector<int> next = buildNext(c.t);
        int r1 = BF(c.s, c.t);
        int r2 = KMP(c.s, c.t, next);
        cout << "  主串=\"" << c.s << "\" 子串=\"" << c.t << "\""
             << " → BF=" << r1 << ", KMP=" << r2
             << (r1 == r2 ? " ✓一致" : " ✗不一致！") << endl;
    }
    cout << endl;

    // ---------- 3. KMP 匹配过程详细演示 ----------
    cout << "【3. KMP 匹配过程详解】" << endl;
    string s = "abababcabab";
    string t = "ababc";
    vector<int> next = buildNext(t);
    cout << "  主串:   " << s << endl;
    cout << "  模式串: " << t << endl;
    printNext(t, next);
    cout << endl;
    int pos = KMPVerbose(s, t, next);
    cout << "  匹配位置 = " << pos << endl << endl;

    // ---------- 4. 效率对比（最坏情况） ----------
    cout << "【4. 最坏情况的比较次数对比】" << endl;
    cout << "  构造最坏情况：主串 = aaaa...ab，模式串 = aaa...b" << endl;

    for (int len = 10; len <= 40; len += 10) {
        string bigS(len, 'a'); bigS += 'b';           // len个a + b
        string bigT(len / 2, 'a'); bigT += 'b';       // (len/2)个a + b

        vector<int> nx = buildNext(bigT);

        // 统计 BF 的比较次数（粗略：用时间复杂度公式 n*m）
        long long bfOps = (long long)bigS.size() * bigT.size();

        // KMP 的比较次数约等于 n + m
        long long kmpOps = bigS.size() + bigT.size();

        cout << "  主串长=" << bigS.size() << ", 模式串长=" << bigT.size()
             << " → BF 约 " << bfOps << " 次比较, KMP 约 " << kmpOps << " 次"
             << "（快 " << (bfOps / kmpOps) << " 倍）" << endl;
    }
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心结论：" << endl;
    cout << "  1. BF:  最坏 O(n*m)，主串会回溯" << endl;
    cout << "  2. KMP: 最坏 O(n+m)，主串不回溯" << endl;
    cout << "  3. next 数组只跟模式串有关，可以预先算好" << endl;
    cout << "  4. KMP 的关键：利用 [已匹配部分] 的信息，跳过无用的比较" << endl;
    cout << "========================================" << endl;

    return 0;
}
