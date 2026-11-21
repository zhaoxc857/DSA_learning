/**
 * ============================================================================
 * 关卡 01：时间复杂度对比与字符频次统计（参考答案）
 * 对应章节：教材第 1 章《1.5 工程实践和思考》例 1.8（CountChar1 vs CountChar2）
 *          + 有序数组双指针降维体验（O(n^2) -> O(n)）
 * ============================================================================
 */

#include <cstring>
#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct CharResult {
    char ch;
    int num;
};

// ============================================================================
// 函数 1：字符频次统计 —— 版本 1（教材例 1.8，结构体数组线性查找 O(mn)）
// ============================================================================
void countCharV1(const char* s, CharResult r[], int& n) {
    n = 0;
    if (s == nullptr) {
        return;
    }
    for (int i = 0; s[i] != '\0'; ++i) {
        int j = 0;
        for (; j < n; ++j) {
            if (r[j].ch == s[i]) {
                r[j].num++;
                break;
            }
        }
        if (j == n) {
            r[n].ch = s[i];
            r[n].num = 1;
            n++;
        }
    }
}

// ============================================================================
// 函数 2：字符频次统计 —— 版本 2（教材例 1.8，ASCII 桶计数 O(m)）
// ============================================================================
void countCharV2(const char* s, int chnum[128]) {
    for (int i = 0; i < 128; ++i) {
        chnum[i] = 0;
    }
    if (s == nullptr) {
        return;
    }
    for (int i = 0; s[i] != '\0'; ++i) {
        unsigned char uc = static_cast<unsigned char>(s[i]);
        if (uc < 128) {
            chnum[uc]++;
        }
    }
}

// ============================================================================
// 函数 3：有序数组两数之和的对数统计（双指针 O(n)）
// ============================================================================
int countPairsSumTarget(const int a[], int n, int target) {
    if (a == nullptr || n < 2) {
        return 0;
    }
    int left = 0;
    int right = n - 1;
    int cnt = 0;
    while (left < right) {
        long long sum = static_cast<long long>(a[left]) + a[right];
        if (sum == target) {
            ++cnt;
            ++left;
            --right;
        } else if (sum < target) {
            ++left;
        } else {
            --right;
        }
    }
    return cnt;
}

// ============================================================================
// 以下为自动测试代码（与 lab01_todo.cpp 保持完全一致）
// ============================================================================
namespace {

int findInV1(const CharResult r[], int n, char target) {
    for (int i = 0; i < n; ++i) {
        if (r[i].ch == target) {
            return r[i].num;
        }
    }
    return 0;
}

bool compareV1AndV2(const CharResult r[], int n, const int chnum[128]) {
    if (n < 0 || n > 128) return false;
    int seen[128] = {0};
    for (int i = 0; i < n; ++i) {
        unsigned char uc = static_cast<unsigned char>(r[i].ch);
        if (uc >= 128) return false;
        if (seen[uc] != 0) return false;
        seen[uc] = r[i].num;
    }
    for (int c = 0; c < 128; ++c) {
        if (seen[c] != chnum[c]) return false;
    }
    return true;
}

} // namespace

int main() {
    labtest::beginLab("Lab 01：复杂度对比、字符频次统计(例1.8)与双指针");

    // --- 1. 教材例 1.8 原句测试 ---
    {
        const char* sentence =
            "This is a problem which can be solved by data structure method.";
        CharResult r[128];
        int n = 999;
        countCharV1(sentence, r, n);

        int chnum[128];
        for (int i = 0; i < 128; ++i) chnum[i] = 777;
        countCharV2(sentence, chnum);

        labtest::expectEqInt("例1.8 原句 V1 不同字符种类数", 22, n,
                             "请检查 countCharV1 是否先置 n=0，且区分大小写并统计空格和句号");
        labtest::expectTrue("例1.8 原句 V1 首个记录字符为 'T'", n > 0 && r[0].ch == 'T',
                            "countCharV1 应按字符首次出现顺序追加到 r[0..n-1]");
        labtest::expectEqInt("例1.8 原句 V1 空格 ' ' 次数", 11, findInV1(r, n, ' '),
                             "句子中共有 11 个空格，请检查外层循环是否完整遍历到 '\\0'");
        labtest::expectEqInt("例1.8 原句 V1 字母 'e' 次数", 5, findInV1(r, n, 'e'),
                             "请检查内层循环找到相同字符后是否正确执行 r[j].num++");
        labtest::expectEqInt("例1.8 原句 V1 大写 'T' 与小写 't' 区分", 4, findInV1(r, n, 't'),
                             "小写 't' 出现 4 次，大写 'T' 出现 1 次，二者不应混淆");

        labtest::expectEqInt("例1.8 原句 V2 空格 ' ' 次数", 11, chnum[static_cast<unsigned char>(' ')],
                             "请检查 countCharV2 是否先将 chnum[0..127] 全部清零再累加");
        labtest::expectEqInt("例1.8 原句 V2 字母 'e' 次数", 5, chnum[static_cast<unsigned char>('e')],
                             "请检查是否以 static_cast<unsigned char>(s[i]) 作为下标累加");
        labtest::expectEqInt("例1.8 原句 V2 句号 '.' 次数", 1, chnum[static_cast<unsigned char>('.')],
                             "请检查是否漏掉了最后一个字符 '.'");
        labtest::expectEqInt("例1.8 原句 V2 未出现字符 'z' 次数为 0", 0, chnum[static_cast<unsigned char>('z')],
                             "未出现的字符对应下标必须为 0，请检查是否对 chnum[0..127] 清零");

        int sumV2 = 0;
        for (int c = 0; c < 128; ++c) sumV2 += chnum[c];
        labtest::expectEqInt("例1.8 原句 V2 频次总和等于串长 63",
                             static_cast<int>(std::strlen(sentence)), sumV2,
                             "所有字符频次之和应等于字符串总长度");

        labtest::expectTrue("例1.8 原句 V1 与 V2 统计结果完全一致",
                            compareV1AndV2(r, n, chnum),
                            "V1 和 V2 统计的是同一句话，所有 128 个 ASCII 字符计数应完全一致且 V1 无重复项");
    }

    // --- 2. 字符统计边界测试：空串、nullptr、单字符、全重复 ---
    {
        CharResult r[128];
        int n = 42;
        int chnum[128];
        for (int i = 0; i < 128; ++i) chnum[i] = 5;

        countCharV1("", r, n);
        countCharV2("", chnum);
        labtest::expectEqInt("空串 V1 种类数为 0", 0, n,
                             "空串 \"\" 不含任何字符，n 应为 0");
        bool allZero = true;
        for (int c = 0; c < 128; ++c) {
            if (chnum[c] != 0) allZero = false;
        }
        labtest::expectTrue("空串 V2 计数数组全为 0", allZero,
                            "即使是空串，countCharV2 也必须先把 chnum[0..127] 清零");

        n = 42;
        for (int i = 0; i < 128; ++i) chnum[i] = 9;
        countCharV1(nullptr, r, n);
        countCharV2(nullptr, chnum);
        labtest::expectEqInt("nullptr 传入 V1 安全返回 n=0", 0, n,
                             "s == nullptr 时应先置 n=0 再安全返回，不可解引用 s");
        bool allZeroNull = true;
        for (int c = 0; c < 128; ++c) {
            if (chnum[c] != 0) allZeroNull = false;
        }
        labtest::expectTrue("nullptr 传入 V2 安全且数组全为 0", allZeroNull,
                            "s == nullptr 时应先清零 chnum[0..127] 再安全返回");

        countCharV1("Z", r, n);
        countCharV2("Z", chnum);
        labtest::expectTrue("单字符 \"Z\" V1 结果正确", n == 1 && r[0].ch == 'Z' && r[0].num == 1,
                            "单字符时 n 应为 1，r[0] 为 {'Z', 1}");
        labtest::expectTrue("单字符 \"Z\" V1 与 V2 一致", compareV1AndV2(r, n, chnum),
                            "请检查单字符场景下 V1 与 V2 是否都只统计了 'Z' 一次");

        countCharV1("aaaaaaa", r, n);
        countCharV2("aaaaaaa", chnum);
        labtest::expectTrue("全重复字符 \"aaaaaaa\" V1 合并为 1 项且计数 7",
                            n == 1 && r[0].ch == 'a' && r[0].num == 7,
                            "相同字符不应重复追加新槽位，应在原有槽位 num++");
        labtest::expectEqInt("全重复字符 \"aaaaaaa\" V2 计数为 7", 7,
                             chnum[static_cast<unsigned char>('a')],
                             "7 个 'a' 在 chnum['a'] 中应为 7");
    }

    // --- 3. 双指针 countPairsSumTarget 测试 ---
    {
        int a1[] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        labtest::expectEqInt("双指针多解 [1..9] target=10", 4,
                             countPairsSumTarget(a1, 9, 10),
                             "应找到 (1,9),(2,8),(3,7),(4,6) 共 4 对；找到一对后记得 left++ 且 right--");

        int a2[] = {-5, -2, 0, 2, 3, 5, 7};
        labtest::expectEqInt("双指针含负数 target=5", 3,
                             countPairsSumTarget(a2, 7, 5),
                             "应找到 (-2,7),(0,5),(2,3) 共 3 对，注意数组含负数也完全适用双指针");

        int a3[] = {1, 3, 5, 8, 12};
        labtest::expectEqInt("双指针无解 target=100", 0,
                             countPairsSumTarget(a3, 5, 100),
                             "不存在两数之和等于 100，应返回 0");
        labtest::expectEqInt("双指针禁止同一元素自加 target=2", 0,
                             countPairsSumTarget(a3, 5, 2),
                             "循环条件必须是 left < right，不能把 a[0]+a[0]=1+1 算作一对");

        int a4[] = {3, 7};
        labtest::expectEqInt("双指针两元素刚好配对", 1,
                             countPairsSumTarget(a4, 2, 10),
                             "长度为 2 且 3+7==10，应返回 1");

        int a5[] = {5};
        labtest::expectEqInt("双指针单元素数组返回 0", 0,
                             countPairsSumTarget(a5, 1, 10),
                             "长度小于 2 无法组成数对，应返回 0");

        labtest::expectEqInt("双指针空数组 n=0 返回 0", 0,
                             countPairsSumTarget(a1, 0, 10),
                             "n <= 1 时应直接返回 0");
        labtest::expectEqInt("双指针 nullptr 返回 0", 0,
                             countPairsSumTarget(nullptr, 5, 10),
                             "a == nullptr 时应安全返回 0");
    }

    return labtest::endLab();
}
